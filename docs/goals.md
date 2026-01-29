# adrAI Goals & Objectives

> **Version:** 1.0
> **Last Updated:** 2026-01-29
> **Owner:** @sprantic
> **Related:** [Vision](vision.md)

---

## Goals Overview

adrAI aims to structure the validation process in AI-assisted engineering through five strategic goals: review-triggered debates, artifact lineage, dependency mesh management, AI-aided review, and personal annotations.

---

## Strategic Goals

### Goal 1: Review-Triggered Debates with 7-Gate Criteria

**Description:** Establish clear criteria for when a review should spawn a formal debate, preventing both under-deliberation (missing important discussions) and over-deliberation (debating trivial changes).

**Why it matters:** Without clear triggers, teams either debate everything (slow) or nothing (risky). The 7-gate flow provides objective escalation criteria.

**Success Criteria:**
- [x] 7-gate decision flow documented and operational
- [x] Complexity scoring system (0-18 scale) defined
- [ ] Team trained on when to escalate vs. approve directly
- [ ] >90% of debates trace to specific gate trigger

**Key Results:**

| Key Result | Baseline | Target | Due Date |
|------------|----------|--------|----------|
| Gates documented | 0 | 7 | 2026-01-29 |
| Debates with explicit trigger | 0% | 90% | 2026-Q2 |

---

### Goal 2: Artifact Lineage Tracking ("Why Does This Exist?")

**Description:** Every artifact (debate, ADR, plan, code) declares its scope level, parent, and purpose, answering "why does this exist?" at a glance.

**Why it matters:** Repositories accumulate artifacts. Without lineage, newcomers can't distinguish critical from obsolete, and decisions lose their context.

**Success Criteria:**
- [x] 6-level scope taxonomy defined (REQ[uirement]→CON[cept]→ARC[hitecture]→DES[ign]→IMP[lementation]→VER[ification])
- [x] Lineage header block template created
- [ ] All new artifacts include lineage section
- [ ] Importance scoring implemented (blocking count + staleness + attention)

**Key Results:**

| Key Result | Baseline | Target | Due Date |
|------------|----------|--------|----------|
| Taxonomy defined | 0 levels | 6 levels | 2026-01-29 |
| Artifacts with lineage | 0% | 100% new | 2026-Q2 |

---

### Goal 3: Dependency Mesh Management

**Description:** Track and visualize blocking relationships between debates, plans, and ADRs. Enable critical path analysis, impact assessment, and cycle detection.

**Why it matters:** Hidden dependencies cause surprises. Making the mesh explicit enables rational prioritization and prevents circular deadlocks.

**Success Criteria:**
- [x] `.deb-graph.yaml` schema defined
- [x] 6 core operations specified (critical path, impact, resolution order, cycles, staleness, what-if)
- [ ] CLI tooling for mesh queries
- [ ] Mermaid visualization auto-generated
- [ ] Staleness notifications implemented

**Key Results:**

| Key Result | Baseline | Target | Due Date |
|------------|----------|--------|----------|
| Graph operations defined | 0 | 6 | 2026-01-29 |
| Blocking relationships explicit | 0% | 100% | 2026-Q2 |

---

### Goal 4: AI-Aided Review Assistance

**Description:** AI helps humans validate AI-generated content efficiently through on-demand summarization, gap detection, consistency checking, and impact analysis.

**Why it matters:** The core tension is AI creates fast, humans validate slow. AI-aided review accelerates validation without replacing human judgment.

**Success Criteria:**
- [ ] `review-assist` skill: On-demand help during review
- [ ] `debate-summarize` skill: Current state for busy reviewers
- [ ] `debate-analyze` skill: Gap and inconsistency detection
- [ ] Cross-debate consistency checking
- [ ] Clear AI boundaries enforced (assists, never decides)

**Key Results:**

| Key Result | Baseline | Target | Due Date |
|------------|----------|--------|----------|
| AI skills implemented | 0 | 4 | 2026-Q2 |
| Review time reduction | baseline | 50% | 2026-Q3 |

---

### Goal 5: Personal Annotation System (VS Code Extension)

**Description:** Lightweight personal note-taking during review, with promotion path to formal debates when discussion is warranted.

**Why it matters:** Formal debates have friction. Personal annotations allow capturing thoughts immediately, with selective escalation.

