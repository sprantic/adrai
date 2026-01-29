# Debate Template

Copy this template for new debates. Save as `docs/debates/DEB-0001-topic-name.deb.md`.

---

```markdown
# DEB-0001: this is weird

> **Status:** Draft | Active | Blocked | Deciding | Resolved | Superseded
> **Owner:** @your-name
> **Created:** 2026-01-29
> **Updated:** 2026-01-29
> **Priority:** 1 (Urgent) | 2 (High) | 3 (Normal) | 4 (Low)

---

## Lineage

| Field | Value |
|-------|-------|
| **Scope** | CON (Concept) |
| **Parent** | [REQ-NNN](link) or [OBJ-NNN](link) |
| **Purpose** | [Why does this debate exist? What decision does it enable?] |
| **Supersedes** | None | DEB-0001 |
| **Blocked By** | None | DEB-0001 |

---

## Dependencies

> **Depends On:** DEB-0001, ADR-NNN (list debates/decisions this waits for)
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

this is weird: What is the core question we need to answer?

<!--
Argdown syntax: The central question is enclosed in square brackets.
This should be specific, answerable, and directly related to a decision.
-->

---

### Context from Review Note

- docs/adrAI-AIDE-Debate-Tracking-System.md:9
  > AI-assisted engineering has dramatically increased development velocity, but hum...


## Theses

### Thesis A: [Option Name]

<!--
Argdown uses indentation and +/- prefixes:
+ means supporting claim (pro)
- means opposing claim (con)
<angle brackets> denote objections
Nested indentation shows claim hierarchy
-->

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

### 2026-01-29: @contributor
[Summary of contribution or concern raised]

### 2026-01-29: @reviewer
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
**Date:** 2026-01-29

---

## Complexity Score

<!--
Score each factor 0-3, sum for total (0-18 scale).
Score >= 10 confirms debate was warranted.
-->

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
| 1.0 | 2026-01-29 | @author | Initial draft |
```

---

## Usage Notes

### When to Create a Debate

Use the 7-Gate Decision Flow:
1. **Critical file patterns** touched (auth/*, security/*)
2. **Risk Level Critical** in AIDE plan
3. **Stakeholder disagreement** expressed
4. **Precedent-setting** decision
5. **Irreversible** change
6. **Complexity score >= 10**
7. **Author flags uncertainty**

If ANY gate triggers → Create debate

### Argdown Syntax Quick Reference

```argdown
this is weird: The main question being debated

<[Thesis A]>: A proposed answer (angle brackets = thesis)

+ [Claim]: Supporting argument (+ prefix)
  + [Sub-claim]: Nested support
  - <Objection>: Counter-argument (angle brackets = objection)
    + [Response]: Rebuttal to objection

- [Weakness]: Acknowledged limitation (- prefix)
```

### Status Lifecycle

```
DRAFT → ACTIVE → BLOCKED/DECIDING → RESOLVED
                        ↓
                   SUPERSEDED
```

| Status | Description |
|--------|-------------|
| Draft | Owner structuring question and theses |
| Active | Team contributing arguments and evidence |
| Blocked | Waiting on dependent debate to resolve |
| Deciding | Voting period, no new arguments |
| Resolved | Decision made, produces ADR |
| Superseded | Replaced by newer debate |

### Linking to Plans and ADRs

```markdown
# In the debate:
> **Blocks:** AIDE-0145

# In the AIDE plan:
> **Blocked by:** DEB-0042

# After resolution, in ADR:
> **Resolved by:** DEB-0042
```

---

[← Debates README](../README.md) | [Argdown Guide →](../argdown-guide.md)
