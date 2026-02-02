# adrai Workflows

> Team rituals and AI assistance patterns for AI-first development.

Based on TOSD + AIDE methodology.

---

## Overview

```
List of Items → Conceptualization → OK Point → Realization → Done Point → Completion
```

**Core principle:** AI creates fast, humans validate slow. Structure the validation process efficiently through a single MR workflow with clear phases.

**AI role:** AI prepares. Humans decide.

---

## The Development Flow

### List of Items

Business requirements waiting to be worked on.

| Aspect | Description |
|--------|-------------|
| **Size** | Max ~100 items that need to get done |
| **Ownership** | Belongs to business, may change |
| **Locking** | Items locked once in progress |
| **Updates** | Changes create new items (notify current workers) |
| **Completion** | List ends when everything is implemented |

**AI Contribution:** None (business domain)

---

### Conceptualization

The Conceptualizer takes items from the list and creates concepts up to the **OK Point**.

**Duration:** 20-30 minutes minimum, 1 day maximum

**Activities:**
- Create clear concept that can be developed
- Resolve dependencies by talking to other conceptualizers
- Coordinate with realizers on who is free/competent
- May include sample code or similar

**No backlogs** - work must flow. If concepts stack, capacity needs to increase.

**AI Contribution:** Draft concepts, research alternatives, suggest approaches

**Save the Concept:**
```bash
# 1. Create Jira ticket to get ID
# 2. Create branch
git checkout -b concept/CIPRENGTL-{ticketNr}

# 3. Create/review plan, commit, push
git add . && git commit -m "chore(CIPRENGTL-{ID}): Add concept"
git push -u origin concept/CIPRENGTL-{ticketNr}

# 4. Create MR as DRAFT
```

---

### OK Point

The concept must be clear enough to be realized in **1-3 days max**.

**AI Contribution:** Prepare debate content if issues arise, draft ADRs

#### Variant: Asynchronous

```
Realizer reviews concept
        │
        ▼
Questions? → Talk with conceptualizer
        │
        ▼
Issues? → Create debate (may involve third party)
        │
        ▼
Debate produces ADR
        │
        ▼
Concept may be adopted in the process
```

**Create Debate:** Structured documents stored in repo. Inform about current tension points.

**Create ADR:** Standing decisions as a result of debates, stored in repo. Act as future guidelines.

#### Using the Review Notes Extension

During OK Point review, use the VS Code extension to capture observations:

1. **Ctrl+Shift+N** at any code location to add a note
2. Extension auto-detects note type from punctuation:
   - `?` → question
   - `!` → concern
   - `!!` → pre-debate (highest urgency)
3. For each note, apply **3-Gate criteria** (see "When to Escalate to Debate" below)
4. If any gate triggers → Set status to `promote`
5. Use **"Promote to Debate"** command → Creates DEB-NNNN with your context

See [tools/adrai-review-notes/](../tools/adrai-review-notes/) for full extension documentation.

#### Variant: Synchronous

- Realizer and Conceptualizer walk through concept together
- Smaller issues saved on the spot
- If Realizer does not accept, concept goes back to rework
- Concept may be adopted in the process

**Update the Concept:**
```bash
# Commit onto concept branch
git add . && git commit -m "chore(CIPRENGTL-{ID}): Update concept"
git push

# MR implicitly has the updated version
```

*Note: With practice, the OK point should be reachable in the first session.*

---

### Realization

The Realizer takes over the concept and implements it.

**AI Contribution:** Generate failing tests → Generate code → Review assistance

**TDD Test Order:**
```
1. Generate tests that FAIL
2. Generate code with AI
3. Review code
4. Run all tests which need to PASS
```

**Save the Realization:**
```bash
# Commit and push
git add . && git commit -m "feat(CIPRENGTL-{ID}): Implement feature"
git push

# Mark MR as READY
```

---

### Done Point

**AI Contribution:** Batch-fix review comments, explain decisions

```
Peers walk through code together
        │
        ▼
Smaller issues? → Save on the spot
        │
        ▼
Reviewer does not accept? → Goes back to rework
        │
        ▼
Concept may be adopted in the process
```

*Note: With practice, the done point should be reachable in the first session.*

---

### Completion

**AI Contribution:** None (human approval)

```bash
# Merge to develop when complete, squash all commits
git merge --squash
```

---

## Approval Gates

| Gate | Approver | Auto/Manual |
|------|----------|-------------|
| Concept Review (OK Point) | Realizer | Manual |
| Code Review (Done Point) | Peer | Manual |
| Deploy to dev | CI | Auto |
| Deploy to qa | CI | Auto |
| Deploy to prod | Architect/PO | Manual |
| Hotfix | Architect | Manual |

---

## MR Conventions

### Title Format

```
{type}(CIPRENGTL-{JiraID}): {Short Title}
```

**Allowed types:**
| Type | When to Use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Maintenance, dependencies |
| `refactor` | Code restructuring without behavior change |

