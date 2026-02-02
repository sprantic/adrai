# adrai Architecture Overview

> **Version:** 2.0
> **Last Updated:** 2026-01-31
> **Owner:** @sprantic
> **Related:** [Foundations](../FOUNDATIONS.md) (vision, goals, constraints)

---

## System Context

### Purpose

adrai (AIDE Review Lifecycle Management System) provides structured validation for AI-assisted engineering by:
- Capturing review observations as personal notes
- Promoting observations to formal debates when warranted
- Tracking dependency relationships between debates, plans, and ADRs
- Providing AI-aided review assistance

### Context Diagram

```
                        EXTERNAL CONTEXT

    ┌──────────┐                                      ┌──────────────┐
    │  Human   │                                      │     AI       │
    │ Reviewer │<─────────────────────────────────────│  Assistant   │
    └────┬─────┘                                      └──────┬───────┘
         │                                                   │
         │              ┌─────────────────────┐              │
         │              │                     │              │
         └─────────────>│       adrai         │<─────────────┘
                        │                     │
                        └─────────────────────┘
                                 │
                                 ▼
                        ┌─────────────────────┐
                        │    Git Repository   │
                        │  (Single Source)    │
                        └─────────────────────┘
```

### Key Actors

| Actor | Type | Interaction |
|-------|------|-------------|
| Human Reviewer | Human | Creates notes, promotes to debates, resolves |
| AI Assistant | System | Summarizes, analyzes, flags issues (never decides) |
| Git Repository | System | Stores all artifacts, provides history |
| VS Code | System | Primary UI via extension |

---

## Architecture Principles

Based on AIDE values and project constraints:

| Principle | Rationale | Enforcement |
|-----------|-----------|-------------|
| Repository as truth | Full traceability, git history | All artifacts in repo |
| Human accountability | AI assists, never decides | Process, extension logic |
| Async-first | No real-time dependencies | No external services |
| Human-readable formats | AI and humans can read/write | YAML, Markdown only |

---

## High-Level Architecture

### Component Diagram

```
                           SYSTEM BOUNDARY

   ┌────────────────────────────────────────────────────────────────────┐
   │                                                                    │
   │   ┌─────────────────┐      ┌─────────────────┐                     │
   │   │   VS Code       │      │    CLI Tools    │                     │
   │   │   Extension     │      │   (Future)      │                     │
   │   └────────┬────────┘      └────────┬────────┘                     │
   │            │                        │                              │
   │            ▼                        ▼                              │
   │   ┌─────────────────────────────────────────────────────────────┐  │
   │   │                    File System Layer                        │  │
   │   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │  │
   │   │  │ ~/.adrai/    │  │  docs/       │  │  plans/      │       │  │
   │   │  │ (personal)   │  │  (debates,   │  │  (AIDE       │       │  │
   │   │  │              │  │   ADRs)      │  │   plans)     │       │  │
   │   │  └──────────────┘  └──────────────┘  └──────────────┘       │  │
   │   └─────────────────────────────────────────────────────────────┘  │
   │                                                                    │
   │   ┌─────────────────────────────────────────────────────────────┐  │
   │   │                    Cross-Cutting Concerns                   │  │
   │   │    [LINK IDs]    [YAML/MD Parsing]    [Git Integration]     │  │
   │   └─────────────────────────────────────────────────────────────┘  │
   │                                                                    │
   └────────────────────────────────────────────────────────────────────┘
```

### Component Descriptions

| Component | Responsibility | Technology |
|-----------|----------------|------------|
| VS Code Extension | Personal notes, promotion workflow | TypeScript, VS Code API |
| CLI Tools | Mesh queries, validation, diagram generation | TypeScript, bun |
| File System Layer | YAML/MD read/write, path resolution | Node.js fs, yaml package |
| Personal Storage | Review notes (gitignored) | YAML in `~/.adrai/` |
| Repo Storage | Debates, ADRs, plans | Markdown/YAML in repo |

---

## Data Architecture

### Data Stores

| Store | Type | Purpose | Owner |
|-------|------|---------|-------|
| `~/.adrai/review-notes.yaml` | YAML | Personal annotations (default) | Extension |
| `~/.adrai/[project]/review-notes.yaml` | YAML | Project-specific annotations | Extension |
| Custom path via `adrai.storageLocation` | YAML | User-defined location | Extension |
| `docs/debates/*.deb.md` | Markdown | Formal debates | Team |
| `docs/debates/.deb-graph.yaml` | YAML | Dependency mesh | Team |
| `docs/adr/*.md` | Markdown | Architecture decisions | Team |
| `plans/*.md` | Markdown | AIDE work plans | Team |

