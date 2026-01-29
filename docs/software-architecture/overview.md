# adrAI Architecture Overview

> **Version:** 1.0
> **Last Updated:** 2026-01-29
> **Owner:** @sprantic
> **Related:** [Vision](../vision.md) | [Goals](../goals.md) | [Constraints](../constraints.md)

---

## System Context

### Purpose

adrAI (AIDE Debate Tracking System) provides structured validation for AI-assisted engineering by:
- Capturing review observations as personal notes
- Promoting observations to formal debates when warranted
- Tracking dependency relationships between debates, plans, and ADRs
- Providing AI-aided review assistance

### Context Diagram

```
                        EXTERNAL CONTEXT

    ┌──────────┐                                      ┌──────────────┐
    │  Human   │                                      │     AI       │
    │ Reviewer │◀─────────────────────────────────────│  Assistant   │
    └────┬─────┘                                      └──────┬───────┘
         │                                                   │
         │              ┌─────────────────────┐              │
         │              │                     │              │
         └─────────────▶│       adrAI          │◀─────────────┘
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

   ┌─────────────────────────────────────────────────────────────────────┐
   │                                                                     │
   │   ┌─────────────────┐      ┌─────────────────┐                     │
   │   │   VS Code       │      │    CLI Tools    │                     │
   │   │   Extension     │      │   (Future)      │                     │
   │   └────────┬────────┘      └────────┬────────┘                     │
   │            │                        │                              │
   │            ▼                        ▼                              │
   │   ┌─────────────────────────────────────────────────────────────┐  │
   │   │                    File System Layer                         │  │
   │   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │  │
   │   │  │ ~/.adrai/     │  │  docs/       │  │  plans/      │       │  │
   │   │  │ (personal)   │  │  (debates,   │  │  (AIDE       │       │  │
   │   │  │              │  │   ADRs)      │  │   plans)     │       │  │
   │   │  └──────────────┘  └──────────────┘  └──────────────┘       │  │
   │   └─────────────────────────────────────────────────────────────┘  │
   │                                                                     │
   │   ┌─────────────────────────────────────────────────────────────┐  │
   │   │                    Cross-Cutting Concerns                    │  │
   │   │    [LINK IDs]    [YAML/MD Parsing]    [Git Integration]      │  │
   │   └─────────────────────────────────────────────────────────────┘  │
   │                                                                     │
   └─────────────────────────────────────────────────────────────────────┘
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
| `~/.adrai/review-notes.yaml` | YAML | Personal annotations | Extension |
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
│   ├── noteTreeProvider.ts # Sidebar tree view
│   ├── debatePromoter.ts   # Note → Debate workflow
│   └── types.ts            # TypeScript interfaces
├── package.json            # Extension manifest
└── tsconfig.json           # TypeScript config
```

### Extension Data Model

```typescript
interface ReviewNote {
  id: string;              // UUID
  content: string;         // Note text
  type: NoteType;          // question | uncertainty | concern | bookmark | pre-debate
  status: NoteStatus;      // active | resolved | promoted
  locations: Location[];   // Multiple file locations
  createdAt: string;       // ISO timestamp
  promotedTo?: string;     // DEB-NNNN if promoted
}

interface Location {
  filePath: string;        // Relative to workspace
  line: number;            // 1-indexed
  character: number;       // 0-indexed
}
```

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

- [Vision](../vision.md)
- [Goals & Objectives](../goals.md)
- [Constraints](../constraints.md)
- [ADRs](../adr/README.md)
- [adrAI Specification](../adrAI-AIDE-Debate-Tracking-System.md)

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-29 | @sprantic | Initial architecture document |
