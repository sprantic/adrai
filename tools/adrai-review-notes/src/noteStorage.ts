/**
 * adrai Review Notes - Storage Module
 *
 * Handles reading and writing review notes to ~/.adrai/review-notes.yaml
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as vscode from 'vscode';
import * as YAML from 'yaml';
import {
  ReviewNote,
  ReviewNotesStorage,
  NoteLocation,
  NoteType,
  NoteStatus,
  UndoEntry,
  DEFAULT_STORAGE,
  CURRENT_SCHEMA_VERSION,
  MAX_UNDO_ENTRIES
} from './types';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Manages persistent storage of review notes
 */
export class NoteStorage {
  private storagePath: string;
  private cache: ReviewNotesStorage | null = null;
  private watcher: fs.FSWatcher | null = null;
  private onChangeCallbacks: Array<() => void> = [];
  // AIDE-0006: Undo stack for reversible operations
  private undoStack: UndoEntry[] = [];
  private configWatcher: vscode.Disposable | null = null;

  constructor() {
    this.storagePath = this.resolveStoragePath();
    this.ensureStorageDirectory();
    this.setupFileWatcher();
    this.setupConfigWatcher();
  }

  /**
   * AIDE-0006: Watch for config changes that affect storage path
   */
  private setupConfigWatcher(): void {
    this.configWatcher = vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('adrai.projectStorage') || e.affectsConfiguration('adrai.storageLocation')) {
        // Re-resolve storage path and reload
        const newPath = this.resolveStoragePath();
        if (newPath !== this.storagePath) {
          console.log(`[adrai] Storage path changed: ${this.storagePath} -> ${newPath}`);
          this.storagePath = newPath;
          this.cache = null;
          this.ensureStorageDirectory();
          // Update file watcher
          if (this.watcher) {
            this.watcher.close();
          }
          this.setupFileWatcher();
          this.notifyChange();
        }
      }
    });
  }

  /**
   * Resolve the storage path from config, expanding ~ to home directory
   * AIDE-0006: Support project-qualified paths when projectStorage is enabled
   */
  private resolveStoragePath(): string {
    const config = vscode.workspace.getConfiguration('adrai');
    const projectStorage = config.get<boolean>('projectStorage', false);

    // AIDE-0006: If projectStorage enabled, use project-specific path
    if (projectStorage) {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (workspaceFolder) {
        const projectName = path.basename(workspaceFolder.uri.fsPath);
        // Sanitize project name for file system
        const safeProjectName = projectName.replace(/[^a-zA-Z0-9_-]/g, '_');
        return path.join(os.homedir(), '.adrai', safeProjectName, 'review-notes.yaml');
      }
    }

    // Default: use configured path
    let storagePath = config.get<string>('storageLocation', '~/.adrai/review-notes.yaml');

    // Expand ~ to home directory
    if (storagePath.startsWith('~')) {
      storagePath = path.join(os.homedir(), storagePath.slice(1));
    }

    return storagePath;
  }

  /**
   * Ensure the storage directory exists
   */
  private ensureStorageDirectory(): void {
    const dir = path.dirname(this.storagePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Set up file watcher for external changes
   */
  private setupFileWatcher(): void {
    const dir = path.dirname(this.storagePath);

    if (fs.existsSync(dir)) {
      this.watcher = fs.watch(dir, (eventType, filename) => {
        if (filename === path.basename(this.storagePath)) {
          this.cache = null;
          this.notifyChange();
        }
      });
    }
  }

  /**
   * Register a callback for storage changes
   */
  public onChange(callback: () => void): vscode.Disposable {
    this.onChangeCallbacks.push(callback);
    return {
      dispose: () => {
        const index = this.onChangeCallbacks.indexOf(callback);
        if (index > -1) {
          this.onChangeCallbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Notify all registered callbacks of a change
   */
  private notifyChange(): void {
    for (const callback of this.onChangeCallbacks) {
      callback();
    }
  }

  /**
   * Load notes from storage file
   */
  public load(): ReviewNotesStorage {
    if (this.cache) {
      return this.cache;
    }

    if (!fs.existsSync(this.storagePath)) {
      this.cache = { ...DEFAULT_STORAGE };
      return this.cache;
    }

    try {
      const content = fs.readFileSync(this.storagePath, 'utf-8');
      let data = YAML.parse(content) as ReviewNotesStorage;

      // Validate and migrate if needed
      if (!data.version || !data.notes) {
        this.cache = { ...DEFAULT_STORAGE };
        return this.cache;
      }

      // Migrate from older schema versions
      if (data.version !== CURRENT_SCHEMA_VERSION) {
        data = this.migrateSchema(data);
        this.save(data); // Persist migrated data
      }

      this.cache = data;
      return this.cache;
    } catch (error) {
      console.error('Failed to load review notes:', error);
      vscode.window.showErrorMessage(`Failed to load review notes: ${error}`);
      this.cache = { ...DEFAULT_STORAGE };
      return this.cache;
    }
  }

  /**
   * Save notes to storage file
   */
  public save(storage: ReviewNotesStorage): void {
    try {
      const content = YAML.stringify(storage, {
        indent: 2,
        lineWidth: 120
      });
      fs.writeFileSync(this.storagePath, content, 'utf-8');
      this.cache = storage;
    } catch (error) {
      console.error('Failed to save review notes:', error);
      vscode.window.showErrorMessage(`Failed to save review notes: ${error}`);
    }
  }

  /**
   * Get all notes
   */
  public getAllNotes(): ReviewNote[] {
    return this.load().notes;
  }

  /**
   * Get notes filtered by status
   */
  public getNotesByStatus(status: NoteStatus): ReviewNote[] {
    return this.getAllNotes().filter(note => note.status === status);
  }

  /**
   * Get notes filtered by type
   */
  public getNotesByType(type: NoteType): ReviewNote[] {
    return this.getAllNotes().filter(note => note.type === type);
  }

  /**
   * Get a note by ID
   */
  public getNote(id: string): ReviewNote | undefined {
    return this.getAllNotes().find(note => note.id === id);
  }

  /**
   * Add a new note
   */
  public addNote(note: ReviewNote): void {
    const storage = this.load();
    storage.notes.push(note);
    this.save(storage);
    this.notifyChange();
  }

  /**
   * Update an existing note
   * AIDE-0006: Captures snapshot for undo
   */
  public updateNote(id: string, updates: Partial<ReviewNote>): void {
    const storage = this.load();
    const index = storage.notes.findIndex(note => note.id === id);

    if (index === -1) {
      throw new Error(`Note with ID ${id} not found`);
    }

    // AIDE-0006: Capture snapshot before update for undo
    this.pushUndo('update', storage.notes[index]);

    storage.notes[index] = {
      ...storage.notes[index],
      ...updates,
      updated: new Date().toISOString()
    };

    this.save(storage);
    this.notifyChange();
  }

  /**
   * Delete a note
   * AIDE-0006: Captures snapshot for undo
   */
  public deleteNote(id: string): void {
    const storage = this.load();
    const index = storage.notes.findIndex(note => note.id === id);

    if (index === -1) {
      throw new Error(`Note with ID ${id} not found`);
    }

    // AIDE-0006: Capture snapshot before delete for undo
    this.pushUndo('delete', storage.notes[index]);

    storage.notes.splice(index, 1);
    this.save(storage);
    this.notifyChange();
  }

  /**
   * Add a location to an existing note
   */
  public addLocation(noteId: string, location: NoteLocation): void {
    const note = this.getNote(noteId);
    if (!note) {
      throw new Error(`Note with ID ${noteId} not found`);
    }

    // Check for duplicate location
    const exists = note.locations.some(
      loc => loc.file === location.file && loc.line === location.line
    );

    if (exists) {
      vscode.window.showWarningMessage('This location is already linked to the note');
      return;
    }

    this.updateNote(noteId, {
      locations: [...note.locations, location]
    });
  }

  /**
   * Remove a location from a note
   */
  public removeLocation(noteId: string, file: string, line: number): void {
    const note = this.getNote(noteId);
    if (!note) {
      throw new Error(`Note with ID ${noteId} not found`);
    }

    const newLocations = note.locations.filter(
      loc => !(loc.file === file && loc.line === line)
    );

    if (newLocations.length === 0) {
      // If no locations left, delete the note
      this.deleteNote(noteId);
    } else {
      this.updateNote(noteId, { locations: newLocations });
    }
  }

  /**
   * Get storage file path
   */
  public getStoragePath(): string {
    return this.storagePath;
  }

  /**
   * Dispose of resources
   */
  public dispose(): void {
    if (this.watcher) {
      this.watcher.close();
    }
    if (this.configWatcher) {
      this.configWatcher.dispose();
    }
    this.onChangeCallbacks = [];
    this.undoStack = [];
  }

  /**
   * AIDE-0006: Push an entry onto the undo stack
   */
  private pushUndo(operation: 'delete' | 'update', note: ReviewNote): void {
    // Deep clone the note to preserve its state
    const snapshot = JSON.parse(JSON.stringify(note));

    this.undoStack.push({
      operation,
      noteId: note.id,
      snapshot,
      timestamp: new Date().toISOString()
    });

    // Limit stack size
    if (this.undoStack.length > MAX_UNDO_ENTRIES) {
      this.undoStack.shift();
    }
  }

  /**
   * AIDE-0006: Undo the last operation
   * Returns the restored/reverted note, or undefined if nothing to undo
   */
  public undo(): ReviewNote | undefined {
    const entry = this.undoStack.pop();
    if (!entry) {
      return undefined;
    }

    const storage = this.load();

    if (entry.operation === 'delete') {
      // Restore deleted note
      storage.notes.push(entry.snapshot);
    } else if (entry.operation === 'update') {
      // Revert to previous state
      const index = storage.notes.findIndex(note => note.id === entry.noteId);
      if (index !== -1) {
        storage.notes[index] = entry.snapshot;
      } else {
        // Note was deleted after update, restore it
        storage.notes.push(entry.snapshot);
      }
    }

    this.save(storage);
    this.notifyChange();

    return entry.snapshot;
  }

  /**
   * AIDE-0006: Check if there are entries in the undo stack
   */
  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * AIDE-0006: Get the number of entries in the undo stack
   */
  public getUndoCount(): number {
    return this.undoStack.length;
  }

  /**
   * Migrate storage schema to current version
   */
  private migrateSchema(data: ReviewNotesStorage): ReviewNotesStorage {
    let version = data.version;

    // Migration from 1.0 to 1.1: Add branch field (null = all branches)
    if (version === '1.0') {
      console.log('Migrating review notes schema from 1.0 to 1.1');
      // Notes without branch field are visible in all branches
      // No changes needed to notes array - branch field is optional
      version = '1.1';
    }

    return {
      ...data,
      version: CURRENT_SCHEMA_VERSION
    };
  }
}

/**
 * Generate a UUID v4
 */
export function generateId(): string {
  // Simple UUID v4 implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Create a new review note with defaults
 */
export function createNote(
  content: string,
  type: NoteType,
  locations: NoteLocation[],
  tags?: string[],
  branch?: string,
  status: NoteStatus = 'open'
): ReviewNote {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    content,
    type,
    status,
    created: now,
    updated: now,
    locations,
    tags,
    branch
  };
}

/**
 * Get the current git branch name
 */
export async function getCurrentBranch(): Promise<string | undefined> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    return undefined;
  }

  try {
    const { stdout } = await execAsync('git rev-parse --abbrev-ref HEAD', {
      cwd: workspaceFolder.uri.fsPath
    });
    return stdout.trim();
  } catch {
    // Not a git repository or git not available
    return undefined;
  }
}

/**
 * Check if a git branch exists
 */
export async function branchExists(branchName: string): Promise<boolean> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    return false;
  }

  try {
    const { stdout } = await execAsync(`git branch --list "${branchName}"`, {
      cwd: workspaceFolder.uri.fsPath
    });
    return stdout.trim().length > 0;
  } catch {
    return false;
  }
}

/**
 * AIDE-0006: Check if current workspace is a git repository
 */
export async function isGitRepository(): Promise<boolean> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    return false;
  }

  try {
    await execAsync('git rev-parse --is-inside-work-tree', {
      cwd: workspaceFolder.uri.fsPath
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get preview text from a file at a specific line
 */
export async function getLinePreview(
  filePath: string,
  line: number,
  maxLength: number = 80
): Promise<string> {
  try {
    const document = await vscode.workspace.openTextDocument(filePath);
    const lineText = document.lineAt(line - 1).text.trim();
    return lineText.length > maxLength
      ? lineText.substring(0, maxLength) + '...'
      : lineText;
  } catch {
    return '';
  }
}
