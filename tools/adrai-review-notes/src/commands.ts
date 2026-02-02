/**
 * adrai Review Notes - Command Implementations
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
  FilePosition,
  NOTE_TYPE_LABELS,
  NOTE_TYPES_ORDERED,
  STATUS_LABELS,
  STATUS_ICONS
} from './types';
import { NoteStorage, createNote, getLinePreview, getCurrentBranch, branchExists } from './noteStorage';
import { NoteProvider, NoteTreeItem } from './noteProvider';

// AIDE-0007: Default debate template - clean, ready-to-use (no instructions/code fences)
const DEFAULT_DEBATE_TEMPLATE = `# DEB-NNNN: [Central Question]

> **Status:** Draft | Active | Blocked | Deciding | Resolved | Superseded
> **Owner:** @your-name
> **Created:** YYYY-MM-DD
> **Updated:** YYYY-MM-DD
> **Priority:** 1 (Urgent) | 2 (High) | 3 (Normal) | 4 (Low)

---

## Lineage

| Field | Value |
|-------|-------|
| **Scope** | CON (Concept) |
| **Parent** | [REQ-NNN](link) or [OBJ-NNN](link) |
| **Purpose** | [Why does this debate exist? What decision does it enable?] |
| **Supersedes** | None | DEB-NNNN |
| **Blocked By** | None | DEB-NNNN |

---

## Dependencies

> **Depends On:** DEB-NNNN, ADR-NNN (list debates/decisions this waits for)
> **Blocks:** AIDE-NNNN, ADR-NNN (list plans/decisions waiting on this)

---

## Stakeholders

| Role | Person | Required? |
|------|--------|-----------|
| Owner | @name | Yes |
| Decider | @name | Yes |
| Contributor | @name | No |
| Reviewer | @name | No |

---

## The Question

[Central Question]: What is the core question we need to answer?

---

## Theses

### Thesis A: [Option Name]

<[Thesis A]>: [One-sentence position statement]

+ [Supporting Claim 1]: Description of why this supports Thesis A
  + [Sub-claim]: Additional supporting evidence
  - <Objection to claim>: Counter-argument to this claim
    + [Response]: Rebuttal to the objection

+ [Supporting Claim 2]: Another reason to support Thesis A

- [Weakness 1]: Acknowledged limitation of Thesis A
  + [Mitigation]: How this weakness could be addressed

### Thesis B: [Alternative Option Name]

<[Thesis B]>: [One-sentence position statement]

+ [Supporting Claim 1]: Description of why this supports Thesis B

- [Weakness 1]: Acknowledged limitation of Thesis B

### Thesis C: [Do Nothing / Status Quo]

<[Thesis C]>: We should not make a change at this time.

+ [Stability]: No risk of regression
- [Technical Debt]: Problem continues to compound

---

## Evidence

### E1: [Evidence Title]

**Type:** Benchmark | Research | Experience | POC | Expert Opinion
**Source:** [Link or reference]
**Summary:** [What does this evidence show?]
**Supports:** Thesis A, Thesis B

### E2: [Evidence Title]

**Type:** Benchmark | Research | Experience | POC | Expert Opinion
**Source:** [Link or reference]
**Summary:** [What does this evidence show?]
**Supports:** Thesis B

---

## Trade-off Analysis

| Factor | Thesis A | Thesis B | Thesis C |
|--------|----------|----------|----------|
| Complexity | Low | Medium | None |
| Risk | Medium | Low | High (tech debt) |
| Cost | $ | $$ | $0 |
| Time to implement | 2 weeks | 4 weeks | N/A |
| Team familiarity | High | Low | N/A |
| Reversibility | Easy | Hard | N/A |

---

## Discussion Log

### YYYY-MM-DD: @contributor
[Summary of contribution or concern raised]

### YYYY-MM-DD: @reviewer
[Feedback or questions]

---

## Resolution

**Status:** Pending | Voting | Decided

**Decision:** [Which thesis was selected, if resolved]

**Rationale:** [Why this thesis was chosen over alternatives]

**Produces:**
- [ ] ADR-NNN: [Decision record to create]
- [ ] Unblocks: AIDE-NNNN, AIDE-NNNN

**Decided by:** @decider
**Date:** YYYY-MM-DD

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | YYYY-MM-DD | @author | Initial draft |
`;

// Store treeView reference for forceNavigate and note selection
let treeViewRef: vscode.TreeView<NoteTreeItem> | undefined;
let providerRef: NoteProvider | undefined;
let storageRef: NoteStorage | undefined;

/**
 * AIDE-0006: Refocus the tree view after operations to prevent focus jumping to editor
 */
