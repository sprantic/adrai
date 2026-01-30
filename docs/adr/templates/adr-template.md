# ADR Template

Architecture Decision Record template. Save as `docs/adr/ADR-NNN-title.md`.

---

```markdown
# ADR-NNN: [Decision Title]

> **Status:** Proposed | Accepted | Deprecated | Superseded
> **Date:** YYYY-MM-DD
> **Deciders:** @person1, @person2
> **Related:** AIDE-NNNN, ADR-XXX
> **Resolved by:** DEB-NNNN (debate that produced this decision, if any)

---

## Context

[What is the issue that we're seeing that is motivating this decision or change?]

[Describe the forces at play:
- Technical constraints
- Business requirements
- Team capabilities
- Time pressures
- Existing architecture]

---

## Decision

[What is the change that we're proposing and/or doing?]

**We will [action].**

[Be specific and clear about what was decided.]

---

## Consequences

### Positive

- [Benefit 1]
- [Benefit 2]
- [Benefit 3]

### Negative

- [Drawback 1]
- [Drawback 2]

### Neutral

- [Side effect that is neither positive nor negative]

---

## Alternatives Considered

### Option 1: [Alternative Name]

**Description:** [Brief description]

**Pros:**
- Pro 1
- Pro 2

**Cons:**
- Con 1
- Con 2

**Why not chosen:** [Reason]

### Option 2: [Alternative Name]

**Description:** [Brief description]

**Pros:**
- Pro 1
- Pro 2

**Cons:**
- Con 1
- Con 2

**Why not chosen:** [Reason]

---

## Implementation Notes

[Any specific guidance for implementing this decision]

- Note 1
- Note 2

---

## References

- [Link to relevant documentation]
- [Link to related plan: AIDE-NNNN]
- [Link to external resources]

---

## Revision History

| Date | Author | Description |
|------|--------|-------------|
| YYYY-MM-DD | @author | Initial proposal |
| YYYY-MM-DD | @author | Updated after review |
```

---

## When to Write an ADR

Write an ADR when making decisions about:

| Category | Examples |
|----------|----------|
| Technology | New framework, database, library |
| Architecture | Service boundaries, patterns, protocols |
| Standards | Coding conventions, API design |
| Process | Workflow changes, tool adoption |
| Security | Authentication approach, encryption |

### ADR Triggers

- New technology adoption
- Significant refactoring
- Cross-cutting concerns
- Breaking changes
- Security-related decisions

---

## ADR Best Practices

### Do's

✅ Write ADRs at decision time, not after
✅ Keep them concise and focused
✅ Include rejected alternatives
✅ Link to related AIDE plans
✅ Update status when decisions change

### Don'ts

❌ Wait until implementation to document
❌ Write novels - be concise
❌ Skip alternatives section
❌ Delete deprecated ADRs (update status instead)
❌ Make decisions without ADRs for significant changes

---

## ADR Status Lifecycle

```
Proposed → Accepted → [Active Use]
                   ↓
              Deprecated (better approach found)
                   or
              Superseded by ADR-XXX
```

---

## Linking ADRs and AIDE Plans

When an AIDE plan triggers an architectural decision:

```markdown
# In the AIDE plan:
## Related Decisions
- ADR-015: Selected JWT for authentication

# In the ADR:
## Related
- AIDE-0042: User authentication implementation
```

## Linking ADRs and Debates

When an ADR is produced from a debate resolution:

```markdown
# In the ADR header:
> **Resolved by:** DEB-0042

# In the ADR context:
This decision was reached through structured debate DEB-0042,
which evaluated PostgreSQL vs CockroachDB for order management.
See [DEB-0042](../../docs/debates/DEB-0042-database-selection.deb.md)
for the full argumentation.

# In the debate:
## Resolution
**Produces:** ADR-015
```

---

## ADR Index

Maintain an index in `docs/adr/README.md`:

```markdown
# Architecture Decision Records

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](ADR-001-use-go.md) | Use Go as primary language | Accepted | 2024-01-15 |
| [ADR-002](ADR-002-event-driven.md) | Event-driven architecture | Accepted | 2024-02-01 |
| [ADR-015](ADR-015-jwt-auth.md) | JWT for authentication | Accepted | 2026-01-20 |
```
