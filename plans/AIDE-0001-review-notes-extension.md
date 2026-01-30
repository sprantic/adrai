# AIDE-0001: Review Notes VS Code Extension

> **Status:** Complete
> **Author:** @sprantic
> **Created:** 2026-01-29
> **AIDE ID:** AIDE-0001
> **Risk Level:** Medium
> **Blocked by:** None

---

## Summary

Personal annotation layer for adrai artifact review. A VS Code extension that allows capturing review notes during code/plan review, with ability to promote notes to formal debates when discussion is warranted.

---

## Context

### Problem Statement

During AI-assisted development, humans need to validate AI-generated artifacts (plans, code, decisions). Currently there's no lightweight way to:
- Capture thoughts during review before formalizing
- Link observations to multiple file locations
- Escalate important observations to formal debates

### Current State

The adrai debate system requires formal `DEB-NNNN` artifacts. This creates friction for capturing initial observations that may or may not warrant full debate.

### Related Work

- adrai Conceptual Overview: [docs/adrai-conceptual-overview.md](../docs/adrai-conceptual-overview.md)
- Debate System: [docs/debates/README.md](../docs/debates/README.md)

---

## Proposed Changes

### Overview

VS Code extension providing:
1. Sidebar panel for note management
2. Commands for adding/editing notes
3. Multi-location linking (one note → multiple files)
4. Personal storage in `~/.adrai/review-notes.yaml` (gitignored)
5. Promotion workflow to create `DEB-NNNN` from notes

### Files Created

| File | Description |
|------|-------------|
| `tools/adrai-review-notes/package.json` | Extension manifest with commands, keybindings, configuration |
| `tools/adrai-review-notes/src/extension.ts` | Main extension entry point |
| `tools/adrai-review-notes/src/noteStorage.ts` | YAML-based note persistence |
| `tools/adrai-review-notes/src/noteTreeProvider.ts` | Sidebar tree view |
| `tools/adrai-review-notes/src/debatePromoter.ts` | Note → Debate promotion |
| `tools/adrai-review-notes/src/types.ts` | TypeScript interfaces |
| `docs/debates/review-workflow.md` | Workflow documentation |

### Features Implemented

**Commands:**
- `adrai.addNote` (Ctrl+Shift+N): Add note at cursor
- `adrai.addLocation` (Ctrl+Shift+L): Add location to existing note
- `adrai.showPanel` (Ctrl+Shift+R): Toggle sidebar panel
- `adrai.promoteToDebate`: Convert note to formal debate
- `adrai.resolveNote`: Mark note as resolved
- `adrai.editNote`: Edit note content
- `adrai.deleteNote`: Remove note

**Note Types:**
- `question`: Uncertainty about intent or correctness
- `uncertainty`: Not sure if this is right
- `concern`: Potential issue that needs attention
- `bookmark`: Reference point for later
- `pre-debate`: Candidate for formal debate

**Storage:**
- Location: `~/.adrai/review-notes.yaml`
- Format: YAML with note objects containing locations array
- Personal: Gitignored, not shared with team

---

## Test Scenarios

### Scenario 1: Add Note at Cursor

```gherkin
Given an open file in VS Code
When I press Ctrl+Shift+N at line 42
Then a note creation dialog appears
And I can enter note text and select type
And the note is saved with file location
```

### Scenario 2: Multi-Location Note

```gherkin
Given an existing note about "authentication flow"
When I press Ctrl+Shift+L in a different file
Then the current location is added to the note
And the note now shows 2+ locations in sidebar
```

### Scenario 3: Promote to Debate

```gherkin
Given a note with type "pre-debate"
When I right-click and select "Promote to Debate"
Then a new DEB-NNNN file is created from template
And the note content populates the debate question
And the note is marked as promoted
```

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| YAML corruption | Low | Medium | Backup before write, atomic save |
| Path handling cross-platform | Medium | Low | Use VS Code URI APIs |
| Large note files | Low | Low | YAML handles well, consider pagination later |

---

## Out of Scope

- Team-shared notes (personal only)
- Real-time sync between machines
- Integration with external tools
- Custom note types (fixed set of 5)

---

## Dependencies

- [x] VS Code Extension API v1.85+
- [x] yaml package for persistence
- [x] uuid package for note IDs
- [x] Debate template exists at `docs/debates/templates/debate-template.md`

---

## Verification

- [x] Extension activates on VS Code startup
- [x] Sidebar panel shows in activity bar
- [x] Add note command works (Ctrl+Shift+N)
- [x] Notes persist across sessions
- [x] Notes grouped by status/type in sidebar
- [x] Promote to debate creates valid DEB file
- [x] Documentation complete in review-workflow.md

---

## Approval

**Approver:** @sprantic
**Approval Date:** 2026-01-29
**Comments:** Retroactively documented after implementation complete.

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-29 | @sprantic | Retroactive documentation of completed work |
