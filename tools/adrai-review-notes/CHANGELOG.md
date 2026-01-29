# Changelog

All notable changes to the "adrAI Review Notes" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