**Success Criteria:**
- [x] VS Code extension created (`tools/adrai-review-notes/`)
- [x] 5 note types (question, uncertainty, concern, bookmark, pre-debate)
- [x] Multi-location linking implemented
- [x] Personal storage in `~/.adts/review-notes.yaml`
- [x] Promotion workflow to create `DEB-NNNN`
- [x] Documentation in `docs/debates/review-workflow.md`

**Key Results:**

| Key Result | Baseline | Target | Due Date |
|------------|----------|--------|----------|
| Extension features | 0 | 7 commands | 2026-01-29 |
| Adoption | 0 | Active use | 2026-Q1 |

---

## Objectives Breakdown

### Objective Matrix

| ID | Objective | Parent Goal | Priority | Status | Due |
|----|-----------|-------------|----------|--------|-----|
| OBJ-001 | Document 7-gate flow | Goal 1 | High | Complete | 2026-01-29 |
| OBJ-002 | Define scope taxonomy | Goal 2 | High | Complete | 2026-01-29 |
| OBJ-003 | Create graph schema | Goal 3 | High | Complete | 2026-01-29 |
| OBJ-004 | Build VS Code extension | Goal 5 | High | Complete | 2026-01-29 |
| OBJ-005 | Implement review-assist skill | Goal 4 | High | Not Started | 2026-Q2 |
| OBJ-006 | Build mesh query CLI | Goal 3 | Medium | Not Started | 2026-Q2 |
| OBJ-007 | Auto-generate Mermaid diagrams | Goal 3 | Medium | Not Started | 2026-Q2 |
| OBJ-008 | Implement AI review skills | Goal 4 | High | Not Started | 2026-Q2 |

---

## Milestones

| Milestone | Description | Target Date | Status |
|-----------|-------------|-------------|--------|
| M1: Foundation | Debates, templates, tracker, documentation | 2026-01-29 | Complete |
| M2: Annotation System | VS Code extension for personal notes | 2026-01-29 | Complete |
| M3: Review Integration | Connect debates to AIDE ceremonies | 2026-Q2 | Not Started |
| M4: AI-Aided Review | Implement AI assistance skills | 2026-Q2 | Not Started |
| M5: Automation | CI integration, notifications, tooling | 2026-Q3 | Not Started |

---

## Non-Goals

- **Not a goal:** Replacing human decision-making — AI assists, never decides
- **Not a goal:** Real-time collaboration — async-first, repo-based design
- **Not a goal:** External tool sync — focus on repo-native experience
- **Not a goal:** Cross-repository debates — single repo scope for now

---

## Dependencies & Assumptions

### External Dependencies

| Dependency | Owner | Status | Risk if Delayed |
|------------|-------|--------|-----------------|
| VS Code Extension API | Microsoft | Stable | High |
| Argdown syntax | argdown.org | Stable | Low |

### Assumptions

| Assumption | Impact if Wrong | Mitigation |
|------------|-----------------|------------|
| Teams will adopt debate workflow | No structured validation | Training, gradual rollout |
| YAML scales for dependency mesh | Performance issues | Consider SQLite if needed |
| Personal notes sufficient | Need shared notes | Can add team storage later |

---

## Progress Tracking

### Objectives → AIDE Plans Mapping

| Objective | AIDE Plans | Status |
|-----------|------------|--------|
| OBJ-004 | AIDE-0001 | Complete |
| OBJ-005 | [Pending] | Not Started |
| OBJ-006 | [Pending] | Not Started |

### Goals Progress Summary

| Goal | Objectives Complete | Key Results On Track |
|------|---------------------|----------------------|
| Goal 1: Review-Triggered Debates | 1/1 | 1/2 |
| Goal 2: Artifact Lineage | 1/1 | 1/2 |
| Goal 3: Dependency Mesh | 1/2 | 1/2 |
| Goal 4: AI-Aided Review | 0/2 | 0/2 |
| Goal 5: Personal Annotations | 1/1 | 2/2 |

---

## Related Documents

- [Vision](vision.md)
- [Constraints](constraints.md)
- [Architecture Overview](software-architecture/overview.md)
- [AIDE Plans](../plans/)
- [adrAI Specification](adrAI-AIDE-Debate-Tracking-System.md)

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-29 | @sprantic | Initial goals document |
