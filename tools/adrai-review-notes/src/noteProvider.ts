/**
 * adrai Review Notes - TreeView Data Provider
 *
 * Provides data for the VS Code sidebar panel showing review notes.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import {
  ReviewNote,
  NoteLocation,
  NoteType,
  NoteStatus,
  NOTE_TYPE_ICONS,
  NOTE_TYPE_LABELS,
  NOTE_TYPES_ORDERED,
  STATUS_ICONS,
  STATUS_LABELS
} from './types';
import { NoteStorage, getCurrentBranch } from './noteStorage';

/**
 * Context value types for tree items
 */
export type TreeItemContextValue = 'group' | 'note' | 'note-other-branch' | 'location' | 'location-stale';

/**
 * Tree item representing a note, location, or group header
 */
export class NoteTreeItem extends vscode.TreeItem {
  public readonly itemType: TreeItemContextValue;
  public readonly data?: ReviewNote | NoteLocation;
  public readonly noteId?: string;

  constructor(
    label: string | vscode.TreeItemLabel,
    collapsibleState: vscode.TreeItemCollapsibleState,
    itemType: TreeItemContextValue,
    data?: ReviewNote | NoteLocation,
    noteId?: string
  ) {
    super(label, collapsibleState);
    this.itemType = itemType;
    this.data = data;
    this.noteId = noteId;
    this.contextValue = itemType;
  }
}

/**
 * Filter state for notes
 */
export interface FilterState {
  searchQuery?: string;
  typeFilter?: NoteType;
  branchFilterEnabled: boolean;
}

/**
 * MIME type for internal note drag/drop
 */
const NOTE_DRAG_MIME_TYPE = 'application/vnd.code.tree.adraireviewnotesnote';

/**
 * TreeDataProvider for the Review Notes panel
 * Also implements TreeDragAndDropController for status changes via drag/drop
 */
export class NoteProvider implements vscode.TreeDataProvider<NoteTreeItem>, vscode.TreeDragAndDropController<NoteTreeItem> {
  // Drag and drop configuration
  readonly dragMimeTypes = [NOTE_DRAG_MIME_TYPE];
  readonly dropMimeTypes = [NOTE_DRAG_MIME_TYPE];
  private _onDidChangeTreeData = new vscode.EventEmitter<NoteTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private groupBy: 'status' | 'type' | 'file' = 'status';
  private currentBranch: string | undefined;
  private filterState: FilterState = { branchFilterEnabled: false };

  // Display options
  private showLocation: boolean = true;
  private showBranch: boolean = true;
  private showDate: boolean = false;

  // Sort options
  private sortBy: 'date' | 'type' | 'status' = 'date';
  private sortOrder: 'asc' | 'desc' = 'desc';

  // Icon display
  private showNoteIcons: boolean = true;