### Data Flow

```
[Human reviews artifact]
         │
         ▼
[VS Code: Add Note (Ctrl+Shift+N)]
         │
         ▼
[~/.adrai/review-notes.yaml]    ← Personal, gitignored
         │
         │ Promote to debate
         ▼
[docs/debates/DEB-NNNN.deb.md] ← Team, version controlled
         │
         │ Resolve debate
         ▼
[docs/adr/ADR-NNN.md]          ← Team, version controlled
         │
         │ Unblock plan
         ▼
[plans/AIDE-NNNN.md]           ← Team, version controlled
```

### Data Domains

| Domain | Owner | Consumers |
|--------|-------|-----------|
| Personal Notes | Extension | Human reviewer only |
| Debates | Team | All reviewers, AI assistant |
| Dependency Mesh | Team | CLI tools, AI assistant |
| ADRs | Team | All team members |
| Plans | Team | All team members, CI |

---

## Extension Architecture

### VS Code Extension Components

```
tools/adrai-review-notes/
├── src/
│   ├── extension.ts        # Entry point, command registration
│   ├── noteStorage.ts      # YAML persistence layer
│   ├── noteProvider.ts     # Sidebar tree view provider
│   ├── commands.ts         # Command handlers
│   ├── settingsPanel.ts    # WebView settings UI
│   └── types.ts            # TypeScript interfaces
├── package.json            # Extension manifest
└── tsconfig.json           # TypeScript config
```

### Extension Data Model

```typescript
/**
 * Type of review note - ordered by urgency (low to high)
 */
type NoteType =
  | 'idea'          // Capture a new idea or insight (+)
  | 'bookmark'      // Come back to this later
  | 'uncertainty'   // Not sure yet, need more context (~)
  | 'question'      // Need answer/clarification (?)
  | 'concern'       // Potential issue to investigate (!)
  | 'pre-debate';   // Might warrant formal DEB-NNNN (!!)

/**
 * Status of a review note through its lifecycle
 */
type NoteStatus =
  | 'open'          // Newly created, needs attention
  | 'investigating' // Being researched/explored
  | 'promote'       // Marked for debate promotion
  | 'resolved';     // Closed, no longer active

/**
 * Position in a file (for selection capture)
 */
interface FilePosition {
  line: number;       // 1-indexed
  character: number;  // 0-indexed
}

/**
 * A specific location in a file that a note references
 */
interface NoteLocation {
  file: string;                   // Absolute or workspace-relative path
  line: number;                   // 1-indexed
  section?: string;               // Optional section name for semantic reference
  preview?: string;               // Preview of text at this location
  selectionStart?: FilePosition;  // Selection start (if text was selected)
  selectionEnd?: FilePosition;    // Selection end (if text was selected)
}

/**
 * A review note with optional multi-location references
 */
interface ReviewNote {
  id: string;                 // UUID v4
  content: string;            // Note text
  type: NoteType;             // Classification
  status: NoteStatus;         // Current status
  created: string;            // ISO 8601 creation timestamp
  updated: string;            // ISO 8601 last update timestamp
  locations: NoteLocation[];  // One or more file locations (can be empty)
  branch?: string;            // Git branch when created (null = all branches)
  promoted_to?: string;       // DEB-NNNN if promoted
  tags?: string[];            // Deprecated - kept for backwards compat
}

/**
 * Undo stack entry for reversible operations
 */
interface UndoEntry {
  operation: 'delete' | 'update';
  noteId: string;
  snapshot: ReviewNote;
  timestamp: string;
}
```

---

### Extension Features

#### Core Features
- **Multi-location notes** — Notes can reference multiple file locations
- **Location-free notes** — Notes without file locations (pure ideas)
- **Branch awareness** — Filter notes by git branch
- **Stale location detection** — Detect moved/deleted file references

#### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+N` | Add new review note |
| `Ctrl+Shift+L` | Add location to selected note |
| `Ctrl+Shift+R` | Toggle review notes panel |
| `Ctrl+Shift+F` | Search notes (when panel focused) |
| `Ctrl+Shift+B` | Quick bookmark note |
| `Ctrl+Alt+Enter` | Navigate to selected note |
| `Ctrl+C` | Copy note text (when panel focused) |
| `F2` | Edit note (when panel focused) |
| `Ctrl+Z` | Undo last delete/update (when panel focused) |

