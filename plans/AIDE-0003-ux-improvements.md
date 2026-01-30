# AIDE-0003: adrai Review Notes UX Improvements

> **Status:** Complete
> **Author:** @sprantic
> **Created:** 2026-01-29
> **AIDE ID:** AIDE-0003
> **Risk Level:** Medium
> **Blocked by:** None

---

## Summary

Implement five UX improvements for the adrai Review Notes VS Code extension to reduce friction and improve workflows when working with many notes, including branch-aware note management.

---

## Context

### Problem Statement

The extension is functional but has UX friction points that become painful as the number of notes grows:
- Adding a note requires 3 sequential dialogs
- No way to search or filter notes
- Cannot remove individual locations from multi-location notes
- No bulk operations for managing many notes
- Notes are not branch-aware, causing visual clutter when working on feature branches

### Current State

Extension v0.1.7 published with:
- 8 commands, sidebar panel, YAML storage
- Grouping by status/type/file
- Debate promotion workflow

### Related Work

- AIDE-0001: Review Notes VS Code Extension (Complete)
- AIDE-0002: VS Code Extension Marketplace Deployment (Complete)

---

## Proposed Changes

### Overview

Five features to improve usability:

1. **Search & Filter Notes** - Find notes by content, tags, or file
2. **Streamlined Add Flow** - Reduce 3 dialogs to faster input
3. **Bulk Operations** - Multi-select and batch actions
4. **Location Management** - Remove locations, detect stale links
5. **Branch-Aware Notes** - Store branch info, filter by current branch

### Files to Modify

| File | Change Type | Description |
|------|-------------|-------------|
| `tools/adrai-review-notes/src/commands.ts` | Modify | Add all new commands, refactor addNote, capture branch |
| `tools/adrai-review-notes/src/noteProvider.ts` | Modify | Add filter state, getFilteredNotes(), checkLocationValidity(), branch styling |
| `tools/adrai-review-notes/src/noteStorage.ts` | Modify | Add migration for branch field, branch detection |
| `tools/adrai-review-notes/src/extension.ts` | Modify | Enable canSelectMany, wire new commands, branch filter toggle |
| `tools/adrai-review-notes/src/types.ts` | Modify | Add branch field to ReviewNote interface |
| `tools/adrai-review-notes/package.json` | Modify | New commands, keybindings, context menus, configuration |

---

## Feature Details

### Feature 1: Search & Filter Notes

**Implementation:**
- Add filter state to `NoteProvider` (searchQuery, activeFilters)
- Create `getFilteredNotes()` method that filters before grouping
- New commands: `adrai.searchNotes`, `adrai.filterByType`, `adrai.clearFilters`
- Keybinding: `Ctrl+Shift+F` when panel focused
- Show filter status in tree title: `Review Notes (filtered: 5/12)`

### Feature 2: Streamlined Add Flow

**Implementation:**
- Refactor `addNote()` to combined type+content picker
- Add `adrai.quickNote` command (defaults to bookmark type)
- Keybinding: `Ctrl+Shift+B` for quick note
- Collect existing tags for autocomplete

### Feature 3: Bulk Operations

**Implementation:**
- Enable `canSelectMany: true` on TreeView
- New commands: `adrai.resolveSelected`, `adrai.deleteSelected`
- Add `adrai.resolveAllInGroup` for group context menu
- Confirmation dialogs for destructive actions

### Feature 4: Location Management

**Implementation:**
- Add `adrai.removeLocation` command (context menu on locations)
- Add `checkLocationValidity()` to detect missing files/lines
- Visual indicator: warning icon for stale locations
- Add `adrai.cleanupStaleLocations` batch command

### Feature 5: Branch-Aware Notes

**Problem:** When working on feature branches, notes from other branches clutter the view.

**Storage Changes:**
- Add `branch` field to `ReviewNote` interface in types.ts
- Storage version bump from "1.0" to "1.1"
- Migration: existing notes without branch set to `null` (all-branches)

**Branch Detection:**
- Use `git rev-parse --abbrev-ref HEAD` to get current branch
- Capture branch when creating new notes
- Helper function `getCurrentBranch()` in noteStorage.ts

**Visual Styling:**
- **Current branch notes:** Bold text (default styling)
- **Other branch notes:** Italic text, disabled jump/navigation
- Use `TreeItem.description` and custom styling

**Filter Behavior:**
- Checkbox at top of panel: "Current branch only" (default: off)
- When filter ON: Only show notes from current branch
- When filter OFF: Show all notes with visual distinction
- Command: `adrai.toggleBranchFilter`

**Stale Branch Cleanup:**
- `adrai.cleanupStaleLocations` extended with optional flag
- Option: "Also discard notes from deleted branches"
- Check branch existence via `git branch --list <branch>`

**Implementation Details:**
```typescript
// types.ts - update ReviewNote
interface ReviewNote {
  // ... existing fields
  branch?: string;  // Git branch when note was created (null = all branches)
}

// noteStorage.ts - add branch detection
async function getCurrentBranch(): Promise<string | undefined> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) return undefined;

  try {
    const { stdout } = await exec('git rev-parse --abbrev-ref HEAD', {
      cwd: workspaceFolder.uri.fsPath
    });
    return stdout.trim();
  } catch {
    return undefined;
  }
}

// noteProvider.ts - styling
private createNoteItem(note: ReviewNote): NoteTreeItem {
  const isCurrentBranch = !note.branch || note.branch === this.currentBranch;
  const item = new NoteTreeItem(...);

  if (!isCurrentBranch) {
    // Italic styling via description prefix
    item.description = `[${note.branch}] ` + (item.description || '');
    // Disable navigation for other branch notes
    item.command = undefined;
  }

  return item;
}
```

