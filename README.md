# adrai

**AIDE Review Lifecycle Managemnt System** — Structuring the validation bottleneck in AI-assisted engineering, where AI creates fast but humans validate slow.

## The Problem

AI-assisted software development has dramatically increased engineering velocity, but human review processes haven't kept pace:

- AI generates plans, code, and decisions faster than humans can validate
- The human in the loop is overwhelmed with documentation that needs attention
- Teams are having a hard time coordinating the work - agile rituals are way to slow
- Multiple architecture debates happen simultaneously with no structure
- Dependencies between decisions create an invisible mesh
- ADRs capture decisions but not the reasoning journey

## The Solution

adrai extends AIDE with:

- **Review-triggered debates** with 7-gate escalation criteria
- **Artifact lineage** answering "why does this exist?" at a glance
- **Dependency mesh** tracking blocking relationships
- **AI-aided review** helping humans validate faster
- **Personal annotations** via VS Code extension

## Quick Start

### VS Code Extension

The Review Notes extension captures fleeting thoughts during code review.

**Keyboard shortcuts:**
- `Ctrl+Shift+N` — Add review note at cursor
- `Ctrl+Shift+L` — Link location to existing note
- `Ctrl+Shift+R` — Toggle notes panel

### Creating a Debate

When a review note warrants formal discussion:

1. Right-click note → "Promote to Debate"
2. Extension creates `DEB-NNNN` from template
3. Structured argumentation using Argdown syntax
4. Resolution produces ADR with full reasoning trail

## Key Documents

| Document | Description |
|----------|-------------|
| [Vision](docs/vision.md) | Why adrai exists, problem statement, success indicators |
| [Goals](docs/goals.md) | 5 strategic goals with objectives and milestones |
| [Constraints](docs/constraints.md) | Technical boundaries and design decisions |
| [Architecture](docs/software-architecture/overview.md) | System structure and component design |
| [adrai Concepts](docs/adrai-conceptual-overview.md) | Complete debate system design |
| [Debates Guide](docs/debates/README.md) | How to use debates, 7-gate flow, templates |
| [Review Workflow](docs/debates/review-workflow.md) | Personal notes → debate promotion flow |

## Project Structure

```
adrai/
├── docs/
│   ├── vision.md              # Why adrai exists
│   ├── goals.md               # Strategic objectives
│   ├── constraints.md         # Technical boundaries
│   ├── adr/                   # Architecture Decision Records
│   ├── debates/               # Debate artifacts and templates
│   └── software-architecture/ # System design
├── plans/                     # AIDE work plans
├── tools/
│   └── adrai-review-notes/    # VS Code extension
└── assets/                    # Images and resources
```

## The 7-Gate Decision Flow

A debate is warranted if ANY gate triggers:

1. **Critical file patterns** — auth/*, security/*, core config
2. **AIDE risk level Critical** — Plan marked as critical risk
3. **Stakeholder disagreement** — Multiple reviewers conflict
4. **Sets new precedent** — Establishes pattern for future work
5. **Difficult to reverse** — High cost to change later
6. **Complexity score ≥10** — Calculated from multiple factors
7. **Author flags uncertainty** — "I'm not sure about this"

## Technology Stack

| Component | Choice |
|-----------|--------|
| Language | TypeScript |
| Runtime | bun |
| Extension | VS Code Extension API |
| Storage | YAML files (version-controlled) |
| Diagrams | Mermaid |
| Debate syntax | Argdown-compatible |

## Current Status

| Milestone | Status |
|-----------|--------|
| M1: Foundation (debates, templates, docs) | Complete |
| M2: Annotation System (VS Code extension) | Complete |
| M3: Review Integration | Planned |
| M4: AI-Aided Review | Planned |

## License

MIT

## Related

- AIDE Methodology - tbd
- [Argdown](https://argdown.org/) — Structured argumentation syntax
