# adrai Foundations

> Why adrai exists, what it aims to achieve, and the boundaries it operates within.

**Version:** 1.0
**Last Updated:** 2026-01-29
**Owner:** @sprantic

---

## Vision

### Purpose

adrai is the AIDE Review Lifecycle Management System. It exists to structure the validation bottleneck in AI-assisted engineering, where AI creates fast but humans validate slow.

### Vision Statement

In 12-18 months, adrai will be the standard approach for managing complex decisions in AI-assisted engineering projects. Development teams will use structured debates to validate AI output efficiently, maintain decision traceability, and accelerate consensus without sacrificing quality. The friction between AI velocity and human validation will be resolved through AI-aided review assistance.

### Problem Statement

**Current State**

AI-assisted engineering has dramatically increased development velocity, but human review processes haven't kept pace.

- AI generates plans, code, and decisions faster than humans can validate
- Multiple parallel architecture debates happen simultaneously with no structure
- Dependencies between decisions create an invisible mesh
- Single-person reviews are insufficient for complex systems
- ADRs capture decisions but not the reasoning journey
- AI cannot effectively help humans review AI output

**Impact of the Problem**

| Stakeholder | Impact |
|-------------|--------|
| Engineers | Overwhelmed by review load, context-switching between debates |
| Architects | Cannot track decision dependencies, miss conflicts |
| Product Managers | Blocked features with unclear blocking reasons |
| Team | Decisions made without proper deliberation, later regret |

### Target Audience

**Primary Users**

| User Type | Needs | Current Alternative |
|-----------|-------|---------------------|
| Engineers doing code review | Capture observations, escalate concerns | Inline comments, Slack threads |
| Architects validating plans | Track decision dependencies, ensure consistency | Spreadsheets, memory |
| Tech Leads resolving conflicts | Structured argumentation, clear resolution path | Meetings, email chains |

**Secondary Stakeholders**

- Product Managers: Visibility into what's blocking features
- New team members: Decision history for onboarding
- Future maintainers: "Why does this exist?" answered

### Value Proposition

**For Engineers Reviewing AI Output**

For those who spend significant time validating AI-generated artifacts,
adrai provides structured capture and escalation of review observations.
That reduces cognitive load and ensures important concerns aren't lost.

**Key Benefits**

| Benefit | Current State | Future State |
|---------|---------------|--------------|
| Decision traceability | ADRs without reasoning | Full debate → ADR → implementation chain |
| Review efficiency | Repeated context rebuilding | AI-assisted review with gap detection |
| Dependency visibility | Hidden in people's heads | Explicit mesh with critical path |
| Validation throughput | Bottleneck on humans | AI helps humans validate faster |

### Scope Boundaries

**In Scope**

- Review-triggered debate system for complex decisions
- Artifact lineage tracking ("why does this exist?")
- Dependency mesh management between debates/plans/ADRs
- AI-aided review assistance (summarize, analyze, flag issues)
- Personal annotation system (VS Code extension)
- Integration with AIDE methodology (plans, ADRs, LINK IDs)

**Out of Scope**

- Replacing human decision-making (AI assists, never decides)
- Real-time collaboration (async-first, repo-based)
- External tool integrations (Jira, Linear) - future consideration
- Cross-team debate coordination - future consideration
- Automated debate resolution - explicitly forbidden

### Success Indicators

| Indicator | Baseline | Target | Timeframe |
|-----------|----------|--------|-----------|
| Question-to-resolution time | Days to weeks | 50% reduction | 6 months |
| Decision traceability | ~30% linked | 100% debates linked to ADR/Plan | 3 months |
| Stakeholder participation | Variable | >80% relevant stakeholders | 6 months |
| Decision revisit rate | Unknown | <10% decisions superseded | 12 months |

---

## Goals

### Goals Overview

adrai aims to structure the validation process in AI-assisted engineering through five strategic goals: review-triggered debates, artifact lineage, dependency mesh management, AI-aided review, and personal annotations.