**Examples:**
- `feat(CIPRENGTL-1234): Add user authentication`
- `fix(CIPRENGTL-5678): Handle null response from API`
- `refactor(CIPRENGTL-9012): Extract validation logic`

### Description Template

```markdown
## Summary
[What this change does and why]

## Technical Changes
- [Change 1]
- [Change 2]

## Testing
- [ ] Tests fail before implementation
- [ ] Tests pass after implementation
- [ ] Manual verification complete

## Breaking Changes
[None / Description of breaking changes]

## Related
- Jira: CIPRENGTL-{ID}
- Depends on: MR !{number} (if any)
```

### Commit Strategy

**Always squash commits** when merging to preserve readability of develop and main branches.

---

## When to Escalate to Debate

Create a debate when **any** apply:

| Gate | Question |
|------|----------|
| 1 | **Disagreement** - Can't resolve in MR comments? |
| 2 | **Irreversible** - Hard to undo later? |
| 3 | **Uncertainty** - Anyone flags "not sure"? |

**If NO:** Standard MR review.
**If ANY:** Create DEB-NNNN before proceeding.

### MR Comment Escalation

When MR comments become extended discussion:

| Signal | Action |
|--------|--------|
| > 5 back-and-forth replies | Consider escalating to debate |
| > 3 days unresolved | Stale discussion - debate or close |
| "I disagree because..." | Structured disagreement → debate |
| Any participant requests | Immediate escalation |

### Escalation Flow

```
MR Comment Thread (getting long)
            │
            ▼
  "This needs a debate"
            │
            ▼
  Create DEB-NNNN (linked to MR)
            │
            ▼
  MR thread: "Discussion moved to DEB-NNNN"
            │
            ▼
  Debate resolves with decision
            │
            ▼
  MR unblocked, references resolution
```

---

## AI Assistance

### Tools

**Roo (AI Code Assistant)**

Roo is the primary AI assistant for code generation and MR review.

**Key learning:** Tell Roo which commit you started with when requesting MR review.

```
Review this MR starting from commit abc123.
Improve and refactor the newly created code.
```

**What Roo does:**
- Analyzes changes since the specified commit
- Suggests improvements and refactoring
- Generates fixes for identified issues
- Explains design decisions when questioned

**GitLab Workflow VSCode Extension**

Use the GitLab Workflow extension for review management:

| Feature | Purpose |
|---------|---------|
| Issues view | See issues created by you |
| MRs (created) | Track your open MRs |
| MRs (assigned) | MRs assigned for your review |
| MRs (reviewing) | MRs you're actively reviewing |
| Branch pipelines | Monitor CI status |
| TODO tracking | Track review comments as TODOs |

**Installation:**
1. Open VSCode Extensions (Ctrl+Shift+X)
2. Search "GitLab Workflow"
3. Install and configure with GitLab token

---

### AI in Realization (TDD)

The realization phase follows strict TDD ordering:

```
1. Generate tests that FAIL
2. Generate code with AI
3. Review code
4. Run all tests which need to PASS
```

**Roo CAN**

| Capability | Description |
|------------|-------------|
| **Generate failing tests first** | Write test cases that fail before implementation |
| **Generate code from plan** | Follow AIDE plans |
| **Respond to review notes** | Fix issues flagged in MR comments |
| **Batch-fix** | Address multiple review comments in one pass |
| **Explain decisions** | Clarify design choices when questioned |
| **Flag uncertainty** | Mark areas needing human review |
| **Refactor** | Improve code structure on request |

**Roo CANNOT**

| Boundary | Why |
|----------|-----|
| **Merge MRs** | Final merge is human decision |
| **Override review comments** | Human feedback must be addressed |
| **Dismiss blocking issues** | Blocking issues require human resolution |
| **Skip the test-first step** | TDD requires tests fail before code |

---

### AI in MR Review

**The Review-Fix Workflow**

```
1. Developer creates Draft MR
   - Concept committed
   - Tests generated (failing)
   - Code generated by Roo
   - Tests passing

2. Reviewer adds comments
   - In GitLab MR interface
   - Or via GitLab Workflow extension TODOs

3. Developer asks Roo to address feedback
   "Starting from commit abc123, address these review comments:
   - [Comment 1]
   - [Comment 2]"

4. Roo generates fixes
   - Implements changes
   - Explains approach if needed
   - Flags if uncertain

5. Reviewer re-reviews
   - Verifies fixes address concerns
   - Approves or adds more comments

6. Iterate until approved
   - Mark MR as Ready
   - Squash and merge
```

**Example Roo Interactions**

*Addressing review feedback:*
```
Human: "The error handling here swallows the stack trace"

Roo: "Fixed - now preserving stack trace in error log.
     See lines 42-45. Also updated test coverage."
```

*Explaining design choices:*
```
Human: "Why are we using library X instead of Y?"

Roo: "Library X was chosen for performance reasons.
     Benchmark: X is 3x faster for our use case.
     However, Y has better TypeScript support.
     Should I escalate this to a debate?"
```

