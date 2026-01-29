# Review Annotation Workflow

How to use personal annotations during artifact review and when to promote them to formal debates.

---

## The Gap: "Notepad in the Corner" Problem

**Problem:** Reviewers have fleeting thoughts during review that don't warrant formal debates:
- Knowledge questions ("what does X mean?")
- Uncertainties ("not sure about this yet, need to read more")
- Bookmarks ("come back to this")
- Pre-debate concerns ("might be a problem, but not sure")

**Current state:** People keep text files open in notepad. No structured capture.

**Solution:** VS Code extension `adrai-review-notes` with:
- Sidebar panel showing all notes grouped by status/type
- Keybindings to add notes at current location
- Multi-location linking (one note → multiple files)
- Personal storage in `~/.adts/review-notes.yaml` (gitignored)
- Promotion workflow to create DEB-NNNN from notes

---

## The Workflow

```
Reading artifact → Quick note with location(s) → Side panel view → Triage → Debate if needed
```

### Phase 1: Capture While Reading

As you review artifacts (plans, ADRs, code), capture thoughts immediately:

1. **Position cursor** at the relevant line
2. Press **Ctrl+Shift+N** (Cmd+Shift+N on Mac)
3. **Enter your thought** as a quick note
4. **Select type**:
   - `Question` - Need answer/clarification
   - `Uncertainty` - Not sure yet, need more context
   - `Concern` - Potential issue to investigate
   - `Bookmark` - Come back to this later
   - `Pre-debate` - Might warrant formal DEB-NNNN
5. **Add tags** (optional) for filtering

**Key principle:** Capture first, triage later. Don't interrupt your reading flow.

### Phase 2: Multi-Location Linking

When you find related code/docs:

1. Navigate to the related location
2. Press **Ctrl+Shift+L** (Cmd+Shift+L on Mac)
3. Select the existing note to link
4. The note now references both locations

**Use cases:**
- Interface definition → Implementation
- Plan → Code that implements it
- ADR → Code that follows (or violates) it
- Documentation → Actual behavior

### Phase 3: Triage in Side Panel

Press **Ctrl+Shift+R** to open the Review Notes panel:

```
REVIEW NOTES
├── 📋 Open (3)
│   ├── 🔍 What does risk level mean?
│   │   └── docs/debates/README.md:48
│   │   └── assets/.../plan-template.md:187
│   ├── ⚠️ Cycle detection unspecified
│   │   └── docs/debates/.deb-graph.yaml:89
│   └── 📌 Come back to evidence section
│       └── docs/debates/templates/debate-template.md:95
├── 🔬 Investigating (1)
│   └── ❓ Is Argdown really needed?
└── ✅ Resolved (2)
```

**Triage actions:**
- Click note → Navigate to primary location
- Right-click → Change status, edit, delete
- Right-click → Promote to debate

### Phase 4: Promote or Resolve

For each note, decide:

| Decision | Action |
|----------|--------|
| **Answered** | Mark as `Resolved` |
| **Still investigating** | Set status to `Investigating` |
| **Needs team discussion** | Promote to Debate |
| **Not relevant anymore** | Delete |

---

## When to Promote to Debate

Use the 7-Gate criteria to decide if a note warrants formal debate:

1. **Critical file patterns** - Touches auth/*, security/*
2. **Risk Level Critical** - From AIDE plan
3. **Stakeholder disagreement** - Multiple people have opinions
4. **Precedent-setting** - This will be followed by others
5. **Irreversible** - Hard/impossible to undo
6. **Complexity score ≥ 10** - See complexity scoring
7. **Explicit uncertainty** - You flagged it as uncertain

**If ANY gate triggers → Promote to debate**

---

## Promotion Workflow

When promoting a note to debate:

1. Right-click note → "Promote to Debate"
2. Extension reads `.deb-tracker.md` for next DEB-NNNN ID
3. Creates debate file from `templates/debate-template.md`
4. Pre-fills:
   - **Central Question** from note content
   - **Context section** with all linked locations
   - **Created date** as today
5. Opens the new debate file for editing
6. Updates note with `promoted_to: DEB-NNNN` and status `resolved`

### What the Extension Creates

```markdown
# DEB-0042: What does risk level actually mean here?

> **Status:** Draft
> **Owner:** @your-name
> **Created:** 2026-01-29
> ...

## The Question

[Central Question]: What does risk level actually mean here?

### Context from Review Note

- docs/debates/README.md:48
  > | Risk | Approvers Required |
- docs/debates/templates/plan-template.md:187
  > ### Risk Level Guidelines

## Theses
...
```

---

## Best Practices

### During Review

1. **Capture everything** - Better to have notes you delete than thoughts you forget
2. **Be specific** - Include line numbers and quotes
3. **Link related locations** - Helps others understand connections
4. **Use appropriate types** - Helps with later triage

### During Triage

1. **Process regularly** - Don't let notes pile up
2. **Resolve aggressively** - If you got your answer, mark it resolved
3. **Promote sparingly** - Not every concern needs a formal debate
4. **Delete freely** - Obsolete notes are clutter

### When Promoting

1. **Expand the question** - Your terse note needs context for others
2. **Add stakeholders** - Who needs to weigh in?
3. **Set appropriate status** - Usually starts as Draft
4. **Check dependencies** - Does this block or depend on other debates?

---

## Note Types Reference

| Type | Icon | When to Use | Typical Outcome |
|------|------|-------------|-----------------|
| **Question** | 🔍 | Need factual answer | Resolved with answer |
| **Uncertainty** | ❓ | Need more context | Often resolved after reading more |
| **Concern** | ⚠️ | Potential issue | Investigate, maybe promote |
| **Bookmark** | 📌 | Return later | Delete after returning |
| **Pre-debate** | 🔥 | Likely needs discussion | Promote to debate |

---

## Status Lifecycle

```
open → investigating → promote → resolved
                    ↘         ↗
                      resolved
```

| Status | Meaning | Next Actions |
|--------|---------|--------------|
| **Open** | Fresh note, needs attention | Read, investigate, resolve, or promote |
| **Investigating** | Actively researching | Continue research or resolve/promote |
| **Promote** | Queued for debate creation | Run promote workflow |
| **Resolved** | Done | Archive (automatically hidden) |

---

## Storage

Notes are stored locally in `~/.adts/review-notes.yaml`:

- **Personal** - Not in version control
- **Human-readable** - YAML format
- **Portable** - Copy to new machine if needed

To backup or sync:
```bash
cp ~/.adts/review-notes.yaml ~/backup/
```

---

## VS Code Extension

See [tools/adrai-review-notes/README.md](../../tools/adrai-review-notes/README.md) for:
- Installation instructions
- Full command reference
- Configuration options
- Development guide

---

[← Debates README](README.md) | [Templates →](templates/debate-template.md)
