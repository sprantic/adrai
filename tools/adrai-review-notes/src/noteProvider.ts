/**
 * adrAI Review Notes - TreeView Data Provider
 *
 * Provides data for the VS Code sidebar panel showing review notes.
 */

import * as vscode from 'vscode';
import * as path from 'path';
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
import { NoteStorage } from './noteStorage';

/**
 * Tree item representing a note, location, or group header
 */
export class NoteTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly itemType: 'group' | 'note' | 'location',
    public readonly data?: ReviewNote | NoteLocation,
    public readonly noteId?: string
  ) {
    super(label, collapsibleState);
    this.contextValue = itemType;
  }
}

/**
 * TreeDataProvider for the Review Notes panel
 */
export class NoteProvider implements vscode.TreeDataProvider<NoteTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<NoteTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private groupBy: 'status' | 'type' | 'file' = 'status';

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
    });

    // Load initial config
    const config = vscode.workspace.getConfiguration('adrai');
    this.groupBy = config.get<'status' | 'type' | 'file'>('groupBy', 'status');
  }

  /**
   * Refresh the tree view
   */
  refresh(): void {
    this._onDidChangeTreeData.fire();
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
    const notes = this.storage.getAllNotes();

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
    const notes = this.storage.getAllNotes();
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
    const item = new NoteTreeItem(
      this.truncate(note.content, 50),
      hasMultipleLocations
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None,
      'note',
      note,
      note.id
    );

    item.iconPath = new vscode.ThemeIcon(NOTE_TYPE_ICONS[note.type]);
    item.tooltip = this.createNoteTooltip(note);

    // If single location, make the item clickable
    if (note.locations.length === 1) {
      item.command = {
        command: 'adrai.goToLocation',
        title: 'Go to Location',
        arguments: [note.locations[0]]
      };
    }

    // Show primary location as description
    if (note.locations.length > 0) {
      const loc = note.locations[0];
      item.description = `${path.basename(loc.file)}:${loc.line}`;
      if (note.locations.length > 1) {
        item.description += ` (+${note.locations.length - 1})`;
      }
    }

    // Show promoted status
    if (note.promoted_to) {
      item.description = `[${note.promoted_to}] ` + (item.description || '');
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
   * Truncate text to a maximum length
   */
  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + '...';
  }
}
