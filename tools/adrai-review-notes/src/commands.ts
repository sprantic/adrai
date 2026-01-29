/**
 * adrAI Review Notes - Command Implementations
 *
 * All VS Code commands for the review notes extension.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import {
  ReviewNote,
  NoteLocation,
  NoteType,
  NoteStatus,
  NOTE_TYPE_LABELS
} from './types';
import { NoteStorage, createNote, getLinePreview, getCurrentBranch, branchExists } from './noteStorage';
import { NoteProvider, NoteTreeItem } from './noteProvider';

/**
 * Register all commands for the extension
 */
export function registerCommands(
  context: vscode.ExtensionContext,
  storage: NoteStorage,
  provider: NoteProvider
): void {
  // Add Note command
  context.subscriptions.push(
    vscode.commands.registerCommand('adrai.addNote', () => addNote(storage))
  );

  // Add Location command
  context.subscriptions.push(
    vscode.commands.registerCommand('adrai.addLocation', (item?: NoteTreeItem) =>
      addLocation(storage, item)
    )
  );

  // Show Panel command
  context.subscriptions.push(
    vscode.commands.registerCommand('adrai.showPanel', () => {
      vscode.commands.executeCommand('adraiReviewNotes.focus');
    })
  );

  // Promote to Debate command
  context.subscriptions.push(
    vscode.commands.registerCommand('adrai.promoteToDebate', (item?: NoteTreeItem) =>
      promoteToDebate(storage, item)
    )
  );

  // Resolve Note command
  context.subscriptions.push(
    vscode.commands.registerCommand('adrai.resolveNote', (item?: NoteTreeItem) =>
      resolveNote(storage, item)
    )
  );

  // Edit Note command
  context.subscriptions.push(
    vscode.commands.registerCommand('adrai.editNote', (item?: NoteTreeItem) =>
      editNote(storage, item)
    )
  );

  // Delete Note command
  context.subscriptions.push(
    vscode.commands.registerCommand('adrai.deleteNote', (item?: NoteTreeItem) =>
      deleteNote(storage, item)
    )
  );

  // Refresh Notes command
  context.subscriptions.push(
    vscode.commands.registerCommand('adrai.refreshNotes', () => provider.refresh())
  );

  // Go to Location command
  context.subscriptions.push(
    vscode.commands.registerCommand('adrai.goToLocation', (location?: NoteLocation) =>
      goToLocation(location)
    )
  );

  // Search Notes command
  context.subscriptions.push(
    vscode.commands.registerCommand('adrai.searchNotes', () => searchNotes(provider))
  );

  // Filter by Type command
  context.subscriptions.push(
    vscode.commands.registerCommand('adrai.filterByType', () => filterByType(provider))
  );

  // Clear Filters command
  context.subscriptions.push(
    vscode.commands.registerCommand('adrai.clearFilters', () => {
      provider.clearFilters();
      vscode.window.showInformationMessage('Filters cleared');
    })
  );

  // Quick Note command (bookmark)
  context.subscriptions.push(
    vscode.commands.registerCommand('adrai.quickNote', () => quickNote(storage))
  );

  // Toggle Branch Filter command
  context.subscriptions.push(
    vscode.commands.registerCommand('adrai.toggleBranchFilter', () => {
      const enabled = provider.toggleBranchFilter();
      vscode.window.showInformationMessage(
        enabled ? 'Branch filter enabled - showing current branch notes only' : 'Branch filter disabled - showing all notes'
      );
    })
  );

  // Remove Location command
  context.subscriptions.push(
    vscode.commands.registerCommand('adrai.removeLocation', (item?: NoteTreeItem) =>
      removeLocation(storage, item)
    )
  );

  // Cleanup Stale Locations command
  context.subscriptions.push(
    vscode.commands.registerCommand('adrai.cleanupStaleLocations', () =>
      cleanupStaleLocations(storage, provider)
    )
  );

  // Resolve Selected command (bulk)
  context.subscriptions.push(
    vscode.commands.registerCommand('adrai.resolveSelected', (item?: NoteTreeItem, items?: NoteTreeItem[]) =>
      resolveSelected(storage, items || (item ? [item] : []))
    )
  );

  // Delete Selected command (bulk)
  context.subscriptions.push(
    vscode.commands.registerCommand('adrai.deleteSelected', (item?: NoteTreeItem, items?: NoteTreeItem[]) =>
      deleteSelected(storage, items || (item ? [item] : []))
    )
  );

  // Resolve All in Group command
  context.subscriptions.push(
    vscode.commands.registerCommand('adrai.resolveAllInGroup', (item?: NoteTreeItem) =>
      resolveAllInGroup(storage, provider, item)
    )
  );
}