  constructor(private storage: NoteStorage) {
    // Listen for storage changes
    storage.onChange(() => this.refresh());

    // Listen for config changes
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('adrai')) {
        this.loadConfig();
        this.refresh();
      }
    });

    // Load initial config
    this.loadConfig();

    // Get current branch
    this.updateCurrentBranch();

    // Watch for git branch changes via VS Code Git extension API
    this.setupGitExtensionWatcher();
  }

  /**
   * Set up watcher using VS Code Git extension API
   */
  private async setupGitExtensionWatcher(): Promise<void> {
    try {
      const gitExtension = vscode.extensions.getExtension('vscode.git');
      if (!gitExtension) return;

      const git = gitExtension.isActive ? gitExtension.exports : await gitExtension.activate();
      const api = git.getAPI(1);

      if (api.repositories.length > 0) {
        // Watch for state changes (includes branch switches)
        api.repositories[0].state.onDidChange(() => {
          this.refresh();
        });
      }

      // Also watch for new repositories
      api.onDidOpenRepository((repo: any) => {
        repo.state.onDidChange(() => {
          this.refresh();
        });
      });
    } catch (error) {
      console.log('Git extension not available, branch watching disabled');
    }
  }

  /**
   * Load configuration values
   */
  private loadConfig(): void {
    const config = vscode.workspace.getConfiguration('adrai');
    this.groupBy = config.get<'status' | 'type' | 'file'>('groupBy', 'status');
    this.filterState.branchFilterEnabled = config.get<boolean>('branchFilter', false);
    this.showLocation = config.get<boolean>('showLocation', true);
    this.showBranch = config.get<boolean>('showBranch', true);
    this.showDate = config.get<boolean>('showDate', false);
    this.sortBy = config.get<'date' | 'type' | 'status'>('sortBy', 'date');
    this.sortOrder = config.get<'asc' | 'desc'>('sortOrder', 'desc');
    this.showNoteIcons = config.get<boolean>('showNoteIcons', true);
    console.log('[adrai] loadConfig: showNoteIcons =', this.showNoteIcons);
  }

  /**
   * Update the current branch name
   */
  async updateCurrentBranch(): Promise<void> {
    this.currentBranch = await getCurrentBranch();
  }

  /**
   * Get the current branch
   */
  getCurrentBranch(): string | undefined {
    return this.currentBranch;
  }

  /**
   * Set search query filter
   */
  setSearchQuery(query: string | undefined): void {
    this.filterState.searchQuery = query;
    this.refresh();
  }

  /**
   * Try a search query without applying it - returns count of matching notes
   * Used for graceful degradation when search finds nothing
   */
  trySearchQuery(query: string): number {
    let notes = this.storage.getAllNotes();
    const lowerQuery = query.toLowerCase();

    notes = notes.filter(note =>
      note.content.toLowerCase().includes(lowerQuery) ||
      note.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      note.locations.some(loc =>
        loc.file.toLowerCase().includes(lowerQuery) ||
        loc.preview?.toLowerCase().includes(lowerQuery)
      )
    );

    // Also apply current type filter if set
    if (this.filterState.typeFilter) {
      notes = notes.filter(note => note.type === this.filterState.typeFilter);
    }

    // Also apply branch filter if enabled
    if (this.filterState.branchFilterEnabled && this.currentBranch) {
      notes = notes.filter(note =>
        !note.branch || note.branch === this.currentBranch
      );
    }

    return notes.length;
  }

  /**
   * Set type filter
   */
  setTypeFilter(type: NoteType | undefined): void {
    this.filterState.typeFilter = type;
    this.refresh();
  }

  /**
   * Toggle branch filter
   */
  toggleBranchFilter(): boolean {
    this.filterState.branchFilterEnabled = !this.filterState.branchFilterEnabled;
    // Also update the configuration
    vscode.workspace.getConfiguration('adrai').update('branchFilter', this.filterState.branchFilterEnabled, true);
    this.refresh();
    return this.filterState.branchFilterEnabled;
  }

  /**
   * Get branch filter state
   */
  isBranchFilterEnabled(): boolean {
    return this.filterState.branchFilterEnabled;
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.filterState = { branchFilterEnabled: false };
    vscode.workspace.getConfiguration('adrai').update('branchFilter', false, true);
    this.refresh();
  }

  /**
   * Get filter state
   */
  getFilterState(): FilterState {
    return { ...this.filterState };
  }

  /**
   * Check if any filters are active
   */
  hasActiveFilters(): boolean {
    return !!(this.filterState.searchQuery || this.filterState.typeFilter || this.filterState.branchFilterEnabled);
  }

  /**
   * Refresh the tree view
   */
  refresh(): void {
    // Update branch on refresh
    this.updateCurrentBranch().then(() => {
      this._onDidChangeTreeData.fire();
    });
  }

  /**
   * Get filtered notes based on current filter state
   */
  getFilteredNotes(): ReviewNote[] {
    let notes = this.storage.getAllNotes();

    // Apply search filter
    if (this.filterState.searchQuery) {
      const query = this.filterState.searchQuery.toLowerCase();
      notes = notes.filter(note =>
        note.content.toLowerCase().includes(query) ||
        note.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        note.locations.some(loc =>
          loc.file.toLowerCase().includes(query) ||
          loc.preview?.toLowerCase().includes(query)
        )
      );
    }

    // Apply type filter
    if (this.filterState.typeFilter) {
      notes = notes.filter(note => note.type === this.filterState.typeFilter);
    }

    // Apply branch filter
    if (this.filterState.branchFilterEnabled && this.currentBranch) {
      notes = notes.filter(note =>
        !note.branch || note.branch === this.currentBranch
      );
    }

    return notes;
  }

  /**
   * Get filter summary for display
   */
  getFilterSummary(): string {
    const totalNotes = this.storage.getAllNotes().length;
    const filteredNotes = this.getFilteredNotes().length;

    if (this.hasActiveFilters()) {
      return `(filtered: ${filteredNotes}/${totalNotes})`;
    }
    return '';
  }

  /**
   * Get the tree item for display
   */
  getTreeItem(element: NoteTreeItem): vscode.TreeItem {
    return element;
  }

  /**
   * Get children for a tree item
   */
  getChildren(element?: NoteTreeItem): Thenable<NoteTreeItem[]> {
    if (!element) {
      // Root level - show groups
      return Promise.resolve(this.getGroups());
    }

    if (element.itemType === 'group') {
      // Group level - show notes in this group
      return Promise.resolve(this.getNotesInGroup(element.label));
    }

    if (element.itemType === 'note' && element.data) {
      // Note level - show locations
      const note = element.data as ReviewNote;
      return Promise.resolve(this.getLocations(note));
    }

    return Promise.resolve([]);
  }

  /**
   * Get group headers based on groupBy setting
   */
  private getGroups(): NoteTreeItem[] {
    const notes = this.getFilteredNotes();

    switch (this.groupBy) {
      case 'status':
        return this.getStatusGroups(notes);
      case 'type':
        return this.getTypeGroups(notes);
      case 'file':
        return this.getFileGroups(notes);
      default:
        return this.getStatusGroups(notes);
    }
  }

  /**
   * Get groups organized by status
   */
  private getStatusGroups(notes: ReviewNote[]): NoteTreeItem[] {
    const statuses: NoteStatus[] = ['open', 'investigating', 'promote', 'resolved'];
    const groups: NoteTreeItem[] = [];

    for (const status of statuses) {
      const count = notes.filter(n => n.status === status).length;
      if (count > 0) {
        const item = new NoteTreeItem(
          `${STATUS_LABELS[status]} (${count})`,
          vscode.TreeItemCollapsibleState.Expanded,
          'group'
        );
        item.iconPath = new vscode.ThemeIcon(STATUS_ICONS[status]);
        item.description = '';
        groups.push(item);
      }
    }

    return groups;
  }

  /**
   * Get groups organized by type (ordered by urgency: low to high)
   */
  private getTypeGroups(notes: ReviewNote[]): NoteTreeItem[] {
    const groups: NoteTreeItem[] = [];

    for (const type of NOTE_TYPES_ORDERED) {
      const count = notes.filter(n => n.type === type).length;
      if (count > 0) {
        const item = new NoteTreeItem(
          `${NOTE_TYPE_LABELS[type]} (${count})`,
          vscode.TreeItemCollapsibleState.Expanded,
          'group'
        );
        item.iconPath = new vscode.ThemeIcon(NOTE_TYPE_ICONS[type]);
        groups.push(item);
      }
    }

    return groups;
  }

  /**
   * Get groups organized by file
   */
  private getFileGroups(notes: ReviewNote[]): NoteTreeItem[] {
    const fileMap = new Map<string, number>();

    for (const note of notes) {
      for (const loc of note.locations) {
        const count = fileMap.get(loc.file) || 0;
        fileMap.set(loc.file, count + 1);
      }
    }

    const groups: NoteTreeItem[] = [];
    for (const [file, count] of fileMap.entries()) {
      const item = new NoteTreeItem(
        `${path.basename(file)} (${count})`,
        vscode.TreeItemCollapsibleState.Expanded,
        'group'
      );
      item.iconPath = new vscode.ThemeIcon('file');
      item.description = path.dirname(file);
      item.tooltip = file;
      groups.push(item);
    }

    return groups.sort((a, b) => a.label.localeCompare(b.label));
  }

  /**
   * Get notes belonging to a group
   */
  private getNotesInGroup(groupLabel: string | vscode.TreeItemLabel): NoteTreeItem[] {
    const notes = this.getFilteredNotes();
    let filteredNotes: ReviewNote[];

    // Handle TreeItemLabel or string
    const labelStr = typeof groupLabel === 'string' ? groupLabel : groupLabel.label;

    // Parse the group label to extract the key (remove count)
    const labelMatch = labelStr.match(/^(.+?)\s*\(\d+\)$/);
    const key = labelMatch ? labelMatch[1] : labelStr;

    switch (this.groupBy) {
      case 'status':
        const statusEntry = Object.entries(STATUS_LABELS).find(([_, label]) => label === key);
        filteredNotes = statusEntry
          ? notes.filter(n => n.status === statusEntry[0])
          : [];
        break;

      case 'type':
        const typeEntry = Object.entries(NOTE_TYPE_LABELS).find(([_, label]) => label === key);
        filteredNotes = typeEntry
          ? notes.filter(n => n.type === typeEntry[0])
          : [];
        break;

      case 'file':
        // For file grouping, we need to find notes with locations in this file
        filteredNotes = notes.filter(n =>
          n.locations.some(loc => path.basename(loc.file) === key)
        );
        break;

      default:
        filteredNotes = [];
    }

    // Sort notes based on settings
    filteredNotes = this.sortNotes(filteredNotes);

    return filteredNotes.map(note => this.createNoteItem(note));
  }

  /**
   * Get the icon to display for a note based on settings
   * - When showNoteIcons is false: no icons on notes
   * - When grouped by status: show type icons
   * - When grouped by type or file: show status icons
   * Returns undefined for no icon
   */
  private getNoteIcon(note: ReviewNote): string | undefined {
    console.log('[adrai] getNoteIcon called, showNoteIcons:', this.showNoteIcons);
    if (!this.showNoteIcons) {
      console.log('[adrai] Returning undefined (icons disabled)');
      return undefined;
    }

    // Show the "other" dimension: type icons for status grouping, status icons otherwise
    if (this.groupBy === 'status') {
      return NOTE_TYPE_ICONS[note.type];
    }
    return STATUS_ICONS[note.status];
  }

  /**
   * Sort notes based on sortBy and sortOrder settings
   * Contextual: when grouped by status, type sort is valid; when grouped by type, status sort is valid
   */
  private sortNotes(notes: ReviewNote[]): ReviewNote[] {
    const sorted = [...notes].sort((a, b) => {
      let comparison = 0;

      // Determine effective sort - avoid sorting by same dimension as grouping
      let effectiveSort = this.sortBy;
      if (this.groupBy === 'status' && this.sortBy === 'status') {
        effectiveSort = 'type'; // Fall back to type when grouped by status
      } else if (this.groupBy === 'type' && this.sortBy === 'type') {
        effectiveSort = 'status'; // Fall back to status when grouped by type
      }

      switch (effectiveSort) {
        case 'date':
          comparison = new Date(a.created).getTime() - new Date(b.created).getTime();
          break;

        case 'type':
          // Sort by urgency order (NOTE_TYPES_ORDERED)
          const aTypeIndex = NOTE_TYPES_ORDERED.indexOf(a.type);
          const bTypeIndex = NOTE_TYPES_ORDERED.indexOf(b.type);
          comparison = aTypeIndex - bTypeIndex;
          break;

        case 'status':
          // Sort by status order: open, investigating, promote, resolved
          const statusOrder: NoteStatus[] = ['open', 'investigating', 'promote', 'resolved'];
          const aStatusIndex = statusOrder.indexOf(a.status);
          const bStatusIndex = statusOrder.indexOf(b.status);
          comparison = aStatusIndex - bStatusIndex;
          break;
      }

      return this.sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }

  /**
   * Create a tree item for a note
   */
  private createNoteItem(note: ReviewNote): NoteTreeItem {
    const hasMultipleLocations = note.locations.length > 1;
    const isCurrentBranch = !note.branch || note.branch === this.currentBranch;

    // Simple label
    const label = this.truncate(note.content, 50);

    const item = new NoteTreeItem(
      label,
      hasMultipleLocations
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None,
      'note',
      note,
      note.id
    );

    // Set resourceUri for FileDecorationProvider to color text
    // Encode: scheme://branchFlag.filterMode/noteId
    // filterMode: 'all' (show all) or 'filtered' (branch filter on)
    const branchFlag = isCurrentBranch ? 'current' : 'other';
    const filterMode = this.filterState.branchFilterEnabled ? 'filtered' : 'all';
    item.resourceUri = vscode.Uri.parse(`adrai-note://${branchFlag}.${filterMode}/${note.id}`);

    // Determine which icon to show based on settings
    const iconName = this.getNoteIcon(note);
    if (iconName) {
      item.iconPath = new vscode.ThemeIcon(iconName);
    }
    // Note: When iconName is undefined (none mode), we don't set iconPath.
    // VS Code will show no icon. The resourceUri above is for text coloring only.
    item.tooltip = this.createNoteTooltip(note);

    // Build description parts based on display settings
    const descParts: string[] = [];

    // Show promoted status (always visible if present)
    if (note.promoted_to) {
      descParts.push(`[${note.promoted_to}]`);
    }

    // Show branch badge for notes from other branches (if enabled)
    if (this.showBranch && !isCurrentBranch && note.branch) {
      descParts.push(`[${note.branch}]`);
    }

    // Show primary location (if enabled)
    if (this.showLocation && note.locations.length > 0) {
      const loc = note.locations[0];
      let locStr = `${path.basename(loc.file)}:${loc.line}`;
      if (note.locations.length > 1) {
        locStr += ` (+${note.locations.length - 1})`;
      }
      descParts.push(locStr);
    }

    // Show creation date (if enabled)
    if (this.showDate) {
      const date = new Date(note.created);
      descParts.push(date.toLocaleDateString());
    }

    item.description = descParts.join(' ');

    // Set context based on branch
    item.contextValue = isCurrentBranch ? 'note' : 'note-other-branch';

    // If single location, make clickable
    // Current branch: click navigates directly
    // Other branch: click selects only, use CTRL+ALT+Enter to navigate
    if (note.locations.length === 1 && isCurrentBranch) {
      item.command = {
        command: 'adrai.goToLocation',
        title: 'Go to Location',
        arguments: [note.locations[0]]
      };
    }

    return item;
  }

  /**
   * Create tooltip for a note
   */
  private createNoteTooltip(note: ReviewNote): vscode.MarkdownString {
    const md = new vscode.MarkdownString();
    md.appendMarkdown(`**${NOTE_TYPE_LABELS[note.type]}** - ${STATUS_LABELS[note.status]}\n\n`);
    md.appendMarkdown(note.content + '\n\n');

    if (note.tags && note.tags.length > 0) {
      md.appendMarkdown(`Tags: ${note.tags.map(t => `\`${t}\``).join(' ')}\n\n`);
    }

    md.appendMarkdown(`---\n`);
    md.appendMarkdown(`Created: ${new Date(note.created).toLocaleString()}\n\n`);

    if (note.promoted_to) {
      md.appendMarkdown(`**Promoted to:** ${note.promoted_to}\n\n`);
    }

    md.appendMarkdown(`**Locations:**\n`);
    for (const loc of note.locations) {
      md.appendMarkdown(`- ${loc.file}:${loc.line}`);
      if (loc.preview) {
        md.appendMarkdown(` - *${loc.preview}*`);
      }
      md.appendMarkdown('\n');
    }

    return md;
  }

  /**
   * Get location items for a note
   */
  private getLocations(note: ReviewNote): NoteTreeItem[] {
    return note.locations.map((loc, index) => {
      const item = new NoteTreeItem(
        `${path.basename(loc.file)}:${loc.line}`,
        vscode.TreeItemCollapsibleState.None,
        'location',
        loc,
        note.id
      );

      item.iconPath = new vscode.ThemeIcon('go-to-file');
      item.description = loc.section || loc.preview || '';
      item.tooltip = `${loc.file}:${loc.line}${loc.preview ? '\n' + loc.preview : ''}`;

      item.command = {
        command: 'adrai.goToLocation',
        title: 'Go to Location',
        arguments: [loc]
      };

      return item;
    });
  }

  /**
   * Check if a location's file no longer exists
   * Used by cleanup command to find files that have been moved/deleted
   */
  private isLocationStale(location: NoteLocation): boolean {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return false; // Can't determine staleness without workspace
    }

    const filePath = location.file;

    // Strategy 1: Absolute path
    if (path.isAbsolute(filePath) && fs.existsSync(filePath)) {
      return false;
    }

    // Strategy 2: Try each workspace folder
    for (const folder of workspaceFolders) {
      const candidatePath = path.join(folder.uri.fsPath, filePath);
      if (fs.existsSync(candidatePath)) {
        return false;
      }
    }

    // Strategy 3: Remove first segment (for nested workspace paths like "adrai/plans/...")
    if (filePath.includes('/')) {
      const withoutFirst = filePath.split('/').slice(1).join('/');
      for (const folder of workspaceFolders) {
        const candidatePath = path.join(folder.uri.fsPath, withoutFirst);
        if (fs.existsSync(candidatePath)) {
          return false;
        }
      }
    }

    return true; // Not found
  }

  /**
   * Get all stale locations across all notes
   */
  getStaleLocations(): Array<{ noteId: string; location: NoteLocation }> {
    const staleLocations: Array<{ noteId: string; location: NoteLocation }> = [];

    for (const note of this.storage.getAllNotes()) {
      for (const location of note.locations) {
        if (this.isLocationStale(location)) {
          staleLocations.push({ noteId: note.id, location });
        }
      }
    }

    return staleLocations;
  }

  /**
   * Handle drag start - pack note IDs into data transfer
   */
  handleDrag(source: readonly NoteTreeItem[], dataTransfer: vscode.DataTransfer, token: vscode.CancellationToken): void {
    // Only allow dragging notes (not groups or locations)
    const noteItems = source.filter(item => item.itemType === 'note' || item.itemType === 'note-other-branch');
    if (noteItems.length === 0) {
      return;
    }

    // Pack note IDs
    const noteIds = noteItems.map(item => item.noteId).filter(Boolean);
    dataTransfer.set(NOTE_DRAG_MIME_TYPE, new vscode.DataTransferItem(JSON.stringify(noteIds)));
  }

  /**
   * Handle drop - change note status/type when dropped on a group or note
   */
  async handleDrop(target: NoteTreeItem | undefined, dataTransfer: vscode.DataTransfer, token: vscode.CancellationToken): Promise<void> {
    // Only handle drops when grouping by status or type
    if (this.groupBy !== 'status' && this.groupBy !== 'type') {
      vscode.window.showWarningMessage('Drag & drop only works when grouped by status or type');
      return;
    }

    // Target must be a group or a note
    if (!target) {
      return;
    }

    // Get the note IDs from data transfer
    const data = dataTransfer.get(NOTE_DRAG_MIME_TYPE);
    if (!data) {
      return;
    }

    let noteIds: string[];
    try {
      noteIds = JSON.parse(await data.asString());
    } catch {
      return;
    }

    // Determine target value based on groupBy mode
    let newStatus: NoteStatus | undefined;
    let newType: NoteType | undefined;

    const labelStr = target.itemType === 'group'
      ? (typeof target.label === 'string' ? target.label : target.label?.label || '')
      : '';
    const labelMatch = labelStr.match(/^(.+?)\s*\(\d+\)$/);
    const groupLabel = labelMatch ? labelMatch[1] : labelStr;

    if (this.groupBy === 'status') {
      if (target.itemType === 'group') {
        const statusEntry = Object.entries(STATUS_LABELS).find(([_, label]) => label === groupLabel);
        if (statusEntry) {
          newStatus = statusEntry[0] as NoteStatus;
        }
      } else if (target.itemType === 'note' || target.itemType === 'note-other-branch') {
        const targetNote = target.data as ReviewNote;
        if (targetNote) {
          newStatus = targetNote.status;
        }
      }
    } else if (this.groupBy === 'type') {
      if (target.itemType === 'group') {
        const typeEntry = Object.entries(NOTE_TYPE_LABELS).find(([_, label]) => label === groupLabel);
        if (typeEntry) {
          newType = typeEntry[0] as NoteType;
        }
      } else if (target.itemType === 'note' || target.itemType === 'note-other-branch') {
        const targetNote = target.data as ReviewNote;
        if (targetNote) {
          newType = targetNote.type;
        }
      }
    }

    if (!newStatus && !newType) {
      return;
    }

    // Update all dragged notes
    let updatedCount = 0;
    for (const noteId of noteIds) {
      try {
        const note = this.storage.getNote(noteId);
        if (!note) continue;

        if (newStatus && note.status !== newStatus) {
          this.storage.updateNote(noteId, { status: newStatus });
          updatedCount++;
        } else if (newType && note.type !== newType) {
          this.storage.updateNote(noteId, { type: newType });
          updatedCount++;
        }
      } catch (error) {
        console.error('Error updating note:', error);
      }
    }

    if (updatedCount > 0) {
      const targetLabel = newStatus ? STATUS_LABELS[newStatus] : NOTE_TYPE_LABELS[newType!];
      vscode.window.showInformationMessage(
        `Moved ${updatedCount} note(s) to ${targetLabel}`
      );
    }
  }

  /**
   * Truncate text to a maximum length
   */
  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + '...';
  }
}
