/**
 * adrAI Review Notes - Storage Module
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
  DEFAULT_STORAGE
} from './types';

/**
 * Manages persistent storage of review notes
 */
export class NoteStorage {
  private storagePath: string;
  private cache: ReviewNotesStorage | null = null;
  private watcher: fs.FSWatcher | null = null;
  private onChangeCallbacks: Array<() => void> = [];

  constructor() {
    this.storagePath = this.resolveStoragePath();
    this.ensureStorageDirectory();
    this.setupFileWatcher();
  }

  /**
   * Resolve the storage path from config, expanding ~ to home directory
   */
  private resolveStoragePath(): string {
    const config = vscode.workspace.getConfiguration('adts');
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
      const data = YAML.parse(content) as ReviewNotesStorage;

      // Validate and migrate if needed
      if (!data.version || !data.notes) {
        this.cache = { ...DEFAULT_STORAGE };
        return this.cache;
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
   */
  public updateNote(id: string, updates: Partial<ReviewNote>): void {
    const storage = this.load();
    const index = storage.notes.findIndex(note => note.id === id);

    if (index === -1) {
      throw new Error(`Note with ID ${id} not found`);
    }

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
   */
  public deleteNote(id: string): void {
    const storage = this.load();
    const index = storage.notes.findIndex(note => note.id === id);

    if (index === -1) {
      throw new Error(`Note with ID ${id} not found`);
    }

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
    this.onChangeCallbacks = [];
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
  tags?: string[]
): ReviewNote {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    content,
    type,
    status: 'open',
    created: now,
    updated: now,
    locations,
    tags
  };
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
