tests.md

 1. Migration Test (automatic)
  - Reload VS Code window (Ctrl+Shift+P → "Reload Window")
  - Check ~/.adrai/review-notes.yaml - should show version: "1.1"
PASS

  2. Branch Detection
  - Open a git repo in VS Code
  - Add a new note (Ctrl+Shift+N)
  - Check YAML - new note should have branch: "main" (or current branch)
PASS

  3. Quick Bookmark
  - Press Ctrl+Shift+B in editor
  - Enter text → single dialog creates bookmark
PASS

  4. Search Notes
  - Click search icon in Review Notes panel title bar
  - Search "again" → should filter to 1 note
PASS

  5. Branch Filter Toggle
  - Click git-branch icon in panel title bar
  - Should toggle filtering by current branch
FAIL: Filter is not fully operational. Some lines are discarded but not all. Visual display as requested not done:
* when in all nodes mode: Notes that refer to current branch are BOLD, Notes that refer to other branches are italic and do not jump to the file

  6. Stale Location Detection
  - Delete a file referenced by a note
  - Refresh panel → location shows warning icon
FAIL: Notes are deleted which are from another than the current branch. 

  7. Remove Location
  - Right-click a location → "Remove Location"
FAIL not implemented

  8. Bulk Operations
  - Ctrl+Click multiple notes
  - Right-click → "Resolve Selected"
PASS
