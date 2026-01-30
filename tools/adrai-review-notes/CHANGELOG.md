# Changelog

All notable changes to the "adrai Review Notes" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.8.2] - 2026-01-30

### Added

- **Debate Location Link**: Promoting a note to debate adds a location pointing to the created DEB file [AIDE-0007]
  - Enables bidirectional navigation between note and debate

## [0.8.1] - 2026-01-30

### Fixed

- **Debate Template Handling**: Built-in default template for debate promotion [AIDE-0007]
  - No longer requires template file to exist
  - Auto-creates template at `docs/debates/templates/debate-template.md` on first use
  - Clean template without copy instructions or code fences

## [0.8.0] - 2026-01-30

### Added

- **Undo Support**: CTRL+Z to restore deleted notes or revert changes [AIDE-0006]
  - Undo stack holds up to 20 operations
  - Works for delete and update operations
- **Copy Note**: CTRL+C copies selected note text to clipboard [AIDE-0006]
- **F2 to Edit**: Standard keyboard shortcut for editing notes [AIDE-0006]
- **Selection Storage**: Notes now capture text selection, not just cursor position [AIDE-0006]
  - Selection restored when navigating to note location
  - Backwards compatible with cursor-only notes
- **Project Storage**: Optional per-project note storage [AIDE-0006]
  - Enable via `adrai.projectStorage` setting
  - Notes stored in `~/.adrai/[project-name]/review-notes.yaml`
  - Storage path updates automatically when setting changes
- **About Section**: Settings panel now includes sprantic branding, GitHub link, and MIT license

### Changed

- **No Confirmation for Single Delete**: Single note deletion is instant (use CTRL+Z to undo) [AIDE-0006]
  - Multi-select delete still shows confirmation
- **Git-Aware Branch Toggle**: Branch filter button only visible in git repositories [AIDE-0006]
- **Git Settings Hidden**: Branch-related settings hidden in non-git workspaces
- **View Title**: Updated to "ADRAI REVIEW NOTES" for clarity
- **Settings Title**: Updated to "adrai Review Notes Settings"

### Known Issues

- **Focus after tree operations**: Focus may jump back to editor after panel operations (delete, edit, status change). Workaround: manually click back into the panel.

## [0.7.0] - 2026-01-30

### Added

- **IDEA Note Type**: New lowest-urgency note type with lightbulb icon [AIDE-0005]
  - Punctuation detection: `+` at end auto-detects as Idea
  - Urgency order: idea → bookmark → uncertainty → question → concern → pre-debate
- **Global Keybindings**: Commands work without requiring an open editor
  - `Ctrl+Shift+N` and `Ctrl+Shift+B` now work from anywhere in VS Code
- **Location-Free Notes**: IDEA notes can be created without a file location
  - When keybinding triggered without open editor, defaults to IDEA type
  - Enables capturing ideas from anywhere in VS Code

### Changed

- Keybindings no longer require `editorTextFocus` context
- Quick Note default type now includes 'idea' option in settings

## [0.2.7] - 2026-01-29

### Fixed

- Removed false-positive warning icons from locations
- Restored 🟢/🔴 emoji prefix for branch indication (user preference)

## [0.2.3] - 2026-01-29

### Fixed

- Git branch watcher to auto-update colors when switching branches
- File path resolution with multiple fallback strategies for nested workspaces

## [0.2.2] - 2026-01-29

### Changed

- Branch indicators: 🟢 green circle prefix for current branch, 🔴 red circle prefix for other branches

## [0.2.1] - 2026-01-29

### Changed

- Branch indicator colors: GREEN icons for current branch notes, RED icons for other branch notes

## [0.2.0] - 2026-01-29

### Added

- **Branch-Aware Notes**: Notes now capture the git branch when created
  - Notes from other branches show colored icons with ⊘ prefix
  - Branch filter toggle to show only current branch notes
  - Schema migrated from v1.0 to v1.1 (automatic migration)
- **Search & Filter**: Find notes by content, tags, or file location
  - `Ctrl+Shift+F` to search when panel focused
  - Filter by note type
  - Clear all filters command
- **Quick Bookmark**: Single-dialog note creation
  - `Ctrl+Shift+B` creates bookmark with one input
- **Bulk Operations**: Multi-select and batch actions
  - Ctrl+Click to select multiple notes
  - Resolve Selected, Delete Selected commands
  - Resolve All in Group for group headers
- **Location Management**: Better control over note locations
  - Remove Location command in context menu
  - Stale location detection with warning icons
  - Cleanup Stale Locations batch command
- **Multi-Root Workspace Support**: File paths now resolve correctly across all workspace folders

### Fixed

- File navigation in multi-root workspaces
- Context menus for location items

## [0.1.7] - 2026-01-29

### Fixed

- Bundle dependencies with esbuild (fixes "Cannot find module 'yaml'" error)

## [0.1.6] - 2026-01-29

### Changed

- Switched to eager activation (`*`) to ensure extension loads on VS Code startup

## [0.1.5] - 2026-01-29

### Added

- Debug logging and error handling for activation troubleshooting
- Success notification on activation to confirm extension is running

## [0.1.4] - 2026-01-29

### Fixed

- Refined SVG icon styling

## [0.1.3] - 2026-01-29

### Changed

- Custom SVG icon matching the adrai branding (book with checkbox and AI)

## [0.1.2] - 2026-01-29

### Fixed

- Restored SVG icon for activity bar (VS Code requires SVG for sidebar icons)
- Switched to implicit activation (empty activationEvents array)
- PNG icon only used for marketplace listing

## [0.1.1] - 2026-01-29

### Fixed

- Added additional activation events for reliable extension startup
- Extension now activates on view open and command execution

## [0.1.0] - 2026-01-29

### Added

- **Sidebar Panel**: Dedicated Review Notes view in VS Code activity bar
- **5 Note Types**: question, uncertainty, concern, bookmark, pre-debate
- **4 Status States**: open, investigating, promote, resolved
- **Multi-location Note Linking**: Connect notes to multiple file locations
- **Debate Promotion Workflow**: Promote notes to DEB-NNNN debate files
- **8 Commands with Keyboard Shortcuts**:
  - `Ctrl+Shift+N` / `Cmd+Shift+N`: Add Review Note
  - `Ctrl+Shift+L` / `Cmd+Shift+L`: Add Location to Note
  - `Ctrl+Shift+R` / `Cmd+Shift+R`: Toggle Review Notes Panel
  - Plus: Promote to Debate, Resolve Note, Edit Note, Delete Note, Refresh Notes
- **YAML-based Personal Storage**: Notes stored in `~/.adrai/review-notes.yaml`
- **Status Bar Indicator**: Shows count of open review notes
- **Context Menu Integration**: Right-click in editor to add notes
- **Tree View Grouping**: Group notes by status, type, or file
- **Configuration Options**:
  - Custom storage location
  - Debate template directory
  - Debates output directory
  - Grouping preference