/**
 * Add a new review note at the current cursor position
 */
async function addNote(storage: NoteStorage): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor. Open a file to add a note.');
    return;
  }

  // Get note content
  const content = await vscode.window.showInputBox({
    prompt: 'Enter your review note',
    placeHolder: 'What do you want to note about this location?',
    validateInput: (value) => {
      if (!value || value.trim().length === 0) {
        return 'Note content is required';
      }
      return null;
    }
  });

  if (!content) {
    return; // User cancelled
  }

  // Get note type
  const typeItems = Object.entries(NOTE_TYPE_LABELS).map(([key, label]) => ({
    label,
    value: key as NoteType,
    description: getTypeDescription(key as NoteType)
  }));

  const selectedType = await vscode.window.showQuickPick(typeItems, {
    placeHolder: 'Select note type'
  });

  if (!selectedType) {
    return; // User cancelled
  }

  // Get tags (optional)
  const tagsInput = await vscode.window.showInputBox({
    prompt: 'Enter tags (optional, comma-separated)',
    placeHolder: 'e.g., security, performance, api'
  });

  const tags = tagsInput
    ? tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0)
    : undefined;

  // Create location
  const document = editor.document;
  const position = editor.selection.active;
  const preview = await getLinePreview(document.uri.fsPath, position.line + 1);

  const location: NoteLocation = {
    file: vscode.workspace.asRelativePath(document.uri),
    line: position.line + 1, // 1-indexed
    preview
  };

  // Get current branch
  const currentBranch = await getCurrentBranch();

  // Create and save note
  const note = createNote(content.trim(), selectedType.value, [location], tags, currentBranch);
  storage.addNote(note);

  vscode.window.showInformationMessage(`Review note added: ${truncate(content, 50)}`);
}

/**
 * Add current location to an existing note
 */
async function addLocation(storage: NoteStorage, item?: NoteTreeItem): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor. Open a file to add a location.');
    return;
  }

  let noteId: string | undefined;

  if (item && item.itemType === 'note' && item.noteId) {
    noteId = item.noteId;
  } else {
    // Let user select a note
    const notes = storage.getAllNotes().filter(n => n.status !== 'resolved');
    if (notes.length === 0) {
      vscode.window.showWarningMessage('No open notes to add location to. Create a note first.');
      return;
    }

    const noteItems = notes.map(note => ({
      label: truncate(note.content, 60),
      description: `${NOTE_TYPE_LABELS[note.type]} - ${note.locations.length} location(s)`,
      noteId: note.id
    }));

    const selected = await vscode.window.showQuickPick(noteItems, {
      placeHolder: 'Select a note to add this location to'
    });

    if (!selected) {
      return; // User cancelled
    }

    noteId = selected.noteId;
  }

  // Create location
  const document = editor.document;
  const position = editor.selection.active;
  const preview = await getLinePreview(document.uri.fsPath, position.line + 1);

  // Optionally add section name
  const section = await vscode.window.showInputBox({
    prompt: 'Enter section name (optional)',
    placeHolder: 'e.g., "Error handling", "API endpoint"'
  });

  const location: NoteLocation = {
    file: vscode.workspace.asRelativePath(document.uri),
    line: position.line + 1,
    preview,
    section: section || undefined
  };

  storage.addLocation(noteId, location);
  vscode.window.showInformationMessage('Location added to note');
}

/**
 * Promote a note to a formal debate
 */
