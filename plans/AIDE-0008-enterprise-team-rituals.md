# AIDE-0008: Enterprise Team Rituals for AI-First Architecture

> **Status:** Complete
> **Author:** @sprantic
> **Created:** 2026-01-31
> **Updated:** 2026-02-01
> **AIDE ID:** AIDE-0008
> **Risk Level:** Low
> **Blocked by:** None
> **Depends on:** None

---

## Summary

Create documentation artifacts for team rituals based on **TOSD (Time-Oriented Software Development)** combined with **AIDE methodology**. The workflow is derived from `docs/theory-vs-reallife/myideas.md` which correctly synthesizes both approaches.

**Methodology layers:**
- **TOSD** - Time orientation, OK Point, flow, Ks/Rs roles
- **AIDE** - AI-Driven Engineering, PTC loop (Plan→Test→Code)
- **adrai** - Extends AIDE with debates and ADRs for complex decisions

---

## Context

### Source of Truth

`docs/theory-vs-reallife/myideas.md` provides a clean synthesis of:
- **TOSD** (BetaCodex Network) - Time orientation, OK Point, flow
- **AIDE** (AI-Driven Engineering) - PTC loop (Plan→Test→Code)
- **adrai** (this project) - Extends AIDE with debates (DEB-NNNN) and ADRs

### The Workflow

```
List of Items → Conceptualization → OK Point → Realization → Done Point → Completion
```

| Phase | Time-box | Owner | Key Actions |
|-------|----------|-------|-------------|
| **List of Items** | - | Business | ~100 items max, changes allowed, items lock when in progress |
| **Conceptualization** | 20min-1day | Conceptualizer (K) | Create concept branch, draft MR, talk with R |
| **OK Point** | - | K + R | Handshake: sync or async, debates/ADRs if issues |
| **Realization** | 1-3 days | Realizer (R) | Tests FAIL → Code → Tests PASS, commit, push |
| **Done Point** | - | R + Peer | Peer walk-through, smaller issues fixed on spot |
| **Completion** | - | R | E2E tests pass, merge to develop |

### Key Principles (from TOSD)

1. **Time is fixed, capacity swings** - Realization is 1-3 days max
2. **OK Point as handshake** - Concept must be clear enough to realize
3. **No backlogs** - If concepts stack, capacity increases
4. **TTEO** - Talk To Each Other, solve problems immediately

### Test Order (from AIDE PTC)

```
* generate tests that FAIL      ← TDD: Red
* generate code with AI         ← TDD: Green
* review code
* run all tests which need to PASS
```

### When Issues Arise

- **At OK Point:** If Realizer doesn't accept, concept goes back to rework
- **If questions:** Talk through with Conceptualizer
- **If real disagreement:** Create Debate (DEB-NNNN) which produces ADR *(adrai extension)*
- **At Done Point:** If Reviewer doesn't accept, goes back to rework

> **Note:** Debates (DEB-NNNN) and ADRs are **adrai extensions** to AIDE, not core AIDE. They provide structured disagreement resolution when TTEO isn't sufficient.

---

## Implementation

### Phase 1: Update RITUALS.md

**File: `docs/debates/RITUALS.md`**

Rewrite to match myideas.md structure:

1. **Overview** - The workflow diagram
2. **List of Items** - Business-owned, ~100 max, no backlog
3. **Conceptualization** - Save the Concept steps (Jira, branch, MR)
4. **OK Point** - Sync and async variants
5. **Realization** - TDD order (tests FAIL → code → tests PASS)
6. **Done Point** - Peer walk-through
7. **Completion** - E2E tests, merge

Keep existing sections:
- Branch Classes
- Environments
- Approval Gates
- MR Conventions
- When to Escalate to Debate (simplified)

### Phase 2: Update AI-ASSIST.md

**File: `docs/debates/AI-ASSIST.md`**

Align with new workflow:
- AI generates tests that FAIL first
- AI generates code to pass tests
- Remove old 12-step workflow references
- Keep: Roo commands, trust calibration, escalation rules

### Phase 3: Verify Consistency

Check all docs reference the same workflow model.

---

## Files to Modify

| File | Action |
|------|--------|
| `docs/debates/RITUALS.md` | Rewrite based on myideas.md |
| `docs/debates/AI-ASSIST.md` | Align test order, update workflow refs |
| `plans/.aide-tracker.md` | Mark AIDE-0008 complete |

---

## Verification

1. RITUALS.md follows: List → Concept → OK Point → Realize → Done Point
2. Test order is: tests FAIL → code → tests PASS (TDD)
3. AI-ASSIST.md consistent with RITUALS.md
4. No conflicting workflow models remain

---

## References

- [BetaCodex TOSD Paper](docs/theory-vs-reallife/BetaCodex26-TOSD.pdf)
- [myideas.md](docs/theory-vs-reallife/myideas.md) - Source of truth
- [AIDE Conceptual Overview](../docs/adrai-concepts/adrai-conceptual-overview.md)

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-31 | Initial draft with dual-loop model |
| 2.0 | 2026-02-01 | Restructured: adopted myideas.md as source of truth, TOSD + AIDE synthesis |
