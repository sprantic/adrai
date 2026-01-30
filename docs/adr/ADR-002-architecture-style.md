# ADR-002: Architecture Style

> **Status:** Accepted
> **Date:** 2026-01-29
> **Deciders:** @sprantic
> **Related:** ADR-001

---

## Context

adrai needs an architecture that:
1. Keeps all artifacts in version control for traceability
2. Works without external databases or services
3. Supports AI-assisted workflows (AI reads/writes artifacts)
4. Provides a good developer experience in VS Code
5. Can evolve to support visualization dashboards later

The debate system is fundamentally about structured documentation and decision tracking, not real-time collaboration.

---

## Decision

**We will use a repo-first architecture:**

| Component | Location | Format |
|-----------|----------|--------|
| **Debates** | `docs/debates/*.deb.md` | Argdown-compatible Markdown |
| **Dependency Graph** | `docs/debates/.deb-graph.yaml` | YAML |
| **AIDE Plans** | `plans/*.md` | Markdown |
| **ADRs** | `docs/adr/*.md` | Markdown |
| **Personal Notes** | `~/.adrai/review-notes.yaml` | YAML (gitignored) |
| **CLI Tools** | `tools/` | TypeScript |
| **VS Code Extension** | `tools/adrai-review-notes/` | TypeScript |

### Key Architectural Principles

1. **Repository as single source of truth** - All project artifacts in `docs/` and `plans/`
2. **Personal data isolated** - Review notes in home directory, never committed
3. **Human-readable formats** - YAML and Markdown for all artifacts
4. **VS Code as primary UI** - Extension for daily workflow
5. **Static site for stakeholders** - Generated from repo artifacts (future)

---

## Consequences

### Positive

- Full git history for all decisions and debates
- No external services to maintain or secure
- AI can read/write artifacts directly (text files)
- Works offline, no network dependency
- Easy to backup (it's just git)
- Portable between machines (clone repo)

### Negative

- No real-time collaboration (async only)
- Scale limited by git repository size
- No built-in notification system
- Visualization requires separate build step

### Neutral

- CI/CD needed for validation and site generation
- May need migration strategy if repo grows large

---

## Alternatives Considered

### Option 1: Database-Backed System

**Description:** Store debates in PostgreSQL, serve via API.

**Pros:**
- Real-time updates
- Better query capabilities
- Scales to large datasets

**Cons:**
- Requires infrastructure
- Loses git history benefits
- AI integration more complex
- Adds operational burden

**Why not chosen:** The benefits of repo-based traceability outweigh real-time features for this use case.

### Option 2: External Service (Notion, Confluence)

**Description:** Use existing collaboration tools for debate tracking.

**Pros:**
- Built-in collaboration
- No development needed
- Familiar interfaces

**Cons:**
- Data not in repo (breaks traceability)
- Vendor lock-in
- API limitations
- Cost at scale

**Why not chosen:** AIDE methodology requires repo-native artifacts for LINK traceability.

### Option 3: Hybrid (Repo + Sync Service)

**Description:** Repo for artifacts, separate service for real-time features.

**Pros:**
- Best of both worlds
- Real-time notifications possible

**Cons:**
- Sync complexity
- Potential for conflicts
- Two systems to maintain

**Why not chosen:** Added complexity not justified for initial implementation. Can revisit later.

---

## Implementation Notes

### Directory Structure

```
project/
├── docs/
│   ├── vision.md
│   ├── goals.md
│   ├── constraints.md
│   ├── adr/
│   │   └── ADR-NNN-*.md
│   ├── debates/
│   │   ├── .deb-tracker.md
│   │   ├── .deb-graph.yaml
│   │   ├── DEB-NNNN-*.deb.md
│   │   └── templates/
│   └── software-architecture/
│       └── overview.md
├── plans/
│   ├── .aide-tracker.md
│   └── AIDE-NNNN-*.md
└── tools/
    └── adrai-review-notes/
```

### Data Flow

```
[Human reviews artifact]
    │
    ▼
[VS Code extension captures notes] → ~/.adrai/review-notes.yaml
    │
    ▼
[Promote to debate] → docs/debates/DEB-NNNN.deb.md
    │
    ▼
[Debate resolves] → docs/adr/ADR-NNN.md
    │
    ▼
[Update blocked plans] → plans/AIDE-NNNN.md unblocked
```

### Future Extensions

- Static site generator for stakeholder dashboards
- GitHub Actions for validation
- Webhook notifications via ntfy or similar
- Mermaid diagram auto-generation

---

## References

- [ADR-001: Technology Stack](ADR-001-technology-stack.md)
- [adrai Conceptual Overview](../adrai-conceptual-overview.md)

---

## Revision History

| Date | Author | Description |
|------|--------|-------------|
| 2026-01-29 | @sprantic | Initial decision |