async function promoteToDebate(storage: NoteStorage, item?: NoteTreeItem): Promise<void> {
  let note: ReviewNote | undefined;

  if (item && item.itemType === 'note' && item.data) {
    note = item.data as ReviewNote;
  } else {
    // Let user select a note
    const notes = storage.getAllNotes().filter(n => n.status !== 'resolved' && !n.promoted_to);
    if (notes.length === 0) {
      vscode.window.showWarningMessage('No notes available for promotion.');
      return;
    }

    const noteItems = notes.map(n => ({
      label: truncate(n.content, 60),
      description: NOTE_TYPE_LABELS[n.type],
      note: n
    }));

    const selected = await vscode.window.showQuickPick(noteItems, {
      placeHolder: 'Select a note to promote to debate'
    });

    if (!selected) {
      return;
    }

    note = selected.note;
  }

  if (note.promoted_to) {
    vscode.window.showWarningMessage(`This note was already promoted to ${note.promoted_to}`);
    return;
  }

  // Get workspace folder
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showErrorMessage('No workspace folder open');
    return;
  }

  // Get configuration
  const config = vscode.workspace.getConfiguration('adrai');
  const debatesDir = config.get<string>('debatesDir', 'docs/debates');
  const templateDir = config.get<string>('debateTemplateDir', 'docs/debates/templates');

  const debatesPath = path.join(workspaceFolder.uri.fsPath, debatesDir);
  const templatePath = path.join(workspaceFolder.uri.fsPath, templateDir, 'debate-template.md');

  // Check if template exists
  if (!fs.existsSync(templatePath)) {
    vscode.window.showErrorMessage(`Debate template not found: ${templatePath}`);
    return;
  }

  // Get next debate ID from tracker
  const trackerPath = path.join(debatesPath, '.deb-tracker.md');
  let nextId = 'DEB-0001';

  if (fs.existsSync(trackerPath)) {
    const trackerContent = fs.readFileSync(trackerPath, 'utf-8');
    const match = trackerContent.match(/Next Available:\s*DEB-(\d+)/i);
    if (match) {
      nextId = `DEB-${match[1]}`;
    }
  }

  // Confirm promotion
  const confirm = await vscode.window.showInformationMessage(
    `Promote this note to ${nextId}?`,
    'Yes, Create Debate',
    'Cancel'
  );

  if (confirm !== 'Yes, Create Debate') {
    return;
  }

  // Read template
  const templateContent = fs.readFileSync(templatePath, 'utf-8');

  // Generate debate file name
  const topicSlug = note.content
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .substring(0, 30)
    .replace(/-$/, '');

  const debateFileName = `${nextId}-${topicSlug}.deb.md`;
  const debatePath = path.join(debatesPath, debateFileName);

  // Create debate content by replacing placeholders
  let debateContent = templateContent
    .replace(/DEB-NNNN/g, nextId)
    .replace(/\[Central Question\]/g, note.content)
    .replace(/YYYY-MM-DD/g, new Date().toISOString().split('T')[0]);

  // Add context from note locations
  const locationContext = note.locations.map(loc => {
    let line = `- ${loc.file}:${loc.line}`;
    if (loc.section) {
      line += ` (${loc.section})`;
    }
    if (loc.preview) {
      line += `\n  > ${loc.preview}`;
    }
    return line;
  }).join('\n');

  // Find a place to insert context (after "The Question" section)
  const contextSection = `\n\n### Context from Review Note\n\n${locationContext}\n`;
  debateContent = debateContent.replace(
    /(## The Question[\s\S]*?---)/,
    `$1${contextSection}`
  );

  // Write debate file
  fs.writeFileSync(debatePath, debateContent, 'utf-8');

  // Update note with promotion reference
  storage.updateNote(note.id, {
    promoted_to: nextId,
    status: 'resolved'
  });

  // Open the debate file
  const debateUri = vscode.Uri.file(debatePath);
  const document = await vscode.workspace.openTextDocument(debateUri);
  await vscode.window.showTextDocument(document);

  vscode.window.showInformationMessage(`Created debate: ${nextId}`);
}

/**
 * Mark a note as resolved
 */
async function resolveNote(storage: NoteStorage, item?: NoteTreeItem): Promise<void> {
  let noteId: string | undefined;

  if (item && item.itemType === 'note' && item.noteId) {
    noteId = item.noteId;
  } else {
    // Let user select a note
    const notes = storage.getAllNotes().filter(n => n.status !== 'resolved');
    if (notes.length === 0) {
      vscode.window.showInformationMessage('No open notes to resolve.');
      return;
    }

    const noteItems = notes.map(n => ({
      label: truncate(n.content, 60),
      description: NOTE_TYPE_LABELS[n.type],
      noteId: n.id
    }));

    const selected = await vscode.window.showQuickPick(noteItems, {
      placeHolder: 'Select a note to resolve'
    });

    if (!selected) {
      return;
    }

    noteId = selected.noteId;
  }

  storage.updateNote(noteId, { status: 'resolved' });
  vscode.window.showInformationMessage('Note marked as resolved');
}

/**
 * Edit an existing note
 */