### Strategic Goals

#### Goal 1: Review-Triggered Debates with Clear Criteria

**Description:** Establish clear criteria for when a review should spawn a formal debate, preventing both under-deliberation (missing important discussions) and over-deliberation (debating trivial changes).

**Why it matters:** Without clear triggers, teams either debate everything (slow) or nothing (risky). The 3-gate flow provides simple escalation criteria.

**Success Criteria:**
- [x] 3-gate decision flow documented and operational
- [ ] Team trained on when to escalate vs. approve directly
- [ ] >90% of debates trace to specific gate trigger

**Key Results:**

| Key Result | Baseline | Target | Due Date |
|------------|----------|--------|----------|
| Gates documented | 0 | 7 | 2026-01-29 |
| Debates with explicit trigger | 0% | 90% | 2026-Q2 |

#### Goal 2: Artifact Lineage Tracking ("Why Does This Exist?")

**Description:** Every artifact (debate, ADR, plan, code) declares its scope level, parent, and purpose, answering "why does this exist?" at a glance.

**Why it matters:** Repositories accumulate artifacts. Without lineage, newcomers can't distinguish critical from obsolete, and decisions lose their context.

**Success Criteria:**
- [x] 6-level scope taxonomy defined (REQ→CON→ARC→DES→IMP→VER)
- [x] Lineage header block template created
- [ ] All new artifacts include lineage section
- [ ] Importance scoring implemented (blocking count + staleness + attention)

**Key Results:**

| Key Result | Baseline | Target | Due Date |
|------------|----------|--------|----------|
| Taxonomy defined | 0 levels | 6 levels | 2026-01-29 |
| Artifacts with lineage | 0% | 100% new | 2026-Q2 |

#### Goal 3: Dependency Mesh Management

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

#### Goal 4: AI-Aided Review Assistance

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

#### Goal 5: Personal Annotation System (VS Code Extension)

**Description:** Lightweight personal note-taking during review, with promotion path to formal debates when discussion is warranted.

**Why it matters:** Formal debates have friction. Personal annotations allow capturing thoughts immediately, with selective escalation.

**Success Criteria:**
- [x] VS Code extension created (`tools/adrai-review-notes/`)
- [x] 5 note types (question, uncertainty, concern, bookmark, pre-debate)
- [x] Multi-location linking implemented
- [x] Personal storage in `~/.adrai/review-notes.yaml`
- [x] Promotion workflow to create `DEB-NNNN`
- [x] Documentation complete

**Key Results:**

| Key Result | Baseline | Target | Due Date |
|------------|----------|--------|----------|
| Extension features | 0 | 7 commands | 2026-01-29 |
| Adoption | 0 | Active use | 2026-Q1 |

### Objectives Breakdown

| ID | Objective | Parent Goal | Priority | Status | Due |
|----|-----------|-------------|----------|--------|-----|
| OBJ-001 | Document 3-gate flow | Goal 1 | High | Complete | 2026-01-29 |
| OBJ-002 | Define scope taxonomy | Goal 2 | High | Complete | 2026-01-29 |
| OBJ-003 | Create graph schema | Goal 3 | High | Complete | 2026-01-29 |
| OBJ-004 | Build VS Code extension | Goal 5 | High | Complete | 2026-01-29 |
| OBJ-005 | Implement review-assist skill | Goal 4 | High | Not Started | 2026-Q2 |
| OBJ-006 | Build mesh query CLI | Goal 3 | Medium | Not Started | 2026-Q2 |
| OBJ-007 | Auto-generate Mermaid diagrams | Goal 3 | Medium | Not Started | 2026-Q2 |
| OBJ-008 | Implement AI review skills | Goal 4 | High | Not Started | 2026-Q2 |

### Milestones

