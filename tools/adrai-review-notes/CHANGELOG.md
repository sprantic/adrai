# Changelog

All notable changes to the "adrAI Review Notes" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

- Custom SVG icon matching the adrAI branding (book with checkbox and AI)

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