async function editNote(storage: NoteStorage, item?: NoteTreeItem): Promise<void> {
  let note: ReviewNote | undefined;

  if (item && item.itemType === 'note' && item.data) {
    note = item.data as ReviewNote;
  } else {
    // Let user select a note
    const notes = storage.getAllNotes().filter(n => n.status !== 'resolved');
    if (notes.length === 0) {
      vscode.window.showInformationMessage('No notes to edit.');
      return;
    }

    const noteItems = notes.map(n => ({
      label: truncate(n.content, 60),
      description: NOTE_TYPE_LABELS[n.type],
      note: n
    }));

    const selected = await vscode.window.showQuickPick(noteItems, {
      placeHolder: 'Select a note to edit'
    });

    if (!selected) {
      return;
    }

    note = selected.note;
  }

  // Edit content
  const newContent = await vscode.window.showInputBox({
    prompt: 'Edit note content',
    value: note.content,
    validateInput: (value) => {
      if (!value || value.trim().length === 0) {
        return 'Note content is required';
      }
      return null;
    }
  });

  if (!newContent) {
    return;
  }

  // Edit type
  const typeItems = Object.entries(NOTE_TYPE_LABELS).map(([key, label]) => ({
    label,
    value: key as NoteType,
    description: getTypeDescription(key as NoteType),
    picked: key === note!.type
  }));

  const selectedType = await vscode.window.showQuickPick(typeItems, {
    placeHolder: 'Select note type'
  });

  if (!selectedType) {
    return;
  }

  // Edit status
  const statusItems: Array<{ label: string; value: NoteStatus; picked: boolean }> = [
    { label: 'Open', value: 'open', picked: note.status === 'open' },
    { label: 'Investigating', value: 'investigating', picked: note.status === 'investigating' },
    { label: 'Promote', value: 'promote', picked: note.status === 'promote' },
    { label: 'Resolved', value: 'resolved', picked: note.status === 'resolved' }
  ];

  const selectedStatus = await vscode.window.showQuickPick(statusItems, {
    placeHolder: 'Select note status'
  });

  if (!selectedStatus) {
    return;
  }

  storage.updateNote(note.id, {
    content: newContent.trim(),
    type: selectedType.value,
    status: selectedStatus.value
  });

  vscode.window.showInformationMessage('Note updated');
}

/**
 * Delete a note
 */
async function deleteNote(storage: NoteStorage, item?: NoteTreeItem): Promise<void> {
  let noteId: string | undefined;
  let noteContent: string | undefined;

  if (item && item.itemType === 'note' && item.noteId && item.data) {
    noteId = item.noteId;
    noteContent = (item.data as ReviewNote).content;
  } else {
    // Let user select a note
    const notes = storage.getAllNotes();
    if (notes.length === 0) {
      vscode.window.showInformationMessage('No notes to delete.');
      return;
    }

    const noteItems = notes.map(n => ({
      label: truncate(n.content, 60),
      description: NOTE_TYPE_LABELS[n.type],
      noteId: n.id,
      content: n.content
    }));

    const selected = await vscode.window.showQuickPick(noteItems, {
      placeHolder: 'Select a note to delete'
    });

    if (!selected) {
      return;
    }

    noteId = selected.noteId;
    noteContent = selected.content;
  }

  // Confirm deletion
  const confirm = await vscode.window.showWarningMessage(
    `Delete note: "${truncate(noteContent || '', 40)}"?`,
    'Delete',
    'Cancel'
  );

  if (confirm !== 'Delete') {
    return;
  }

  storage.deleteNote(noteId);
  vscode.window.showInformationMessage('Note deleted');
}

/**
 * Navigate to a file location
 */