#### Configuration Options

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `adrai.storageLocation` | string | `~/.adrai/review-notes.yaml` | Path to notes file |
| `adrai.projectStorage` | boolean | `false` | Per-project storage mode |
| `adrai.debateTemplateDir` | string | `docs/debates/templates` | Debate templates path |
| `adrai.debatesDir` | string | `docs/debates` | Debates directory path |
| `adrai.groupBy` | enum | `status` | Grouping: status, type, file |
| `adrai.branchFilter` | boolean | `false` | Show current branch only |
| `adrai.showLocation` | boolean | `true` | Show file location in note |
| `adrai.showBranch` | boolean | `true` | Show branch name for other branches |
| `adrai.showDate` | boolean | `false` | Show creation date |
| `adrai.sortBy` | enum | `date` | Sort: date, type, status |
| `adrai.sortOrder` | enum | `desc` | Sort: asc, desc |
| `adrai.quickNoteDefaultType` | enum | `bookmark` | Default type for quick note |
| `adrai.quickNoteDefaultStatus` | enum | `open` | Default status for quick note |
| `adrai.showNoteIcons` | boolean | `true` | Show icons on notes |

#### Quick Note Auto-Detection

Quick note (`Ctrl+Shift+B`) detects note type from punctuation:

| Punctuation | Type |
|-------------|------|
| `+` | idea |
| `~` | uncertainty |
| `?` | question |
| `!` | concern |
| `!!` | pre-debate |
| (none) | Uses `quickNoteDefaultType` setting |

---

## Dependency Mesh Architecture

### Graph Schema

```yaml
# docs/debates/.deb-graph.yaml
version: "1.0"

nodes:
  debates:
    DEB-0001:
      status: active
      owner: "@sprantic"
      created: "2026-01-29"

  plans:
    AIDE-0001:
      status: complete

edges:
  blocks:
    DEB-0001: [AIDE-0002]  # DEB-0001 blocks AIDE-0002

  blocked_by:              # Auto-generated inverse
    AIDE-0002: [DEB-0001]
```

### Graph Operations

| Operation | Input | Output | Algorithm |
|-----------|-------|--------|-----------|
| Critical Path | Target ID | Ordered list | Reverse topological sort |
| Impact Analysis | Debate ID + Resolution | Affected items | Forward BFS |
| Resolution Order | None | Priority queue | Weighted topological sort |
| Cycle Detection | None | Error or OK | Three-color DFS |
| Staleness | None | Scored list | Multi-factor scoring |
| What-If | Debate + Hypothetical | Before/after | Graph snapshot |

---

## Technology Stack

### Languages & Frameworks

| Layer | Technology | Version |
|-------|------------|---------|
| Backend (CLI) | TypeScript | 5.3+ |
| Extension | TypeScript + VS Code API | 5.3+ / 1.85+ |
| Runtime | bun | 1.0+ |

### Key Dependencies

| Dependency | Purpose | License |
|------------|---------|---------|
| yaml | YAML parsing | ISC |
| uuid | ID generation | MIT |
| @types/vscode | VS Code type definitions | MIT |

---

## Architecture Decision Records

Key decisions that shaped this architecture:

| ADR | Decision | Status |
|-----|----------|--------|
| [ADR-001](../adr/ADR-001-technology-stack.md) | TypeScript, bun, YAML, Mermaid | Accepted |
| [ADR-002](../adr/ADR-002-architecture-style.md) | Repo-first architecture | Accepted |

---

## Future Considerations

### Known Limitations

- **No real-time collaboration** — By design, async-first
- **YAML scale limits** — May need migration for >10K debates
- **Single-repo scope** — Cross-repo debates not supported

### Planned Improvements

| Improvement | Priority | Target |
|-------------|----------|--------|
| CLI tools for mesh queries | High | 2026-Q2 |
| Mermaid diagram auto-generation | Medium | 2026-Q2 |
| Static site for stakeholders | Medium | 2026-Q3 |
| AI review assistance skills | High | 2026-Q2 |

---

## Related Documents

- [Foundations](../FOUNDATIONS.md) (vision, goals, constraints)
- [Workflows](../WORKFLOWS.md) (team rituals, AI assistance)
- [ADRs](../adr/README.md)
- [Conceptual Overview](adrai-conceptual-overview.md)

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-29 | @sprantic | Initial architecture document |
| 2.0 | 2026-01-31 | @sprantic | Sync with v0.8.2 implementation: updated file structure, data model, NoteType/NoteStatus enums, storage options, keyboard shortcuts, configuration options, added quick note auto-detection |