*Flagging uncertainty:*
```
Roo: "I'm uncertain about the correct error code here.
     HTTP 400 vs 422 depends on API contract conventions.
     Flagging for human decision."
```

---

### AI in Debates

When issues arise at the OK Point, AI helps prepare debates.

**Roo CAN**

| Capability | Description |
|------------|-------------|
| **Prepare debates** | Gather evidence, structure options, draft content |
| **Research alternatives** | Find industry practices, prior art, trade-offs |
| **Summarize discussions** | Create digestible summaries |
| **Analyze arguments** | Find gaps, inconsistencies |
| **Model consequences** | "If we choose A, then X follows..." |
| **Draft ADRs** | Create decision records from resolutions |
| **Recommend** | Propose decision with reasoning (labeled as AI suggestion) |

**Roo CANNOT**

| Boundary | Why |
|----------|-----|
| **Cast votes** | Voting is human accountability |
| **Make final decisions** | Resolution requires human authority |
| **Override human positions** | Can argue, cannot overrule |
| **Close debates** | Closure requires human approval |

---

### AI Escalation Guidelines

**When AI Should Escalate**

| Situation | AI Action |
|-----------|-----------|
| Two humans disagree in MR comments | Escalate - trigger debate |
| Uncertainty about correct approach | Flag - request guidance |
| Security/compliance implications | Flag - require human review |
| First use of a pattern | Flag - may need ADR |
| > 5 back-and-forth MR comments | Suggest debate escalation |

**When AI Should Proceed**

| Situation | AI Action |
|-----------|-----------|
| Clear bug fix | Implement fix |
| Follows standing decision | Proceed without debate |
| Style/formatting issue | Fix automatically |
| Missing test coverage | Add tests (failing first) |
| Documentation gap | Fill documentation |
| Explicit human instruction | Execute as directed |

---

### Trust Calibration

AI autonomy increases as trust is established:

| Phase | Roo Behavior | Human Involvement |
|-------|-------------|-------------------|
| **New** | Generate, wait for approval | Full review |
| **Learning** | Generate, flag uncertain areas | Focused review |
| **Established** | Generate routine, escalate exceptions | Exception-based |
| **Trusted** | Generate and commit, human audits | Periodic audit |

**Trust increases when:**
- Roo fixes match human intent
- Escalations are appropriate
- Standing decisions followed
- Uncertainty flagged correctly
- TDD order maintained

**Trust decreases when:**
- Roo overrides feedback
- Escalations inappropriate
- Patterns violated
- Uncertainty hidden
- Tests written after code

---

## Quick Reference

### Starting New Work (Conceptualization)

```bash
# 1. Create Jira ticket, get ID (e.g., CIPRENGTL-1234)

# 2. Create branch
git checkout -b concept/CIPRENGTL-1234

# 3. Create concept, commit
# ... write concept.md ...
git add . && git commit -m "chore(CIPRENGTL-1234): Add concept"
git push -u origin concept/CIPRENGTL-1234

# 4. Create Draft MR in GitLab
```

### After OK Point (Realization)

```bash
# 1. Generate tests that FAIL
bun test  # Should fail

# 2. Generate code with AI

# 3. Review code

# 4. Run all tests which need to PASS
bun test  # Should pass

# 5. Commit and push
git add . && git commit -m "feat(CIPRENGTL-1234): Implement feature"
git push

# 6. Mark MR as Ready in GitLab
```

### After Done Point (Completion)

```bash
# Squash and merge to develop
```

### Common Roo Commands

```
# Generate concept
Generate a concept for CIPRENGTL-{ID}.

# Generate failing tests
Generate tests for CIPRENGTL-{ID} that verify the expected behavior.
Tests should fail until implementation is complete.

# Generate code from concept
Implement the concept for CIPRENGTL-{ID}.
Tests should pass after implementation.

# Review MR
Review this MR starting from commit {hash}.
Improve and refactor the newly created code.

# Address feedback
Address these review comments starting from commit {hash}:
- [comment 1]
- [comment 2]

# Explain decision
Explain why you chose [approach] in [file:line].

# Prepare debate
Prepare a debate for: [question].
Use the ai-prepared-debate template.
```

### AI Handles Automatically

- Bug fixes (when clear)
- Test generation (failing first)
- Code generation (after tests)
- Documentation updates
- Style fixes
- Standing decision patterns

### AI Requires Human Input

- Design choices between alternatives
- Trade-offs with organizational impact
- Security-sensitive decisions
- First-time patterns
- Any disagreement
- OK Point approval
- Done Point approval

### AI Never Does

- Final approval/merge
- Voting in debates
- Overriding human feedback
- Closing debates
- Ignoring blocking issues
- Merging without squash
- Writing tests after code (violates TDD)

---

## Related Documents

- [Debates](debates/README.md) - Debate quick reference
- [AI Debate Template](debates/templates/ai-prepared-debate.md) - AI debate template
- [Foundations](FOUNDATIONS.md) - Vision, goals, constraints

---

[← Debates](debates/README.md) | [Foundations →](FOUNDATIONS.md)
