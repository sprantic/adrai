# adrAI Review Notes

Personal annotation layer for adrAI artifact review with debate promotion.

## The Problem

Reviewers have fleeting thoughts during review that don't warrant formal debates:
- Knowledge questions ("what does X mean?")
- Uncertainties ("not sure about this yet, need to read more")
- Bookmarks ("come back to this")
- Pre-debate concerns ("might be a problem, but not sure")

**Current state:** People keep text files open in notepad. No structured capture.

## The Solution

This VS Code extension provides:
- **Sidebar panel** showing all notes grouped by status/type
- **Quick note creation** at current cursor position
- **Multi-location linking** (one note → multiple files)
- **Personal storage** in `~/.adrai/review-notes.yaml` (gitignored)
- **Promotion workflow** to create DEB-NNNN from notes

## Installation

### From Source (Development)

```bash
cd tools/adrai-review-notes
bun install
bun run compile
```

Then press F5 in VS Code to launch Extension Development Host.

### Package and Install

```bash
bun run package
code --install-extension adrai-review-notes-0.1.0.vsix
```

## Usage

### Keyboard Shortcuts

| Shortcut | Command | Description |
|----------|---------|-------------|
| `Ctrl+Shift+N` | Add Note | Add a review note at current cursor |
| `Ctrl+Shift+L` | Add Location | Link current location to existing note |
| `Ctrl+Shift+R` | Toggle Panel | Show/focus the review notes panel |

### Note Types

| Type | Icon | Use When |
|------|------|----------|
| Question | 🔍 | Need answer/clarification |
| Uncertainty | ❓ | Not sure yet, need more context |
| Concern | ⚠️ | Potential issue to investigate |
| Bookmark | 📌 | Come back to this later |
| Pre-debate | 🔥 | Might warrant formal DEB-NNNN |

### Note Lifecycle

```
open → investigating → promote → resolved
                    ↘         ↗
                      resolved
```

| Status | Description |
|--------|-------------|
| Open | Newly created, needs attention |
| Investigating | Being researched/explored |
| Promote | Marked for debate promotion |
| Resolved | Closed, no longer active |

### Multi-Location Notes

A single note can reference multiple file locations:

1. Create note with `Ctrl+Shift+N`
2. Navigate to another relevant location
3. Press `Ctrl+Shift+L` and select the note
4. The note now shows both locations

This is useful for:
- Tracking related code across files
- Linking interface definitions to implementations
- Connecting documentation to code

### Promoting to Debate

When a note warrants formal discussion:

1. Right-click the note → "Promote to Debate"
2. Extension reads `.deb-tracker.md` for next ID
3. Creates DEB-NNNN file from template
4. Pre-fills the central question from note content
5. Links all note locations as context
6. Marks the note as resolved with `promoted_to: DEB-NNNN`

## Configuration

In VS Code settings (`settings.json`):

```json
{
  "adts.storageLocation": "~/.adrai/review-notes.yaml",
  "adts.debateTemplateDir": "docs/debates/templates",
  "adts.debatesDir": "docs/debates",
  "adts.groupBy": "status"
}
```

| Setting | Default | Description |
|---------|---------|-------------|
| `storageLocation` | `~/.adrai/review-notes.yaml` | Path to notes YAML file |
| `debateTemplateDir` | `docs/debates/templates` | Debate templates directory |
| `debatesDir` | `docs/debates` | Debates directory |
| `groupBy` | `status` | Group notes by: `status`, `type`, or `file` |

## Storage Format

Notes are stored in YAML for human-readability:

```yaml
version: "1.0"
notes:
  - id: "uuid-1"
    content: "What does risk level actually mean here?"
    type: question
    status: open
    created: "2026-01-29T14:30:00Z"
    updated: "2026-01-29T14:30:00Z"
    locations:
      - file: "docs/debates/README.md"
        line: 48
        preview: "| Risk | Approvers Required |"
      - file: "docs/debates/templates/plan-template.md"
        line: 187
        section: "Risk Level Guidelines"
    tags: [terminology]
    promoted_to: null
```

## Commands

All commands are available via Command Palette (`Ctrl+Shift+P`):

| Command | Description |
|---------|-------------|
| `adrAI: Add Review Note` | Create note at cursor |
| `adrAI: Add Location to Note` | Link location to existing note |
| `adrAI: Toggle Review Notes Panel` | Show/focus the sidebar |
| `adrAI: Promote to Debate` | Create DEB-NNNN from note |
| `adrAI: Resolve Note` | Mark note as resolved |
| `adrAI: Edit Note` | Edit note content, type, or status |
| `adrAI: Delete Note` | Remove a note |
| `adrAI: Refresh Notes` | Reload notes from storage |

## Context Menu

Right-click on a note in the panel for:
- Add Location (link current cursor to this note)
- Promote to Debate
- Resolve Note
- Edit Note
- Delete Note

Right-click in the editor for:
- Add Review Note

## Status Bar

The status bar shows the count of open notes. Click to focus the panel.

## Development

### Building

```bash
bun install
bun run compile
```

### Watching

```bash
bun run watch
```

### Testing

Press F5 in VS Code to launch the Extension Development Host.

### Packaging

```bash
bun run package
```

## Integration with adrAI

This extension is part of the adrAI (AIDE Debate Tracking System):

- Notes capture fleeting thoughts during artifact review
- Multi-location linking connects related code/docs
- Promotion workflow creates formal debates when warranted
- Personal storage keeps notes out of version control

See the adrAI project documentation for the full system design.

## License

MIT
