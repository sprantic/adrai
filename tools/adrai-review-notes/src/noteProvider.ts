/**
 * adrAI Review Notes - TreeView Data Provider
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
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly itemType: TreeItemContextValue,
    public readonly data?: ReviewNote | NoteLocation,
    public readonly noteId?: string
  ) {
    super(label, collapsibleState);
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
 * TreeDataProvider for the Review Notes panel
 */
export class NoteProvider implements vscode.TreeDataProvider<NoteTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<NoteTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private groupBy: 'status' | 'type' | 'file' = 'status';
  private currentBranch: string | undefined;
  private filterState: FilterState = { branchFilterEnabled: false };

  constructor(private storage: NoteStorage) {
    // Listen for storage changes
    storage.onChange(() => this.refresh());

    // Listen for config changes
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('adrai.groupBy')) {
        const config = vscode.workspace.getConfiguration('adrai');
        this.groupBy = config.get<'status' | 'type' | 'file'>('groupBy', 'status');
        this.refresh();
      }
      if (e.affectsConfiguration('adrai.branchFilter')) {
        const config = vscode.workspace.getConfiguration('adrai');
        this.filterState.branchFilterEnabled = config.get<boolean>('branchFilter', false);
        this.refresh();
      }
    });

    // Load initial config
    const config = vscode.workspace.getConfiguration('adrai');
    this.groupBy = config.get<'status' | 'type' | 'file'>('groupBy', 'status');
    this.filterState.branchFilterEnabled = config.get<boolean>('branchFilter', false);

    // Get current branch
    this.updateCurrentBranch();
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
   * Get groups organized by type
   */
  private getTypeGroups(notes: ReviewNote[]): NoteTreeItem[] {
    const types: NoteType[] = ['question', 'uncertainty', 'concern', 'bookmark', 'pre-debate'];
    const groups: NoteTreeItem[] = [];

    for (const type of types) {
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
  private getNotesInGroup(groupLabel: string): NoteTreeItem[] {
    const notes = this.getFilteredNotes();
    let filteredNotes: ReviewNote[];

    // Parse the group label to extract the key (remove count)
    const labelMatch = groupLabel.match(/^(.+?)\s*\(\d+\)$/);
    const key = labelMatch ? labelMatch[1] : groupLabel;

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

    return filteredNotes.map(note => this.createNoteItem(note));
  }

  /**
   * Create a tree item for a note
   */
  private createNoteItem(note: ReviewNote): NoteTreeItem {
    const hasMultipleLocations = note.locations.length > 1;
    const isCurrentBranch = !note.branch || note.branch === this.currentBranch;

    const item = new NoteTreeItem(
      this.truncate(note.content, 50),
      hasMultipleLocations
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None,
      'note',
      note,
      note.id
    );

    item.tooltip = this.createNoteTooltip(note);

    // Build description parts
    let description = '';

    // Show branch badge for notes from other branches
    if (!isCurrentBranch && note.branch) {
      description = `⊘ [${note.branch}] `;
    }

    // Show primary location as description
    if (note.locations.length > 0) {
      const loc = note.locations[0];
      description += `${path.basename(loc.file)}:${loc.line}`;
      if (note.locations.length > 1) {
        description += ` (+${note.locations.length - 1})`;
      }
    }

    // Show promoted status
    if (note.promoted_to) {
      description = `[${note.promoted_to}] ` + description;
    }

    item.description = description;

    // Style notes based on branch
    if (isCurrentBranch) {
      // Current branch: normal icon, context allows all actions
      item.iconPath = new vscode.ThemeIcon(NOTE_TYPE_ICONS[note.type]);
      item.contextValue = 'note';

      // If single location, make clickable
      if (note.locations.length === 1) {
        item.command = {
          command: 'adrai.goToLocation',
          title: 'Go to Location',
          arguments: [note.locations[0]]
        };
      }
    } else {
      // Other branch: grayed out icon, limited context actions, no navigation
      item.iconPath = new vscode.ThemeIcon(
        NOTE_TYPE_ICONS[note.type],
        new vscode.ThemeColor('disabledForeground')
      );
      item.contextValue = 'note-other-branch';
      // No command - clicking does nothing for other-branch notes
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
      const isStale = this.isLocationStale(loc);

      const item = new NoteTreeItem(
        `${path.basename(loc.file)}:${loc.line}`,
        vscode.TreeItemCollapsibleState.None,
        isStale ? 'location-stale' : 'location',
        loc,
        note.id
      );

      if (isStale) {
        item.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('editorWarning.foreground'));
        item.description = '(file not found)';
        item.tooltip = `File not found: ${loc.file}`;
      } else {
        item.iconPath = new vscode.ThemeIcon('go-to-file');
        item.description = loc.section || loc.preview || '';
        item.tooltip = `${loc.file}:${loc.line}${loc.preview ? '\n' + loc.preview : ''}`;

        item.command = {
          command: 'adrai.goToLocation',
          title: 'Go to Location',
          arguments: [loc]
        };
      }

      return item;
    });
  }

  /**
   * Check if a location's file no longer exists
   */
  private isLocationStale(location: NoteLocation): boolean {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return false;
    }

    let filePath = location.file;

    if (path.isAbsolute(filePath)) {
      return !fs.existsSync(filePath);
    }

    // Try each workspace folder for multi-root workspaces
    for (const folder of workspaceFolders) {
      const candidatePath = path.join(folder.uri.fsPath, filePath);
      if (fs.existsSync(candidatePath)) {
        return false; // Found it, not stale
      }
    }

    return true; // Not found in any workspace folder
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
   * Truncate text to a maximum length
   */
  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + '...';
  }
}
