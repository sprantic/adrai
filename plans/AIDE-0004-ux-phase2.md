# AIDE-0004: adrAI Review Notes UX Improvements Phase 2

> **Status:** In Progress
> **Author:** @sprantic
> **Created:** 2026-01-30
> **AIDE ID:** AIDE-0004
> **Risk Level:** Medium
> **Blocked by:** None
> **Depends on:** AIDE-0003 (Complete)

---

## Summary

Implement 13 UX improvements based on review notes captured during AIDE-0003 testing. Organized into 4 phases for incremental delivery.

---

## Source: Review Notes

All items from `~/.adrai/review-notes.yaml` with status: open

---

## Phase 2A: Quick Wins ✅ COMPLETE

### 2A.1 Remove "adrAI:" Prefix ✅
- **Note ID:** fc24a114-2ed8-4d87-ae8c-11f38c08f998
- **Change:** Update command titles in package.json - moved prefix to `category` field
- **Files:** `package.json`

### 2A.2 Auto-Detect Note Type from Punctuation ✅
- **Note ID:** 880f3bf8-948d-491c-989c-646b5178a3f0
- **Rules:**
  - `?` → Question
  - `!` → Concern
  - `~` → Uncertainty
  - `.` → Bookmark
  - `!!` → Pre-debate
- **Files:** `commands.ts` (addNote, quickNote)
- **Implementation:** Added `detectNoteType()` function, integrated into both commands

### 2A.3 Search Graceful Degradation ✅
- **Note ID:** 0cff66fc-e5c4-4fe8-ab1f-33e1a49d7ece
- **Change:** If search finds nothing, keep current list visible
- **Files:** `noteProvider.ts`, `commands.ts`
- **Implementation:** Added `trySearchQuery()` method to test before applying

---

## Phase 2B: Keyboard Improvements ✅ COMPLETE

### 2B.1 Ctrl-Click for Other-Branch Notes ✅
- **Note IDs:** f91ccb6c, 0f3168ce
- **Change:** All notes (including other-branch) now clickable to jump to file
- **Files:** `noteProvider.ts`
- **Implementation:** Removed branch check for click command assignment

### 2B.2 Panel-Focused Shortcuts ✅
- **Note ID:** c8194014-bdbd-431d-b8e2-46dcb3296b86
- **Change:** Ctrl+Shift+N/B work from both editor and panel focus
- **Files:** `package.json` (keybinding contexts)
- **Implementation:** Changed `when` clause to `editorTextFocus || focusedView == adraiReviewNotes`

### 2B.3 Tag Autocomplete with History ❌ REMOVED
- **Note ID:** 5309e211-85a7-43c9-bf48-977e5f05d6f1
- **Decision:** Tags feature removed entirely - too complex for limited value
- **Change:** Removed tag input from note creation flow

---

## Phase 2C: Visual Enhancements

### 2C.1 Colored Tags ❌ REMOVED
- **Decision:** Tags feature removed entirely

### 2C.2 Active Toggle Indicators
- **Note ID:** 53448885-0105-4fd8-83a9-1555b4d95cf0
- **Change:** Active filter buttons show visual feedback
- **Files:** `extension.ts` (context values), `package.json` (when clauses)

### 2C.3 Configurable Note Line Display
- **Note ID:** 1b2931fd-9153-4cb5-b7ff-239d364e3c8b
- **Change:** Settings to show/hide: note, location, branch, date
- **Files:** `noteProvider.ts`, `package.json` (settings)

### 2C.4 Sortable Note Segments
- **Source:** Manual testing (tests.md)
- **Change:** Notes within each status group sortable by creation date or type (ascending/descending)
- **Files:** `noteProvider.ts`, `package.json` (settings)
- **Settings:**
  - `adrai.sortBy`: "date" | "type" | "urgency"
  - `adrai.sortOrder`: "asc" | "desc"

---

## Phase 2D: Advanced Features

### 2D.1 Settings Panel UI
- **Note ID:** 154b3bce-c412-4274-9853-67deae1801e6
- **Change:** Replace toolbar with gear icon → WebView settings panel
- **Files:** New `settingsPanel.ts`, `extension.ts`, `package.json`

### 2D.2 Quick Note Configuration
- **Note ID:** 4b79f614-9c33-4917-b01b-52be6987b681
- **Change:** Configure default tag(s) and state for Ctrl+Shift+B
- **Files:** `package.json` (settings), `commands.ts`

### 2D.3 Drag & Drop State Change
- **Note ID:** e0ed5a97-d366-4b20-9080-4ab8bad57e63
- **Change:** Drag notes between status groups to change state
- **Files:** `noteProvider.ts` (DragAndDropController), `extension.ts`

---

## Files Summary

| File | Phases | Changes |
|------|--------|---------|
| `package.json` | All | Commands, settings, keybindings |
| `commands.ts` | 2A, 2B, 2D | Auto-detect, shortcuts, quick note config |
| `noteProvider.ts` | 2A, 2B, 2C, 2D | Search, display, drag & drop |
| `extension.ts` | 2B, 2C, 2D | Ctrl-Click, toggles, settings panel |
| `types.ts` | 2C | Tag color config |
| `settingsPanel.ts` | 2D | New WebView panel |

---

## Verification

### Phase 2A Tests
1. Context menus show "Add Review Note" not "adrAI: Add Review Note"
2. Type "what is this?" → auto-selects Question type
3. Search for nonexistent term → list unchanged

### Phase 2B Tests
1. Ctrl-Click on red (other-branch) note → jumps to file
2. Focus on panel, press Ctrl+Shift+N → note created at editor cursor
3. Type tags → see history dropdown, Ctrl+Space selects

### Phase 2C Tests
1. Tags display with background colors
2. Branch filter toggle shows filled icon when active
3. Settings control what appears in note lines
4. Notes sortable by date/type/urgency within each group

### Phase 2D Tests
1. Gear icon opens settings WebView
2. Quick note uses configured defaults
3. Drag note from "Open" to "Resolved" group → status changes

---

## Risks

| Risk | Mitigation |
|------|------------|
| WebView complexity | Start with simple HTML, no framework |
| Drag & drop API | Use VS Code's TreeDragAndDropController |
| Tag autocomplete UX | Use standard QuickPick with recent items |

---

## Approval

**Approver:**
me

**Approval Date:**
**Comments:**
looks good
---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-30 | Initial draft from review notes |
| 1.1 | 2026-01-30 | Phase 2A complete - v0.3.0 |
| 1.2 | 2026-01-30 | Added 2C.4 sortable segments from testing feedback |
| 1.3 | 2026-01-30 | Phase 2B complete - v0.4.0 |
