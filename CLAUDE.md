# adrai (AIDE Debate Tracking System)

## Project Overview

adrai extends AIDE with a **review-triggered debate system** for structured validation in AI-assisted engineering.

**Core insight:** AI creates fast, humans validate slow. adrai structures the validation process.

---

## AIDE Methodology

This project follows AIDE (AI-Driven Engineering) methodology.

### Key AIDE Concepts

| Concept | Description |
|---------|-------------|
| **AIDE Plans** | Work units with ID `AIDE-NNNN` in `plans/` |
| **ADRs** | Architecture Decision Records in `docs/adr/` |
| **LINK IDs** | Traceability via `AIDE-NNNN`, `DEB-NNNN`, `ADR-NNN` in code/tests/commits |
| **PTC Loop** | Plan → Test → Code (tests before implementation) |
| **Risk Levels** | Trivial, Low, Medium, High, Critical |

### Before Starting Work

1. Check for existing AIDE plan in `plans/`
2. If no plan exists for non-trivial work, create one from template
3. Reference AIDE ID in all tests, code comments, and commits

### Plan Mode

**IMPORTANT:** When using Claude Code's plan mode, always save the plan as an AIDE plan file in the project's `plans/` directory:

1. Use the next available AIDE ID from `plans/.aide-tracker.md`
2. Create `plans/AIDE-NNNN-descriptive-name.md` following the AIDE plan template
3. Update `plans/.aide-tracker.md` to increment the next ID
4. Only then exit plan mode to proceed with implementation

The project repo's `plans/` directory is the single source of truth for all work plans—not Claude's internal plan storage.

---

## adrai-Specific Patterns

### Debates

adrai adds debates (`DEB-NNNN`) to AIDE for complex decisions:

```
docs/debates/
├── .deb-tracker.md            # ID allocation
├── .deb-graph.yaml            # Dependency mesh
├── templates/debate-template.md
└── DEB-NNNN-topic.deb.md      # Debate files
```

### Linking

| Artifact | Links To |
|----------|----------|
| AIDE Plan | `Blocked by: DEB-NNNN` when waiting on debate |
| ADR | `Resolved by: DEB-NNNN` when debate produced decision |
| Debate | `Depends On: DEB-NNNN` and `Blocks: AIDE-NNNN, ADR-NNN` |

### When to Create a Debate

Create a debate when **any** apply:

1. **Disagreement** - Two people can't resolve in MR comments
2. **Irreversible** - Decision is hard to undo later
3. **Uncertainty** - Author or reviewer flags "not sure about this"

Everything else → Standard MR review. See [docs/debates/README.md](docs/debates/README.md) for details.

---

## Project Structure

```
adrai/
├── docs/
│   ├── FOUNDATIONS.md         # Vision, goals, constraints
│   ├── WORKFLOWS.md           # Team rituals, AI assistance
│   ├── adrai-concepts/        # System design and concepts
│   ├── adr/                   # Architecture decisions
│   └── debates/               # Debate artifacts (adrai-specific)
├── plans/
│   ├── .aide-tracker.md       # AIDE ID allocation
│   └── AIDE-NNNN-*.md         # Work plans
└── tools/
    └── adrai-review-notes/     # VS Code extension
```

---

## Technology Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Language | TypeScript | Type safety, tooling ecosystem |
| Runtime | bun | Fast, modern, built-in TypeScript |
| Extension | VS Code Extension API | Primary dev environment |
| Storage | YAML files | Human-readable, version-controlled |
| Diagrams | Mermaid | Markdown-native |
| Debate syntax | Argdown-compatible | Structured argumentation |

---

## Workflow Patterns

### Creating a New Feature

1. Create AIDE plan from `docs/debates/templates/plan-template.md`
2. If uncertain or complex, consider debate first (`DEB-NNNN`)
3. Write tests referencing AIDE ID: `test_feature_AIDE0042()`
4. Implement with AIDE ID in comments: `// AIDE-0042: Feature description`
5. Commit with AIDE ID: `feat(scope): add feature [AIDE-0042]`

### When AI Generates Code

AI should:
- Check existing debates for related decisions
- Respect constraints in `docs/FOUNDATIONS.md`
- Follow patterns established in ADRs
- Mark uncertainty with review notes (VS Code extension)
- Never resolve debates autonomously

### Review Annotations

The VS Code extension (`tools/adrai-review-notes/`) supports:
- Personal notes during review (`~/.adrai/review-notes.yaml`)
- Promotion to debate when discussion warranted
- Five note types: question, uncertainty, concern, bookmark, pre-debate

---

## AI Guidelines

### Do

- Reference AIDE IDs in all generated artifacts
- Check debate status before implementing blocked plans
- Use structured argumentation (Argdown) in debates
- Link decisions to parent debates/goals
- Mark uncertain areas for human review

### Don't

- Implement blocked plans (`Blocked by: DEB-NNNN`)
- Resolve debates or vote without human direction
- Skip debate escalation for complex decisions
- Create ADRs without debate trail (for significant decisions)
- Generate content that conflicts with resolved ADRs

---

## Key Documents

| Document | Purpose |
|----------|---------|
| [Foundations](docs/FOUNDATIONS.md) | Vision, goals, constraints |
| [Workflows](docs/WORKFLOWS.md) | Team rituals, AI assistance |
| [Architecture](docs/adrai-concepts/adrai-software-architecture.md) | System structure |
| [adrai Conceptual Overview](docs/adrai-concepts/adrai-conceptual-overview.md) | Full debate system design |
| [Debates README](docs/debates/README.md) | Debate quick reference |

---

## Commands

```bash
# Check debate dependencies
cat docs/debates/.deb-graph.yaml

# Find what blocks an AIDE plan
grep -l "Blocks:.*AIDE-0145" docs/debates/*.deb.md

# List active debates
grep -l "Status.*Active" docs/debates/*.deb.md

# Get next AIDE ID
cat plans/.aide-tracker.md | grep "Next Available"
```