| Milestone | Description | Target Date | Status |
|-----------|-------------|-------------|--------|
| M1: Foundation | Debates, templates, tracker, documentation | 2026-01-29 | Complete |
| M2: Annotation System | VS Code extension for personal notes | 2026-01-29 | Complete |
| M3: Review Integration | Connect debates to AIDE ceremonies | 2026-Q2 | Not Started |
| M4: AI-Aided Review | Implement AI assistance skills | 2026-Q2 | Not Started |
| M5: Automation | CI integration, notifications, tooling | 2026-Q3 | Not Started |

### Non-Goals

- **Not a goal:** Replacing human decision-making — AI assists, never decides
- **Not a goal:** Real-time collaboration — async-first, repo-based design
- **Not a goal:** External tool sync — focus on repo-native experience
- **Not a goal:** Cross-repository debates — single repo scope for now

### Dependencies & Assumptions

**External Dependencies**

| Dependency | Owner | Status | Risk if Delayed |
|------------|-------|--------|-----------------|
| VS Code Extension API | Microsoft | Stable | High |
| Argdown syntax | argdown.org | Stable | Low |

**Assumptions**

| Assumption | Impact if Wrong | Mitigation |
|------------|-----------------|------------|
| Teams will adopt debate workflow | No structured validation | Training, gradual rollout |
| YAML scales for dependency mesh | Performance issues | Consider SQLite if needed |
| Personal notes sufficient | Need shared notes | Can add team storage later |

### Progress Tracking

**Objectives → AIDE Plans Mapping**

| Objective | AIDE Plans | Status |
|-----------|------------|--------|
| OBJ-004 | AIDE-0001 | Complete |
| OBJ-005 | [Pending] | Not Started |
| OBJ-006 | [Pending] | Not Started |

**Goals Progress Summary**

| Goal | Objectives Complete | Key Results On Track |
|------|---------------------|----------------------|
| Goal 1: Review-Triggered Debates | 1/1 | 1/2 |
| Goal 2: Artifact Lineage | 1/1 | 1/2 |
| Goal 3: Dependency Mesh | 1/2 | 1/2 |
| Goal 4: AI-Aided Review | 0/2 | 0/2 |
| Goal 5: Personal Annotations | 1/1 | 2/2 |

---

## Constraints

### Purpose

This section defines the constraints and boundaries that all adrai work must respect. These constraints inform plan risk assessment, AI guardrails, architecture decisions, and code review checkpoints.

### Technical Constraints

**Platform & Infrastructure**

| Constraint | Value | Rationale | Flexibility |
|------------|-------|-----------|-------------|
| Primary Language | TypeScript 5.3+ | Type safety for complex data | Fixed |
| Runtime | bun 1.0+ | Fast, native TS support | Negotiable |
| Extension Platform | VS Code 1.85+ | Dominant IDE | Fixed |
| Data Storage | YAML files | Human-readable, git-friendly | Fixed |
| Diagrams | Mermaid | Markdown-native rendering | Negotiable |

**Architecture Patterns**

| Pattern | Requirement | Example |
|---------|-------------|---------|
| Data Storage | Repo-first, no external databases | All artifacts in `docs/` and `plans/` |
| Personal Data | Isolated from repo | `~/.adrai/` for personal notes |
| AI Integration | Read/write text files | AI operates on markdown/YAML directly |
| Version Control | Git-native workflows | Full history for all decisions |

**Service Boundaries**

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

### AI-Specific Constraints

**AI Boundaries**

| Constraint | Rule | Enforcement |
|------------|------|-------------|
| No autonomous decisions | AI assists, never resolves debates | Code review |
| No voting | AI cannot cast votes on debates | Process |
| Human approval required | All promotions/resolutions need human | Extension logic |
| Consistency checking | AI can flag conflicts, not resolve | Skill design |
| Traceability preserved | AI must maintain LINK IDs | Validation |

**AI Capabilities**

