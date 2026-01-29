# adrAI (AIDE Debate Tracking System)

## Project Overview

adrAI extends AIDE with a **review-triggered debate system** for structured validation in AI-assisted engineering.

**Core insight:** AI creates fast, humans validate slow. adrAI structures the validation process.

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

## adrAI-Specific Patterns

### Debates

adrAI adds debates (`DEB-NNNN`) to AIDE for complex decisions:

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

### 7-Gate Decision Flow

When reviewing, a debate is warranted if ANY gate triggers:

1. Critical file patterns (auth/*, security/*)
2. AIDE risk level Critical
3. Stakeholder disagreement
4. Sets new precedent/pattern
5. Difficult to reverse
6. Complexity score >= 10
7. Author flags uncertainty

See [docs/debates/README.md](docs/debates/README.md) for full criteria.

---

## Project Structure

```
adrai/
├── docs/
│   ├── vision.md              # Why adrAI exists
│   ├── goals.md               # What we're achieving
│   ├── constraints.md         # Technical boundaries
│   ├── adr/                   # Architecture decisions
│   ├── debates/               # Debate artifacts (adrAI-specific)
│   └── software-architecture/ # System overview
├── plans/
│   ├── .aide-tracker.md       # AIDE ID allocation
│   └── AIDE-NNNN-*.md         # Work plans
└── tools/
    └── adts-review-notes/     # VS Code extension
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
- Respect constraints in `docs/constraints.md`
- Follow patterns established in ADRs
- Mark uncertainty with review notes (VS Code extension)
- Never resolve debates autonomously

### Review Annotations

The VS Code extension (`tools/adts-review-notes/`) supports:
- Personal notes during review (`~/.adts/review-notes.yaml`)
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
- Skip the 7-gate flow for complex decisions
- Create ADRs without debate trail (for significant decisions)
- Generate content that conflicts with resolved ADRs

---

## Key Documents

| Document | Purpose |
|----------|---------|
| [Vision](docs/vision.md) | Why adrAI exists |
| [Goals](docs/goals.md) | What we're achieving |
| [Constraints](docs/constraints.md) | Technical boundaries |
| [Architecture](docs/software-architecture/overview.md) | System structure |
| [adrAI Spec](docs/adrAI-AIDE-Debate-Tracking-System.md) | Full debate system design |
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
