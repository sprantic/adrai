# AIDE-0005: Add IDEA Note Type

> **Status:** Complete
> **Author:** @sprantic
> **Created:** 2026-01-30
> **AIDE ID:** AIDE-0005
> **Risk Level:** Low
> **Blocked by:** None
> **Depends on:** AIDE-0004 (Complete)

---

## Summary

Add a new note type "IDEA" to the review notes extension with special behavior: works globally without requiring an open editor, creating location-free notes.

---

## Type Specification

| Property | Value |
|----------|-------|
| Name | `idea` |
| Label | `Idea` |
| Icon | `lightbulb` |
| Punctuation | `+` (plus sign at end) |
| Description | "Capture a new idea or insight" |
| Urgency | Lowest (first in order) |

### Urgency Order After Change

`idea` → `bookmark` → `uncertainty` → `question` → `concern` → `pre-debate`

---

## Special Behavior: Location-Free Ideas

When keybinding is triggered without an open editor:
- Default to IDEA type
- Create note with empty locations array
- Enables capturing ideas from anywhere in VS Code
- Keybindings work globally (not just with editor focus)

---

## Implementation

### Phase 1: Type Definition

**File: `src/types.ts`**

1. Add `'idea'` to `NoteType` union (first position)
2. Add `'idea'` to `NOTE_TYPES_ORDERED` array (first position)
3. Add `'idea': 'lightbulb'` to `NOTE_TYPE_ICONS`
4. Add `'idea': 'Idea'` to `NOTE_TYPE_LABELS`

### Phase 2: Command Logic

**File: `src/commands.ts`**

1. Add `+` detection to `detectNoteType()`:
   ```typescript
   if (trimmed.endsWith('+')) {
     return 'idea';
   }
   ```

2. Add case to `getTypeDescription()`:
   ```typescript
   case 'idea':
     return 'Capture a new idea or insight';
   ```

3. Update prompt text to include `+`:
   ```typescript
   prompt: 'Quick note (type detected from punctuation: + ? ! ~ !!)',
   ```

4. Modify `addNote()` to handle no editor:
   - Remove early return when no editor
   - If no editor: default type to 'idea', create with empty locations

5. Modify `quickNote()` similarly for no-editor scenario

### Phase 3: Keybinding Updates

**File: `package.json`**

1. Remove `editorTextFocus` requirement from keybindings:
   ```json
   {
     "command": "adrai.addNote",
     "key": "ctrl+shift+n",
     "mac": "cmd+shift+n"
   },
   {
     "command": "adrai.quickNote",
     "key": "ctrl+shift+b",
     "mac": "cmd+shift+b"
   }
   ```

2. Add `"idea"` to `adrai.quickNoteDefaultType` enum

### Phase 4: Documentation Updates

**File: `docs/adrai-concepts/adrai-conceptual-overview.md`**

Line 607: Update resolved questions:
```markdown
12. **Note types**: ✅ Six types - idea, question, uncertainty, concern, bookmark, pre-debate
```

**File: `docs/debates/review-workflow.md`**

Lines 39-44: Add Idea to type selection:
```markdown
   - `Idea` - Capture a new idea or insight
   - `Question` - Need answer/clarification
   ...
```

Lines 185-191: Add Idea row to Note Types Reference table:
```markdown
| **Idea** | 💡 | Capture a new idea or insight | Keep or act on |
| **Question** | 🔍 | Need factual answer | Resolved with answer |
...
```

**File: `tools/adrai-review-notes/README.md`**

Add Idea row to Note Types table:
```markdown
| Idea | 💡 | Capture a new idea or insight |
```

---

## Files Summary

| File | Changes |
|------|---------|
| `tools/adrai-review-notes/src/types.ts` | Type union, ordered array, icons, labels |
| `tools/adrai-review-notes/src/commands.ts` | Detection, description, no-editor handling |
| `tools/adrai-review-notes/package.json` | Keybindings, enum |
| `tools/adrai-review-notes/README.md` | Note Types table |
| `docs/adrai-concepts/adrai-conceptual-overview.md` | Resolved questions (5→6 types) |
| `docs/debates/review-workflow.md` | Type selection list, Note Types Reference table |

---

## Verification

1. Compile: `bun run compile`
2. Install: `cp -r out package.json ~/.vscode-server/extensions/sprantic.adrai-review-notes-0.6.1/`
3. Restart VS Code
4. Test punctuation: Note ending with `+` → auto-detects as Idea
5. Test settings: Quick Note default type dropdown shows Idea
6. Test filter: Filter by Type shows Idea option
7. Test global: Close all editors, press Ctrl+Shift+N → creates IDEA with no location
8. Test display: Idea notes without location display properly in tree view

---

## Risks

| Risk | Mitigation |
|------|------------|
| Notes without locations may confuse users | Clear display indicating "No location" |
| `+` may conflict with existing content | Check after other punctuation patterns |

---

## Approval

**Approver:**
**Approval Date:**
**Comments:**

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-30 | Initial draft |
