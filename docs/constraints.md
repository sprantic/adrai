# adrai Constraints & Boundaries

> **Version:** 1.0
> **Last Updated:** 2026-01-29
> **Owner:** @sprantic
> **Related:** [Vision](vision.md) | [Goals](goals.md)

---

## Purpose

This document defines the constraints and boundaries that all adrai work must respect. These constraints inform plan risk assessment, AI guardrails, architecture decisions, and code review checkpoints.

---

## Technical Constraints

### Platform & Infrastructure

| Constraint | Value | Rationale | Flexibility |
|------------|-------|-----------|-------------|
| Primary Language | TypeScript 5.3+ | Type safety for complex data | Fixed |
| Runtime | bun 1.0+ | Fast, native TS support | Negotiable |
| Extension Platform | VS Code 1.85+ | Dominant IDE | Fixed |
| Data Storage | YAML files | Human-readable, git-friendly | Fixed |
| Diagrams | Mermaid | Markdown-native rendering | Negotiable |

### Architecture Patterns

| Pattern | Requirement | Example |
|---------|-------------|---------|
| Data Storage | Repo-first, no external databases | All artifacts in `docs/` and `plans/` |
| Personal Data | Isolated from repo | `~/.adrai/` for personal notes |
| AI Integration | Read/write text files | AI operates on markdown/YAML directly |
| Version Control | Git-native workflows | Full history for all decisions |

### Service Boundaries

```
BOUNDARY RULES

ALLOWED:
  - CLI tools reading/writing to docs/ and plans/
  - VS Code extension reading/writing to ~/.adrai/
  - Extension promoting notes to docs/debates/
  - AI reading all repo artifacts
  - AI proposing changes to artifacts

FORBIDDEN:
  - External database dependencies
  - Real-time sync services
  - AI resolving debates without human approval
  - Personal notes committed to repo
  - Breaking LINK traceability
```

---

## AI-Specific Constraints

### AI Boundaries

| Constraint | Rule | Enforcement |
|------------|------|-------------|
| No autonomous decisions | AI assists, never resolves debates | Code review |
| No voting | AI cannot cast votes on debates | Process |
| Human approval required | All promotions/resolutions need human | Extension logic |
| Consistency checking | AI can flag conflicts, not resolve | Skill design |
| Traceability preserved | AI must maintain LINK IDs | Validation |

### AI Capabilities

| CAN | CANNOT |
|-----|--------|
| Summarize debate state | Vote on theses |
| Identify gaps in reasoning | Add arguments without human review |
| Check cross-debate consistency | Resolve debates |
| Generate draft artifacts | Approve plans |
| Suggest questions to reviewers | Delete or supersede artifacts |

---

## Data Constraints

### File Formats

| Data Type | Format | Location |
|-----------|--------|----------|
| Debates | Argdown-compatible Markdown | `docs/debates/*.deb.md` |
| Dependency Graph | YAML | `docs/debates/.deb-graph.yaml` |
| Plans | Markdown | `plans/*.md` |
| ADRs | Markdown | `docs/adr/*.md` |
| Personal Notes | YAML | `~/.adrai/review-notes.yaml` |

### ID Schemes

| Artifact | Format | Tracker |
|----------|--------|---------|
| Debate | DEB-NNNN (4-digit) | `.deb-tracker.md` |
| Plan | AIDE-NNNN (4-digit) | `.aide-tracker.md` |
| ADR | ADR-NNN (3-digit) | `docs/adr/README.md` |

### Storage Limits

| Constraint | Limit | Rationale |
|------------|-------|-----------|
| Single debate file | < 100KB | Git performance |
| Graph file | < 1MB | YAML parsing speed |
| Personal notes | < 10MB | Local storage |
| Total debates | < 10,000 | Practical limit |

---

## Development Constraints

### Code Quality Standards

| Standard | Requirement | Enforcement |
|----------|-------------|-------------|
| Type safety | Strict TypeScript | `tsconfig.json` |
| Linting | ESLint with TypeScript rules | CI |
| AIDE compliance | LINK IDs in tests and code | Code review |
| Documentation | Public APIs documented | Code review |

### Dependency Rules

| Rule | Detail |
|------|--------|
| Minimal dependencies | Prefer standard library |
| Security scanning | Review before adding |
| Version pinning | Lock files committed |
| License compliance | MIT, Apache 2.0, BSD only |

### Git Conventions

| Constraint | Rule |
|------------|------|
| Branch protection | `main` requires PR |
| Commit messages | Include AIDE ID for tracked work |
| No large files | Use `.gitignore` for binaries |
| Personal data | Never commit `~/.adrai/` contents |

---

## Operational Constraints

### Performance Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| Extension activation | < 2s | UX |
| Note creation | < 100ms | UX |
| Graph query | < 500ms | CLI responsiveness |
| Debate promotion | < 1s | Workflow |

### Reliability

| Aspect | Strategy |
|--------|----------|
| Data durability | Git provides history |
| Conflict resolution | Git merge strategies |
| Backup | Standard repo backup |
| Recovery | Git reflog, branches |

---

## Process Constraints

### Debate Workflow

| Constraint | Rule |
|------------|------|
| Minimum deliberation | Active debates need 24h before deciding |
| Stakeholder notification | Tag relevant parties |
| Resolution format | Must produce ADR for significant decisions |
| Archive policy | Resolved > 90 days moved to archive/ |

### Review Triggers

All 7 gates must be checked before bypassing debate:

1. Critical file patterns
2. Risk level Critical
3. Stakeholder disagreement
4. Precedent setting
5. Reversibility
6. Complexity score >= 10
7. Author uncertainty

---

## Flexibility Legend

| Symbol | Meaning | Change Process |
|--------|---------|----------------|
| Fixed | Cannot change | ADR + significant justification |
| Negotiable | Can change with justification | ADR |
| Flexible | Team can adjust | Document in plan |

---

## Constraint Violation Handling

When a constraint cannot be met:

1. **Identify** the specific constraint being violated
2. **Document** why the constraint cannot be met
3. **Propose** alternatives or mitigations
4. **Escalate** per the flexibility level:
   - Flexible: Document in AIDE plan
   - Negotiable: Create ADR
   - Fixed: Create debate, get explicit approval

---

## Related Documents

- [Vision](vision.md)
- [Goals & Objectives](goals.md)
- [Architecture Overview](software-architecture/overview.md)
- [ADRs](adr/README.md)
- [adrai Conceptual Overview](adrai-conceptual-overview.md)

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-29 | @sprantic | Initial constraints document |
