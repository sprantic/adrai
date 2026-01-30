# AIDE-0006: UX Improvements Phase 3

> **Status:** Complete (with known issue)
> **Author:** @sprantic
> **Created:** 2026-01-30
> **AIDE ID:** AIDE-0006
> **Risk Level:** Medium
> **Blocked by:** None
> **Depends on:** AIDE-0005 (Complete)

---

## Summary

Implement 7 UX improvements captured from review notes in `~/.adrai/review-notes.yaml`. These enhancements focus on keyboard efficiency, data safety, and workflow improvements.

## Motivation

During development of the adrai-review-notes extension, several UX friction points were identified through dogfooding. These improvements address common workflows and reduce friction in note management.

## Features

| # | Feature | Type | Complexity | Phase |
|---|---------|------|------------|-------|
| 1 | Project qualifier in storage path | Concern | Medium | 3B |
| 2 | Disable branch toggle when no git | Concern | Low | 3A |
| 3 | Remove single-delete confirmation | Concern | Low | 3A |
| 4 | CTRL+C to copy note text | Concern | Low | 3A |
| 5 | Store/restore selection (not just cursor) | Concern | Medium | 3B |
| 6 | CTRL+Z undo for deletions/state changes | Concern | High | 3C |
| 7 | F2 to edit note | Concern | Low | 3A |

## Implementation Phases

### Phase 3A: Quick Wins (Low Complexity)

#### 3A.1 Remove Single-Delete Confirmation
**File:** `src/commands.ts`

Remove the confirmation dialog when deleting a single note. Keep confirmation for multi-select delete operations.

**Changes:**
- Modify `deleteNote()` function to skip `showWarningMessage` for single item
- Keep confirmation in `deleteSelected()` for bulk operations

#### 3A.2 CTRL+C Copy Note Text
**Files:** `src/commands.ts`, `package.json`

Add keyboard shortcut to copy selected note's content to clipboard.

**Changes:**
- Add new command `adrai.copyNote`
- Add keybinding `ctrl+c` / `cmd+c` when `focusedView == adraiReviewNotes`
- Implementation copies note.content to clipboard via `vscode.env.clipboard.writeText()`

#### 3A.3 F2 to Edit Note
**File:** `package.json`

Standard keyboard shortcut for rename/edit operations.

**Changes:**
- Add keybinding `f2` for `adrai.editNote` when `focusedView == adraiReviewNotes`

#### 3A.4 Disable Branch Toggle Without Git
**Files:** `src/extension.ts`, `src/noteStorage.ts`, `package.json`

Disable branch filter toggle when workspace is not a git repository.

**Changes:**
- Add `isGitRepository()` check function
- Set context `adrai.hasGit` on activation
- Add `when` clause to branch toggle menu: `&& adrai.hasGit`

### Phase 3B: Medium Complexity

#### 3B.1 Store/Restore Text Selection
**Files:** `src/types.ts`, `src/commands.ts`, `src/noteStorage.ts`

Capture text selection (not just cursor position) when creating notes, restore when navigating.

**Changes:**
- Extend `NoteLocation` interface:
  ```typescript
  selectionStart?: { line: number; character: number };
  selectionEnd?: { line: number; character: number };
  ```
- Modify `addNote()` and `quickNote()` to capture `editor.selection`
- Modify `goToLocation()` to restore selection if available
- Backward compatible (cursor-only notes still work)

#### 3B.2 Project Qualifier in Storage Path
**Files:** `src/noteStorage.ts`, `package.json`

Option to isolate notes per project instead of global storage.

**Changes:**
- Add setting `adrai.projectStorage` (boolean, default: false)
- When true: `~/.adrai/[project-name]/review-notes.yaml`
- Project name from workspace folder name
- Migration path: document manual move of existing notes

### Phase 3C: High Complexity

#### 3C.1 Undo Stack
**Files:** `src/noteStorage.ts`, `src/commands.ts`, `package.json`

Implement undo for destructive operations.

**Changes:**
- Add `UndoEntry` type:
  ```typescript
  interface UndoEntry {
    operation: 'delete' | 'update';
    noteId: string;
    snapshot: ReviewNote;
    timestamp: string;
  }
  ```
- Add undo stack array in `NoteStorage` (max 20 entries)
- Capture snapshot before delete/update operations
- Add command `adrai.undo` with keybinding `ctrl+z` / `cmd+z`
- Show info message on undo: "Restored note: {content preview}"

## Files Modified

| File | Changes |
|------|---------|
| `src/types.ts` | NoteLocation selection fields |
| `src/commands.ts` | Delete confirmation, copy command, selection capture |
| `src/noteStorage.ts` | Project qualifier, undo stack, git check |
| `src/extension.ts` | Git context initialization |
| `package.json` | Commands, keybindings, settings |

## Testing

### Phase 3A Tests
- [ PASS ] Delete single note without confirmation prompt
- [ PASS ] Delete multiple notes shows confirmation
- [ PASS ] CTRL+C copies note content to clipboard
- [ PASS ] F2 opens edit dialog for selected note
- [ PASS ] Branch toggle disabled in non-git workspace

### Phase 3B Tests
- [ PASS ] New note captures text selection
- [ PASS ] Navigate to note restores selection highlight
- [ PASS ] Legacy notes (cursor only) still navigate correctly
- [ PASS ] Project storage creates project-specific directory
- [ PASS ] Switching projects loads correct notes

### Phase 3C Tests
- [ PASS ] CTRL+Z restores deleted note
- [ PASS ] CTRL+Z reverts status change
- [ PASS ] Multiple undos work in sequence
- [ NOT TESTED ] Undo stack limited to 20 entries
- [ NOT TESTED ] Clear undo stack on extension reload

### Known Issues (Unresolved)
- **Focus after tree operations**: After operations like delete, edit, or status change, focus jumps back to the editor instead of staying in the tree view. This causes a grey selection box to appear on the current editor line. Attempted fixes with `refocusTreeView()` and `treeView.reveal()` with focus flag did not resolve the issue. May require VS Code API changes or a different approach.

## Verification

```bash
# Compile
cd tools/adrai-review-notes
bun run compile

# Package
npx @vscode/vsce package

# Install
code --install-extension adrai-review-notes-0.8.0.vsix --force

# Test in VS Code
# 1. Create note, try CTRL+C
# 2. Select note, press F2
# 3. Delete note (no confirmation)
# 4. Delete multiple (confirmation appears)
# 5. CTRL+Z to undo
```

## Risks

| Risk | Mitigation |
|------|------------|
| Undo stack memory | Limit to 20 entries, clear on reload |
| Project storage migration | Document manual migration, provide clear instructions |
| Keybinding conflicts | Use when clauses to scope to tree view |

## References

- [AIDE-0003](./AIDE-0003-ux-improvements.md) - UX Phase 1
- [AIDE-0004](./AIDE-0004-ux-phase2.md) - UX Phase 2
