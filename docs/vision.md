# adrai Vision

> **Version:** 1.0
> **Last Updated:** 2026-01-29
> **Owner:** @sprantic

---

## Purpose

adrai is the AIDE Review Lifecycle Management System. It exists to structure the validation bottleneck in AI-assisted engineering, where AI creates fast but humans validate slow.

---

## Vision Statement

In 12-18 months, adrai will be the standard approach for managing complex decisions in AI-assisted engineering projects. Development teams will use structured debates to validate AI output efficiently, maintain decision traceability, and accelerate consensus without sacrificing quality. The friction between AI velocity and human validation will be resolved through AI-aided review assistance.

---

## Problem Statement

### Current State

AI-assisted engineering has dramatically increased development velocity, but human review processes haven't kept pace.

- AI generates plans, code, and decisions faster than humans can validate
- Multiple parallel architecture debates happen simultaneously with no structure
- Dependencies between decisions create an invisible mesh
- Single-person reviews are insufficient for complex systems
- ADRs capture decisions but not the reasoning journey
- AI cannot effectively help humans review AI output

### Impact of the Problem

| Stakeholder | Impact |
|-------------|--------|
| Engineers | Overwhelmed by review load, context-switching between debates |
| Architects | Cannot track decision dependencies, miss conflicts |
| Product Managers | Blocked features with unclear blocking reasons |
| Team | Decisions made without proper deliberation, later regret |

---

## Target Audience

### Primary Users

| User Type | Needs | Current Alternative |
|-----------|-------|---------------------|
| Engineers doing code review | Capture observations, escalate concerns | Inline comments, Slack threads |
| Architects validating plans | Track decision dependencies, ensure consistency | Spreadsheets, memory |
| Tech Leads resolving conflicts | Structured argumentation, clear resolution path | Meetings, email chains |

### Secondary Stakeholders

- Product Managers: Visibility into what's blocking features
- New team members: Decision history for onboarding
- Future maintainers: "Why does this exist?" answered

---

## Value Proposition

### For Engineers Reviewing AI Output

For those who spend significant time validating AI-generated artifacts,
adrai provides structured capture and escalation of review observations.
That reduces cognitive load and ensures important concerns aren't lost.

### Key Benefits

| Benefit | Current State | Future State |
|---------|---------------|--------------|
| Decision traceability | ADRs without reasoning | Full debate → ADR → implementation chain |
| Review efficiency | Repeated context rebuilding | AI-assisted review with gap detection |
| Dependency visibility | Hidden in people's heads | Explicit mesh with critical path |
| Validation throughput | Bottleneck on humans | AI helps humans validate faster |

---

## Scope Boundaries

### In Scope

- Review-triggered debate system for complex decisions
- Artifact lineage tracking ("why does this exist?")
- Dependency mesh management between debates/plans/ADRs
- AI-aided review assistance (summarize, analyze, flag issues)
- Personal annotation system (VS Code extension)
- Integration with AIDE methodology (plans, ADRs, LINK IDs)

### Out of Scope

- Replacing human decision-making (AI assists, never decides)
- Real-time collaboration (async-first, repo-based)
- External tool integrations (Jira, Linear) - future consideration
- Cross-team debate coordination - future consideration
- Automated debate resolution - explicitly forbidden

---

## Success Indicators

| Indicator | Baseline | Target | Timeframe |
|-----------|----------|--------|-----------|
| Question-to-resolution time | Days to weeks | 50% reduction | 6 months |
| Decision traceability | ~30% linked | 100% debates linked to ADR/Plan | 3 months |
| Stakeholder participation | Variable | >80% relevant stakeholders | 6 months |
| Decision revisit rate | Unknown | <10% decisions superseded | 12 months |

---

## Related Documents

- [adrai Specification](adrai-conceptual-overview.md)
- [Goals & Objectives](goals.md)
- [Architecture Overview](software-architecture/overview.md)
- [ADRs](adr/README.md)

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-29 | @sprantic | Initial vision document |