| CAN | CANNOT |
|-----|--------|
| Summarize debate state | Vote on theses |
| Identify gaps in reasoning | Add arguments without human review |
| Check cross-debate consistency | Resolve debates |
| Generate draft artifacts | Approve plans |
| Suggest questions to reviewers | Delete or supersede artifacts |

### Data Constraints

**File Formats**

| Data Type | Format | Location |
|-----------|--------|----------|
| Debates | Argdown-compatible Markdown | `docs/debates/*.deb.md` |
| Dependency Graph | YAML | `docs/debates/.deb-graph.yaml` |
| Plans | Markdown | `plans/*.md` |
| ADRs | Markdown | `docs/adr/*.md` |
| Personal Notes | YAML | `~/.adrai/review-notes.yaml` |

**ID Schemes**

| Artifact | Format | Tracker |
|----------|--------|---------|
| Debate | DEB-NNNN (4-digit) | `.deb-tracker.md` |
| Plan | AIDE-NNNN (4-digit) | `.aide-tracker.md` |
| ADR | ADR-NNN (3-digit) | `docs/adr/README.md` |

**Storage Limits**

| Constraint | Limit | Rationale |
|------------|-------|-----------|
| Single debate file | < 100KB | Git performance |
| Graph file | < 1MB | YAML parsing speed |
| Personal notes | < 10MB | Local storage |
| Total debates | < 10,000 | Practical limit |

### Development Constraints

**Code Quality Standards**

| Standard | Requirement | Enforcement |
|----------|-------------|-------------|
| Type safety | Strict TypeScript | `tsconfig.json` |
| Linting | ESLint with TypeScript rules | CI |
| AIDE compliance | LINK IDs in tests and code | Code review |
| Documentation | Public APIs documented | Code review |

**Dependency Rules**

| Rule | Detail |
|------|--------|
| Minimal dependencies | Prefer standard library |
| Security scanning | Review before adding |
| Version pinning | Lock files committed |
| License compliance | MIT, Apache 2.0, BSD only |

**Git Conventions**

| Constraint | Rule |
|------------|------|
| Branch protection | `main` requires PR |
| Commit messages | Include AIDE ID for tracked work |
| No large files | Use `.gitignore` for binaries |
| Personal data | Never commit `~/.adrai/` contents |

### Operational Constraints

**Performance Targets**

| Metric | Target | Rationale |
|--------|--------|-----------|
| Extension activation | < 2s | UX |
| Note creation | < 100ms | UX |
| Graph query | < 500ms | CLI responsiveness |
| Debate promotion | < 1s | Workflow |

**Reliability**

| Aspect | Strategy |
|--------|----------|
| Data durability | Git provides history |
| Conflict resolution | Git merge strategies |
| Backup | Standard repo backup |
| Recovery | Git reflog, branches |

### Process Constraints

**Debate Workflow**

| Constraint | Rule |
|------------|------|
| Minimum deliberation | Active debates need 24h before deciding |
| Stakeholder notification | Tag relevant parties |
| Resolution format | Must produce ADR for significant decisions |
| Archive policy | Resolved > 90 days moved to archive/ |

**Review Triggers**

Create a debate when **any** apply:

1. **Disagreement** - Can't resolve in MR comments
2. **Irreversible** - Hard to undo later
3. **Uncertainty** - Anyone flags "not sure"

### Flexibility Legend

| Symbol | Meaning | Change Process |
|--------|---------|----------------|
| Fixed | Cannot change | ADR + significant justification |
| Negotiable | Can change with justification | ADR |
| Flexible | Team can adjust | Document in plan |

### Constraint Violation Handling

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

- [adrai Conceptual Overview](adrai-concepts/adrai-conceptual-overview.md) - Full technical specification
- [Architecture Overview](adrai-concepts/adrai-software-architecture.md) - System structure
- [ADRs](adr/README.md) - Architecture decisions
- [AIDE Plans](../plans/) - Work plans

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-29 | @sprantic | Initial consolidated document (merged vision, goals, constraints) |