---

## New Commands Summary

| Command | Keybinding | Description |
|---------|------------|-------------|
| `adrai.searchNotes` | Ctrl+Shift+F | Open search input |
| `adrai.filterByType` | - | Filter by note type |
| `adrai.clearFilters` | - | Reset all filters |
| `adrai.quickNote` | Ctrl+Shift+B | Quick bookmark note |
| `adrai.resolveSelected` | - | Resolve all selected |
| `adrai.deleteSelected` | - | Delete all selected |
| `adrai.resolveAllInGroup` | - | Resolve all in group |
| `adrai.removeLocation` | - | Remove location from note |
| `adrai.cleanupStaleLocations` | - | Remove all stale locations |
| `adrai.toggleBranchFilter` | - | Toggle "current branch only" filter |

---

## Implementation Order

| Phase | Feature | Risk | Rationale |
|-------|---------|------|-----------|
| 1 | Branch-Aware Notes | Medium | Schema change with migration, must be first |
| 2 | Location Management | Low | Isolated changes, storage already has removeLocation() |
| 3 | Search and Filter | Low | Additive, integrates with branch filter |
| 4 | Streamlined Add Flow | Medium | Refactors core workflow, captures branch |
| 5 | Bulk Operations | Medium | New multi-select pattern |

---

## Test Scenarios

### Scenario 1: Search Notes

```gherkin
Given multiple notes exist with different content
When I press Ctrl+Shift+F and enter "authentication"
Then only notes containing "authentication" are visible
And tree title shows "Review Notes (filtered: 2/10)"
```

### Scenario 2: Quick Note

```gherkin
Given an open file in VS Code
When I press Ctrl+Shift+B at line 42
And enter "Check this later"
Then a bookmark note is created with single dialog
And note appears in sidebar under "Open"
```

### Scenario 3: Bulk Resolve

```gherkin
Given 5 notes are selected (Ctrl+Click)
When I right-click and select "Resolve Selected"
And confirm the action
Then all 5 notes are marked as resolved
```

### Scenario 4: Remove Stale Location

```gherkin
Given a note links to a deleted file
When the tree view refreshes
Then the location shows a warning icon
And tooltip says "File not found"
When I right-click and select "Remove Location"
Then the stale location is removed
```

### Scenario 5: Branch-Aware Notes

```gherkin
Given I am on branch "feature/auth"
And notes exist on branches "main", "feature/auth", and "feature/ui"
When branch filter is OFF
Then all notes are visible
And "feature/auth" notes display in bold
And "main" and "feature/ui" notes display in italic with branch badge
And italic notes do not have jump-to-location functionality

When I toggle branch filter ON
Then only "feature/auth" notes are visible
```

### Scenario 6: Branch Migration

```gherkin
Given existing notes without branch field (pre-migration)
When the extension loads
Then notes are migrated to schema version 1.1
And existing notes have branch set to null (visible in all branches)
And new notes capture current branch automatically
```

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Schema migration breaks existing notes | Low | High | Version check, graceful handling of missing branch field |
| Git command not available | Medium | Low | Graceful fallback if git not in PATH |
| Filter state complexity | Low | Medium | Keep filter logic in single getFilteredNotes() method |
| Breaking existing add flow | Medium | High | Keep old command working, add quickNote as alternative |
| Multi-select edge cases | Medium | Medium | Test with 0, 1, many selections |
| Stale detection performance | Low | Low | Only check on refresh, not continuously |
| Branch deleted while notes exist | Medium | Low | Notes remain visible, stale cleanup handles it |

---

## Out of Scope

- WebView-based forms (too complex for this iteration)
- Tag management UI (future enhancement)
- Note statistics/analytics
- Export/import functionality

---

## Dependencies

- [x] Extension code complete (AIDE-0001)
- [x] Published to marketplace (AIDE-0002)
- [ ] VS Code API: canSelectMany (available since 1.56)

---

## Verification

After implementation:

1. **Branch-Aware Notes:**
   - Create note on `main` branch → branch field captured
   - Switch to `feature/x` branch → main notes show italic
   - Toggle branch filter → only current branch notes visible
   - Check YAML storage → notes have `branch` field

2. **Search & Filter:**
   - Press Ctrl+Shift+F → enter search text → notes filtered
   - Clear filters → all notes visible again

3. **Streamlined Add Flow:**
   - Ctrl+Shift+N → select type → enter content (2 steps vs 3)
   - Ctrl+Shift+B → enter content only → bookmark created

4. **Bulk Operations:**
   - Ctrl+Click multiple notes → right-click → Resolve Selected
   - Right-click group header → Resolve All in Group

5. **Location Management:**
   - Right-click location → Remove Location
   - Delete a file → location shows warning icon
   - Run Cleanup Stale Locations → removes broken links

6. **Migration Test:**
   - Create notes with v0.1.7 (no branch field)
   - Update to new version → notes migrated, branch = null
   - New notes → branch captured automatically

7. **Package and publish:**
   ```bash
   cd tools/adrai-review-notes
   bun run package
   npx @vscode/vsce publish --allow-star-activation
   ```

---

## Approval

**Approver:**
**Approval Date:**
**Comments:**

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-29 | @sprantic | Initial draft with 4 features |
| 1.1 | 2026-01-29 | @sprantic | Added Feature 5: Branch-Aware Notes |