async function goToLocation(location?: NoteLocation): Promise<void> {
  if (!location) {
    vscode.window.showWarningMessage('No location specified');
    return;
  }

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage('No workspace folder open');
    return;
  }

  // Resolve file path - try multiple strategies
  let filePath = location.file;
  let resolvedPath: string | undefined;

  // Strategy 1: Check if absolute path
  if (path.isAbsolute(filePath) && fs.existsSync(filePath)) {
    resolvedPath = filePath;
  }

  // Strategy 2: Try each workspace folder
  if (!resolvedPath) {
    for (const folder of workspaceFolders) {
      const candidatePath = path.join(folder.uri.fsPath, filePath);
      if (fs.existsSync(candidatePath)) {
        resolvedPath = candidatePath;
        break;
      }
    }
  }

  // Strategy 3: Try removing first path segment (in case of nested workspace)
  if (!resolvedPath && filePath.includes('/')) {
    const segments = filePath.split('/');
    const withoutFirst = segments.slice(1).join('/');
    for (const folder of workspaceFolders) {
      const candidatePath = path.join(folder.uri.fsPath, withoutFirst);
      if (fs.existsSync(candidatePath)) {
        resolvedPath = candidatePath;
        break;
      }
    }
  }

  // Strategy 4: Search for file by name in workspace
  if (!resolvedPath) {
    const fileName = path.basename(filePath);
    const files = await vscode.workspace.findFiles(`**/${fileName}`, '**/node_modules/**', 5);
    if (files.length === 1) {
      resolvedPath = files[0].fsPath;
    } else if (files.length > 1) {
      // Multiple matches - try to find one that matches the path pattern
      const matchingFile = files.find(f => f.fsPath.includes(filePath.replace(/\//g, path.sep)));
      if (matchingFile) {
        resolvedPath = matchingFile.fsPath;
      }
    }
  }

  if (!resolvedPath || !fs.existsSync(resolvedPath)) {
    vscode.window.showErrorMessage(`File not found: ${location.file}`);
    return;
  }

  const uri = vscode.Uri.file(resolvedPath);
  const document = await vscode.workspace.openTextDocument(uri);
  const editor = await vscode.window.showTextDocument(document);

  // Go to line
  const line = Math.max(0, location.line - 1);
  const position = new vscode.Position(line, 0);
  editor.selection = new vscode.Selection(position, position);
  editor.revealRange(
    new vscode.Range(position, position),
    vscode.TextEditorRevealType.InCenter
  );
}

/**
 * Search notes by content, tags, or file
 */
async function searchNotes(provider: NoteProvider): Promise<void> {
  const query = await vscode.window.showInputBox({
    prompt: 'Search notes',
    placeHolder: 'Enter search term (searches content, tags, and files)'
  });

  if (query === undefined) {
    return; // User cancelled
  }

  if (query === '') {
    provider.setSearchQuery(undefined);
    vscode.window.showInformationMessage('Search cleared');
  } else {
    provider.setSearchQuery(query);
    const filterSummary = provider.getFilterSummary();
    vscode.window.showInformationMessage(`Search applied ${filterSummary}`);
  }
}

/**
 * Filter notes by type
 */
async function filterByType(provider: NoteProvider): Promise<void> {
  const typeItems = [
    { label: 'All Types', value: undefined, description: 'Show all note types' },
    ...Object.entries(NOTE_TYPE_LABELS).map(([key, label]) => ({
      label,
      value: key as NoteType,
      description: getTypeDescription(key as NoteType)
    }))
  ];

  const selected = await vscode.window.showQuickPick(typeItems, {
    placeHolder: 'Filter by note type'
  });

  if (!selected) {
    return;
  }

  provider.setTypeFilter(selected.value);
  if (selected.value) {
    vscode.window.showInformationMessage(`Filtering by ${selected.label}`);
  } else {
    vscode.window.showInformationMessage('Type filter cleared');
  }
}

/**
 * Quick note - create a bookmark with minimal input
 */
async function quickNote(storage: NoteStorage): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor. Open a file to add a quick note.');
    return;
  }

  const content = await vscode.window.showInputBox({
    prompt: 'Quick bookmark note',
    placeHolder: 'Enter note content'
  });

  if (!content) {
    return;
  }

  const document = editor.document;
  const position = editor.selection.active;
  const preview = await getLinePreview(document.uri.fsPath, position.line + 1);

  const location: NoteLocation = {
    file: vscode.workspace.asRelativePath(document.uri),
    line: position.line + 1,
    preview
  };

  const currentBranch = await getCurrentBranch();
  const note = createNote(content.trim(), 'bookmark', [location], undefined, currentBranch);
  storage.addNote(note);

  vscode.window.showInformationMessage(`Quick bookmark added: ${truncate(content, 40)}`);
}

/**
 * Remove a location from a note
 */
async function removeLocation(storage: NoteStorage, item?: NoteTreeItem): Promise<void> {
  if (!item || (item.itemType !== 'location' && item.itemType !== 'location-stale')) {
    vscode.window.showWarningMessage('Select a location to remove');
    return;
  }

  const location = item.data as NoteLocation;
  const noteId = item.noteId;

  if (!noteId || !location) {
    vscode.window.showWarningMessage('Invalid location item');
    return;
  }

  const note = storage.getNote(noteId);
  if (!note) {
    vscode.window.showWarningMessage('Note not found');
    return;
  }

  // If this is the last location, warn about note deletion
  if (note.locations.length === 1) {
    const confirm = await vscode.window.showWarningMessage(
      'This is the only location. Removing it will delete the note. Continue?',
      'Delete Note',
      'Cancel'
    );

    if (confirm !== 'Delete Note') {
      return;
    }
  }

  storage.removeLocation(noteId, location.file, location.line);
  vscode.window.showInformationMessage('Location removed');
}