function refocusTreeView(): void {
  if (!treeViewRef) return;

  // Use longer delay and reveal with focus to force tree view focus
  setTimeout(async () => {
    try {
      // If there's a selection, reveal it with focus
      if (treeViewRef!.selection.length > 0) {
        await treeViewRef!.reveal(treeViewRef!.selection[0], {
          select: true,
          focus: true
        });
      } else {
        // Fallback: just focus the view
        await vscode.commands.executeCommand('adraiReviewNotes.focus');
      }
    } catch (e) {
      // Silently fail
    }
  }, 100);
}

/**
 * Register all commands for the extension
 */
export function registerCommands(
  context: vscode.ExtensionContext,
  storage: NoteStorage,
  provider: NoteProvider,
  treeView?: vscode.TreeView<NoteTreeItem>
): void {
  treeViewRef = treeView;
  providerRef = provider;
  storageRef = storage;
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

  // Clear Search command
  context.subscriptions.push(
    vscode.commands.registerCommand('adrai.clearSearch', () => clearSearch(provider))
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

  // Toggle Branch Filter commands (two entries for different icons)
  const toggleBranchFilter = () => {
    const enabled = provider.toggleBranchFilter();
    // Set context for conditional icon display
    vscode.commands.executeCommand('setContext', 'adrai.branchFilterActive', enabled);
    vscode.window.showInformationMessage(
      enabled ? 'Branch filter enabled - showing current branch notes only' : 'Branch filter disabled - showing all notes'
    );
  };

  context.subscriptions.push(
    vscode.commands.registerCommand('adrai.toggleBranchFilter', toggleBranchFilter)
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('adrai.toggleBranchFilterOff', toggleBranchFilter)
  );

  // Initialize context for branch filter (read initial state)
  vscode.commands.executeCommand('setContext', 'adrai.branchFilterActive', provider.isBranchFilterEnabled());

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

  // Warn about other-branch note and offer navigation
  context.subscriptions.push(
    vscode.commands.registerCommand('adrai.warnOtherBranch', (location?: NoteLocation, branch?: string) =>
      warnOtherBranch(location, branch)
    )
  );

  // Cycle Sort By command
  context.subscriptions.push(
    vscode.commands.registerCommand('adrai.cycleSortBy', () => cycleSortBy())
  );

  // Set Status command (supports multi-selection)
  context.subscriptions.push(
    vscode.commands.registerCommand('adrai.setStatus', (item?: NoteTreeItem, items?: NoteTreeItem[]) =>
      setStatus(storage, item, items)
    )
  );

  // Force Navigate command (for other-branch notes via CTRL+ALT+Enter)
  context.subscriptions.push(
    vscode.commands.registerCommand('adrai.forceNavigate', () => forceNavigate(storage))
  );

  // AIDE-0006: Copy Note command (CTRL+C to copy note content)
  context.subscriptions.push(
    vscode.commands.registerCommand('adrai.copyNote', () => copyNote())
  );

  // AIDE-0006: Undo command (CTRL+Z to restore deleted/reverted note)
  context.subscriptions.push(
    vscode.commands.registerCommand('adrai.undo', () => undoOperation(storage))
  );
}

/**
 * AIDE-0006: Undo the last delete or update operation
 * Triggered by CTRL+Z when tree view is focused
 */
async function undoOperation(storage: NoteStorage): Promise<void> {
  if (!storage.canUndo()) {
    vscode.window.showInformationMessage('Nothing to undo');
    return;
  }

  const restored = storage.undo();
  if (restored) {
    vscode.window.showInformationMessage(`Restored: ${truncate(restored.content, 40)}`);
    // Select the restored note in the tree and keep focus
    selectNoteInTree(restored.id);
    refocusTreeView();
  }
}

/**
 * AIDE-0006: Copy selected note's content to clipboard
 * Triggered by CTRL+C when tree view is focused
 */
async function copyNote(): Promise<void> {
  if (!treeViewRef) {
    return;
  }

  const selection = treeViewRef.selection;
  if (selection.length === 0) {
    vscode.window.showWarningMessage('No note selected');
    return;
  }

  const item = selection[0];
  if (item.itemType !== 'note' && item.itemType !== 'note-other-branch') {
    return;
  }

  const note = item.data as ReviewNote;
  if (note) {
    await vscode.env.clipboard.writeText(note.content);
    vscode.window.showInformationMessage(`Copied: ${truncate(note.content, 40)}`);
    refocusTreeView();
  }
}

/**
 * Force navigate to selected note's location (for other-branch notes)
 * Triggered by CTRL+ALT+Enter when tree view is focused
 */
async function forceNavigate(storage: NoteStorage): Promise<void> {
  if (!treeViewRef) {
    return;
  }

  const selection = treeViewRef.selection;
  if (selection.length === 0) {
    vscode.window.showWarningMessage('No note selected');
    return;
  }

  const item = selection[0];
  if (item.itemType !== 'note' && item.itemType !== 'note-other-branch') {
    return;
  }

  const note = item.data as ReviewNote;
  if (note && note.locations.length > 0) {
    await goToLocation(note.locations[0]);
  }
}

/**
 * Add a new review note at the current cursor position
 * If no editor is open, creates a location-free IDEA note
 */
async function addNote(storage: NoteStorage): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  const hasEditor = !!editor;

  // Get note content
  const content = await vscode.window.showInputBox({
    prompt: hasEditor ? 'Enter your review note' : 'Enter your idea (no file location)',
    placeHolder: hasEditor ? 'What do you want to note about this location?' : 'Capture your idea or insight',
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

  // Auto-detect note type from punctuation (no confirmation needed)
  const detectedType = detectNoteType(content);
  let selectedType: { value: NoteType };

  if (detectedType) {
    // Use detected type directly
    selectedType = { value: detectedType };
  } else if (!hasEditor) {
    // No editor: default to idea type
    selectedType = { value: 'idea' };
  } else {
    // No detection, show type picker (ordered by urgency)
    const typeItems = NOTE_TYPES_ORDERED.map(type => ({
      label: NOTE_TYPE_LABELS[type],
      value: type,
      description: getTypeDescription(type)
    }));

    const picked = await vscode.window.showQuickPick(typeItems, {
      placeHolder: 'Select note type'
    });

    if (!picked) {
      return; // User cancelled
    }
    selectedType = picked;
  }

  // Create location (empty array if no editor)
  // AIDE-0006: Capture selection if text is selected
  let locations: NoteLocation[] = [];
  if (hasEditor) {
    const document = editor.document;
    const selection = editor.selection;
    const position = selection.active;
    const preview = await getLinePreview(document.uri.fsPath, position.line + 1);

    const location: NoteLocation = {
      file: vscode.workspace.asRelativePath(document.uri),
      line: position.line + 1, // 1-indexed
      preview
    };

    // AIDE-0006: Store selection if text is selected (not just cursor)
    if (!selection.isEmpty) {
      location.selectionStart = {
        line: selection.start.line + 1, // 1-indexed
        character: selection.start.character
      };
      location.selectionEnd = {
        line: selection.end.line + 1, // 1-indexed
        character: selection.end.character
      };
    }

    locations = [location];
  }

  // Get current branch
  const currentBranch = await getCurrentBranch();

  // Create and save note
  const note = createNote(content.trim(), selectedType.value, locations, undefined, currentBranch);
  storage.addNote(note);

  vscode.window.showInformationMessage(`${NOTE_TYPE_LABELS[selectedType.value]} added: ${truncate(content, 50)}`);

  // Focus the Review Notes panel and select the new note
  vscode.commands.executeCommand('adraiReviewNotes.focus');
  selectNoteInTree(note.id);
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

  // AIDE-0006: Capture selection BEFORE any dialogs (dialogs may clear selection)
  const document = editor.document;
  const selection = editor.selection;
  const position = selection.active;

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

  // Create location (selection already captured above)
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

  // AIDE-0006: Store selection if text is selected (not just cursor)
  if (!selection.isEmpty) {
    location.selectionStart = {
      line: selection.start.line + 1,
      character: selection.start.character
    };
    location.selectionEnd = {
      line: selection.end.line + 1,
      character: selection.end.character
    };
  }

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

  // AIDE-0007: Use template file if exists, otherwise use built-in default
  let templateContent: string;
  if (fs.existsSync(templatePath)) {
    templateContent = fs.readFileSync(templatePath, 'utf-8');
  } else {
    // Use built-in default template and auto-create for future customization
    templateContent = DEFAULT_DEBATE_TEMPLATE;
    fs.mkdirSync(path.dirname(templatePath), { recursive: true });
    fs.writeFileSync(templatePath, templateContent, 'utf-8');
    vscode.window.showInformationMessage(`Created debate template at ${templatePath}`);
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

  // Add location pointing to the created debate file
  const debateLocation: NoteLocation = {
    file: path.join(debatesDir, debateFileName),
    line: 1,
    section: `Promoted to ${nextId}`,
    preview: `# ${nextId}: ${note.content.substring(0, 50)}`
  };
  storage.addLocation(note.id, debateLocation);

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
 * Set note status via quick pick (supports multi-selection)
 */
async function setStatus(storage: NoteStorage, item?: NoteTreeItem, items?: NoteTreeItem[]): Promise<void> {
  // Gather all selected notes
  let notes: ReviewNote[] = [];

  // If items array provided (multi-select), use those
  if (items && items.length > 0) {
    const noteItems = items.filter(i => i.itemType === 'note' || i.itemType === 'note-other-branch');
    notes = noteItems.map(i => i.data as ReviewNote).filter(Boolean);
  } else if (item && (item.itemType === 'note' || item.itemType === 'note-other-branch') && item.data) {
    notes = [item.data as ReviewNote];
  } else {
    // Let user select a note
    const allNotes = storage.getAllNotes();
    if (allNotes.length === 0) {
      vscode.window.showInformationMessage('No notes available.');
      return;
    }

    const notePickItems = allNotes.map(n => ({
      label: truncate(n.content, 60),
      description: `${NOTE_TYPE_LABELS[n.type]} - ${STATUS_LABELS[n.status]}`,
      note: n
    }));

    const selected = await vscode.window.showQuickPick(notePickItems, {
      placeHolder: 'Select a note to change status'
    });

    if (!selected) {
      return;
    }

    notes = [selected.note];
  }

  if (notes.length === 0) {
    vscode.window.showWarningMessage('No notes selected');
    return;
  }

  // Show status picker
  const statusItems: Array<{ label: string; value: NoteStatus; description: string; iconPath?: vscode.ThemeIcon }> = [
    { label: 'Open', value: 'open', description: 'Newly created, needs attention', iconPath: new vscode.ThemeIcon(STATUS_ICONS.open) },
    { label: 'Investigating', value: 'investigating', description: 'Being researched/explored', iconPath: new vscode.ThemeIcon(STATUS_ICONS.investigating) },
    { label: 'Promote', value: 'promote', description: 'Marked for debate promotion', iconPath: new vscode.ThemeIcon(STATUS_ICONS.promote) },
    { label: 'Resolved', value: 'resolved', description: 'Closed, no longer active', iconPath: new vscode.ThemeIcon(STATUS_ICONS.resolved) }
  ];

  // For single note, mark current status
  if (notes.length === 1) {
    const currentIndex = statusItems.findIndex(s => s.value === notes[0].status);
    if (currentIndex >= 0) {
      statusItems[currentIndex].label = `${statusItems[currentIndex].label} (current)`;
    }
  }

  const placeHolder = notes.length === 1
    ? `Current: ${STATUS_LABELS[notes[0].status]} - Select new status`
    : `Set status for ${notes.length} notes`;

  const selectedStatus = await vscode.window.showQuickPick(statusItems, { placeHolder });

  if (!selectedStatus) {
    return;
  }

  // Update all selected notes
  let updatedCount = 0;
  for (const note of notes) {
    if (note.status !== selectedStatus.value) {
      storage.updateNote(note.id, { status: selectedStatus.value });
      updatedCount++;
    }
  }

  if (updatedCount > 0) {
    const msg = updatedCount === 1
      ? `Status changed to ${STATUS_LABELS[selectedStatus.value]}`
      : `Changed ${updatedCount} notes to ${STATUS_LABELS[selectedStatus.value]}`;
    vscode.window.showInformationMessage(msg);
    refocusTreeView();
  }
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
  refocusTreeView();
}

/**
 * Edit an existing note
 * AIDE-0006: F2 keybinding support - uses tree selection if no item passed
 */
async function editNote(storage: NoteStorage, item?: NoteTreeItem): Promise<void> {
  let note: ReviewNote | undefined;

  // AIDE-0006: If no item passed, try to get from tree selection (F2 keybinding)
  if (!item && treeViewRef) {
    const selection = treeViewRef.selection;
    if (selection.length > 0) {
      const selected = selection[0];
      if ((selected.itemType === 'note' || selected.itemType === 'note-other-branch') && selected.data) {
        note = selected.data as ReviewNote;
      }
    }
  } else if (item && (item.itemType === 'note' || item.itemType === 'note-other-branch') && item.data) {
    note = item.data as ReviewNote;
  }

  if (!note) {
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

  // Edit type (ordered by urgency)
  const typeItems = NOTE_TYPES_ORDERED.map(type => ({
    label: NOTE_TYPE_LABELS[type],
    value: type,
    description: getTypeDescription(type),
    picked: type === note!.type
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
  refocusTreeView();
}

/**
 * Delete a note
 * AIDE-0006: No confirmation for single note deletion (fast workflow)
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

  // AIDE-0006: Skip confirmation for single note deletion - use undo instead
  storage.deleteNote(noteId);
  vscode.window.showInformationMessage(`Deleted: ${truncate(noteContent || '', 40)}`);
  refocusTreeView();
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

  // Resolve file path with multiple strategies
  const filePath = location.file;
  let resolvedPath: string | undefined;

  // Strategy 1: Absolute path
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

  // Strategy 3: Remove first segment (for nested workspace paths like "adrai/plans/...")
  if (!resolvedPath && filePath.includes('/')) {
    const withoutFirst = filePath.split('/').slice(1).join('/');
    for (const folder of workspaceFolders) {
      const candidatePath = path.join(folder.uri.fsPath, withoutFirst);
      if (fs.existsSync(candidatePath)) {
        resolvedPath = candidatePath;
        break;
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

  // AIDE-0006: Restore selection if available, otherwise just go to line
  if (location.selectionStart && location.selectionEnd) {
    // Restore full selection
    const startPos = new vscode.Position(
      location.selectionStart.line - 1, // Convert to 0-indexed
      location.selectionStart.character
    );
    const endPos = new vscode.Position(
      location.selectionEnd.line - 1, // Convert to 0-indexed
      location.selectionEnd.character
    );
    editor.selection = new vscode.Selection(startPos, endPos);
    editor.revealRange(
      new vscode.Range(startPos, endPos),
      vscode.TextEditorRevealType.InCenter
    );
  } else {
    // Legacy behavior: just go to line
    const line = Math.max(0, location.line - 1);
    const position = new vscode.Position(line, 0);
    editor.selection = new vscode.Selection(position, position);
    editor.revealRange(
      new vscode.Range(position, position),
      vscode.TextEditorRevealType.InCenter
    );
  }
}

/**
 * Warn about clicking on other-branch note and offer navigation
 */
async function warnOtherBranch(location?: NoteLocation, branch?: string): Promise<void> {
  const action = await vscode.window.showWarningMessage(
    `This note is from branch "${branch || 'unknown'}". Navigate anyway?`,
    'Go to Location',
    'Cancel'
  );

  if (action === 'Go to Location' && location) {
    await goToLocation(location);
  }
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
    vscode.commands.executeCommand('setContext', 'adrai.searchActive', false);
    vscode.window.showInformationMessage('Search cleared');
  } else {
    // Try the search and check if it finds anything
    const resultCount = provider.trySearchQuery(query);

    if (resultCount === 0) {
      // No results - keep current list, inform user
      vscode.window.showWarningMessage(`No notes found matching "${query}" - list unchanged`);
    } else {
      // Results found - apply the search
      provider.setSearchQuery(query);
      vscode.commands.executeCommand('setContext', 'adrai.searchActive', true);
      const filterSummary = provider.getFilterSummary();
      vscode.window.showInformationMessage(`Found ${resultCount} note(s) ${filterSummary}`);
    }
  }
}

/**
 * Clear search filter
 */
function clearSearch(provider: NoteProvider): void {
  provider.setSearchQuery(undefined);
  vscode.commands.executeCommand('setContext', 'adrai.searchActive', false);
  vscode.window.showInformationMessage('Search cleared');
}

/**
 * Filter notes by type
 */
async function filterByType(provider: NoteProvider): Promise<void> {
  const typeItems = [
    { label: 'All Types', value: undefined as NoteType | undefined, description: 'Show all note types' },
    ...NOTE_TYPES_ORDERED.map(type => ({
      label: NOTE_TYPE_LABELS[type],
      value: type as NoteType | undefined,
      description: getTypeDescription(type)
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
 * Quick note - create a note with auto-detected type (defaults to configured type and status)
 * If no editor is open, creates a location-free note (defaults to IDEA type)
 */
async function quickNote(storage: NoteStorage): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  const hasEditor = !!editor;

  // Get configured defaults
  const config = vscode.workspace.getConfiguration('adrai');
  const defaultType = config.get<NoteType>('quickNoteDefaultType', 'bookmark');
  const defaultStatus = config.get<NoteStatus>('quickNoteDefaultStatus', 'open');

  const content = await vscode.window.showInputBox({
    prompt: hasEditor
      ? 'Quick note (type detected from punctuation: + ? ! ~ !!)'
      : 'Quick idea (no file location, type detected from punctuation: + ? ! ~ !!)',
    placeHolder: 'Enter note content'
  });

  if (!content) {
    return;
  }

  // Auto-detect type, default to configured type (or 'idea' if no editor)
  const detectedType = detectNoteType(content);
  const noteType = detectedType || (hasEditor ? defaultType : 'idea');

  // Create location (empty array if no editor)
  // AIDE-0006: Capture selection if text is selected
  let locations: NoteLocation[] = [];
  if (hasEditor) {
    const document = editor.document;
    const selection = editor.selection;
    const position = selection.active;
    const preview = await getLinePreview(document.uri.fsPath, position.line + 1);

    const location: NoteLocation = {
      file: vscode.workspace.asRelativePath(document.uri),
      line: position.line + 1,
      preview
    };

    // AIDE-0006: Store selection if text is selected (not just cursor)
    if (!selection.isEmpty) {
      location.selectionStart = {
        line: selection.start.line + 1, // 1-indexed
        character: selection.start.character
      };
      location.selectionEnd = {
        line: selection.end.line + 1, // 1-indexed
        character: selection.end.character
      };
    }

    locations = [location];
  }

  const currentBranch = await getCurrentBranch();
  const note = createNote(content.trim(), noteType, locations, undefined, currentBranch, defaultStatus);
  storage.addNote(note);

  vscode.window.showInformationMessage(`${NOTE_TYPE_LABELS[noteType]} added: ${truncate(content, 40)}`);

  // Focus the Review Notes panel and select the new note
  vscode.commands.executeCommand('adraiReviewNotes.focus');
  selectNoteInTree(note.id);
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
  refocusTreeView();
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
  refocusTreeView();
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
  refocusTreeView();
}

/**
 * Detect note type from content punctuation
 * Rules:
 *   - `!!` at end → Pre-debate
 *   - `?` at end → Question
 *   - `!` at end → Concern
 *   - `~` at end → Uncertainty
 *   - `+` at end → Idea
 *   - No special punctuation → Show type picker (return undefined)
 */
function detectNoteType(content: string): NoteType | undefined {
  const trimmed = content.trim();

  // Check for !! first (pre-debate) - must be before single !
  if (trimmed.endsWith('!!')) {
    return 'pre-debate';
  }

  // Check ending punctuation
  if (trimmed.endsWith('?')) {
    return 'question';
  }

  if (trimmed.endsWith('!')) {
    return 'concern';
  }

  if (trimmed.endsWith('~')) {
    return 'uncertainty';
  }

  if (trimmed.endsWith('+')) {
    return 'idea';
  }

  // No special punctuation - return undefined to show type picker

  return undefined; // Let user choose
}

/**
 * Get description for note type
 */
function getTypeDescription(type: NoteType): string {
  switch (type) {
    case 'idea':
      return 'Capture a new idea or insight';
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

/**
 * Cycle through sort modes: date ↓ → date ↑ → type/status ↓ → type/status ↑ → date ↓
 * Uses type when grouped by status, status when grouped by type
 */
async function cycleSortBy(): Promise<void> {
  const config = vscode.workspace.getConfiguration('adrai');
  const currentSortBy = config.get<string>('sortBy', 'date');
  const currentOrder = config.get<string>('sortOrder', 'desc');
  const groupBy = config.get<string>('groupBy', 'status');

  // Determine the alternative sort (not date)
  const altSort = groupBy === 'type' ? 'status' : 'type';

  let newSortBy: string = currentSortBy;
  let newOrder: string;

  // Cycle: date desc → date asc → alt desc → alt asc → date desc
  if (currentOrder === 'desc') {
    newOrder = 'asc';
  } else {
    newOrder = 'desc';
    newSortBy = currentSortBy === 'date' ? altSort : 'date';
  }

  await config.update('sortBy', newSortBy, true);
  await config.update('sortOrder', newOrder, true);

  const orderLabel = newOrder === 'desc' ? '↓' : '↑';
  vscode.window.showInformationMessage(`Sort: ${newSortBy} ${orderLabel}`);
}

/**
 * Select a note in the tree view by ID
 * Uses a short delay to allow the tree to refresh after note creation
 */
function selectNoteInTree(noteId: string): void {
  if (!treeViewRef || !providerRef || !storageRef) {
    return;
  }

  // Small delay to let the tree refresh
  setTimeout(async () => {
    try {
      const note = storageRef!.getNote(noteId);
      if (!note) return;

      // Create a temporary tree item to reveal
      const item = new NoteTreeItem(
        note.content.substring(0, 50),
        vscode.TreeItemCollapsibleState.None,
        'note',
        note,
        note.id
      );

      await treeViewRef!.reveal(item, { select: true, focus: false });
    } catch (error) {
      // Silently fail if reveal doesn't work
      console.log('Could not reveal note:', error);
    }
  }, 100);
}
