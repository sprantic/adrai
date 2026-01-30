Function
PASS

UX Consistency

PASS: Confirmation box shows "<type> added" (fixed in v0.3.3)
TODO: Notes list segments (per state) should be sortable by creation date, or type, up and down. → Phase 2C in AIDE-0004

## Phase 2B Tests (v0.4.0)

### 2B.1 Other-Branch Note Navigation
- [ ] Click on red (other-branch) note with single location → navigates to file
FAIL - should work on CTRL-Click only. If clicking on a red node, it should send a warning message that this is anohther branch

### 2B.2 Panel-Focused Shortcuts
- [ ] Focus on Review Notes panel, press Ctrl+Shift+N → note created at editor cursor
PASS
- [ ] Focus on Review Notes panel, press Ctrl+Shift+B → quick note created at editor cursor
PASS

### 2B.3 Tag Autocomplete ❌ REMOVED
- Tags feature removed entirely - too complex for limited value