/**
 * Cleanup all stale locations across all notes
 */
async function cleanupStaleLocations(storage: NoteStorage, provider: NoteProvider): Promise<void> {
  const staleLocations = provider.getStaleLocations();

  if (staleLocations.length === 0) {
    vscode.window.showInformationMessage('No stale locations found');
    return;
  }

  const confirm = await vscode.window.showWarningMessage(
    `Found ${staleLocations.length} stale location(s). Remove them?`,
    'Remove All',
    'Cancel'
  );

  if (confirm !== 'Remove All') {
    return;
  }

  let removedCount = 0;
  for (const { noteId, location } of staleLocations) {
    try {
      storage.removeLocation(noteId, location.file, location.line);
      removedCount++;
    } catch (error) {
      console.error('Error removing stale location:', error);
    }
  }

  vscode.window.showInformationMessage(`Removed ${removedCount} stale location(s)`);
}

/**
 * Resolve multiple selected notes
 */
async function resolveSelected(storage: NoteStorage, items: NoteTreeItem[]): Promise<void> {
  const noteItems = items.filter(item => item.itemType === 'note' && item.noteId);

  if (noteItems.length === 0) {
    vscode.window.showWarningMessage('No notes selected');
    return;
  }

  const confirm = await vscode.window.showInformationMessage(
    `Resolve ${noteItems.length} note(s)?`,
    'Resolve All',
    'Cancel'
  );

  if (confirm !== 'Resolve All') {
    return;
  }

  for (const item of noteItems) {
    try {
      storage.updateNote(item.noteId!, { status: 'resolved' });
    } catch (error) {
      console.error('Error resolving note:', error);
    }
  }

  vscode.window.showInformationMessage(`Resolved ${noteItems.length} note(s)`);
}

/**
 * Delete multiple selected notes
 */
async function deleteSelected(storage: NoteStorage, items: NoteTreeItem[]): Promise<void> {
  const noteItems = items.filter(item => item.itemType === 'note' && item.noteId);

  if (noteItems.length === 0) {
    vscode.window.showWarningMessage('No notes selected');
    return;
  }

  const confirm = await vscode.window.showWarningMessage(
    `Delete ${noteItems.length} note(s)? This cannot be undone.`,
    'Delete All',
    'Cancel'
  );

  if (confirm !== 'Delete All') {
    return;
  }

  for (const item of noteItems) {
    try {
      storage.deleteNote(item.noteId!);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  }

  vscode.window.showInformationMessage(`Deleted ${noteItems.length} note(s)`);
}

/**
 * Resolve all notes in a group
 */
async function resolveAllInGroup(storage: NoteStorage, provider: NoteProvider, item?: NoteTreeItem): Promise<void> {
  if (!item || item.itemType !== 'group') {
    vscode.window.showWarningMessage('Select a group to resolve all notes');
    return;
  }

  // Get all notes - we'll need to filter based on grouping
  const allNotes = storage.getAllNotes().filter(n => n.status !== 'resolved');

  if (allNotes.length === 0) {
    vscode.window.showInformationMessage('No notes to resolve');
    return;
  }

  const confirm = await vscode.window.showInformationMessage(
    `Resolve all notes in this group?`,
    'Resolve All',
    'Cancel'
  );

  if (confirm !== 'Resolve All') {
    return;
  }

  let resolvedCount = 0;
  for (const note of allNotes) {
    try {
      storage.updateNote(note.id, { status: 'resolved' });
      resolvedCount++;
    } catch (error) {
      console.error('Error resolving note:', error);
    }
  }

  vscode.window.showInformationMessage(`Resolved ${resolvedCount} note(s)`);
}

/**
 * Get description for note type
 */
function getTypeDescription(type: NoteType): string {
  switch (type) {
    case 'question':
      return 'Need answer or clarification';
    case 'uncertainty':
      return 'Not sure yet, need more context';
    case 'concern':
      return 'Potential issue to investigate';
    case 'bookmark':
      return 'Come back to this later';
    case 'pre-debate':
      return 'Might warrant formal DEB-NNNN';
    default:
      return '';
  }
}

/**
 * Truncate text to a maximum length
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}
