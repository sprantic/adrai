# DEB-NNNN: [Central Question]

> **Status:** Draft | Active | Blocked | Deciding | Resolved | Superseded
> **Owner:** @your-name
> **Created:** YYYY-MM-DD
> **Updated:** YYYY-MM-DD
> **Priority:** 1 (Urgent) | 2 (High) | 3 (Normal) | 4 (Low)

---

## Lineage

| Field | Value |
|-------|-------|
| **Scope** | CON (Concept) |
| **Parent** | [REQ-NNN](link) or [OBJ-NNN](link) |
| **Purpose** | [Why does this debate exist? What decision does it enable?] |
| **Supersedes** | None | DEB-NNNN |
| **Blocked By** | None | DEB-NNNN |

---

## Dependencies

> **Depends On:** DEB-NNNN, ADR-NNN (list debates/decisions this waits for)
> **Blocks:** AIDE-NNNN, ADR-NNN (list plans/decisions waiting on this)

---

## Stakeholders

| Role | Person | Required? |
|------|--------|-----------|
| Owner | @name | Yes |
| Decider | @name | Yes |
| Contributor | @name | No |
| Reviewer | @name | No |

---

## The Question

[Central Question]: What is the core question we need to answer?

---

## Theses

### Thesis A: [Option Name]

<[Thesis A]>: [One-sentence position statement]

+ [Supporting Claim 1]: Description of why this supports Thesis A
  + [Sub-claim]: Additional supporting evidence
  - <Objection to claim>: Counter-argument to this claim
    + [Response]: Rebuttal to the objection

+ [Supporting Claim 2]: Another reason to support Thesis A

- [Weakness 1]: Acknowledged limitation of Thesis A
  + [Mitigation]: How this weakness could be addressed

### Thesis B: [Alternative Option Name]

<[Thesis B]>: [One-sentence position statement]

+ [Supporting Claim 1]: Description of why this supports Thesis B

- [Weakness 1]: Acknowledged limitation of Thesis B

### Thesis C: [Do Nothing / Status Quo]

<[Thesis C]>: We should not make a change at this time.

+ [Stability]: No risk of regression
- [Technical Debt]: Problem continues to compound

---

## Evidence

### E1: [Evidence Title]

**Type:** Benchmark | Research | Experience | POC | Expert Opinion
**Source:** [Link or reference]
**Summary:** [What does this evidence show?]
**Supports:** Thesis A, Thesis B

### E2: [Evidence Title]

**Type:** Benchmark | Research | Experience | POC | Expert Opinion
**Source:** [Link or reference]
**Summary:** [What does this evidence show?]
**Supports:** Thesis B

---

## Trade-off Analysis

| Factor | Thesis A | Thesis B | Thesis C |
|--------|----------|----------|----------|
| Complexity | Low | Medium | None |
| Risk | Medium | Low | High (tech debt) |
| Cost | $ | $$ | $0 |
| Time to implement | 2 weeks | 4 weeks | N/A |
| Team familiarity | High | Low | N/A |
| Reversibility | Easy | Hard | N/A |

---

## Discussion Log

### YYYY-MM-DD: @contributor
[Summary of contribution or concern raised]

### YYYY-MM-DD: @reviewer
[Feedback or questions]

---

## Resolution

**Status:** Pending | Voting | Decided

**Decision:** [Which thesis was selected, if resolved]

**Rationale:** [Why this thesis was chosen over alternatives]

**Produces:**
- [ ] ADR-NNN: [Decision record to create]
- [ ] Unblocks: AIDE-NNNN, AIDE-NNNN

**Decided by:** @decider
**Date:** YYYY-MM-DD

---

## Complexity Score

| Factor | Score (0-3) | Notes |
|--------|-------------|-------|
| Alternative Count | | |
| Trade-off Severity | | |
| Stakeholder Disagreement | | |
| Precedent Setting | | |
| Knowledge Gap | | |
| Time Horizon | | |
| **Total** | /18 | |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | YYYY-MM-DD | @author | Initial draft |
