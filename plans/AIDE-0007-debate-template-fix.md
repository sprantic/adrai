# AIDE-0007: Debate Template Fix

> **Status:** Complete
> **Created:** 2026-01-30
> **Author:** selfscrum
> **Risk Level:** Low

---

## Summary

Fix debate template handling: remove copy instructions from output and add fallback when template file is missing.

## Problem

1. **Instructions in output**: The template file includes "Copy this template..." instructions and markdown code fences that get copied into new debate files
2. **Missing template error**: If template file doesn't exist, extension shows error instead of using a default

## Solution

1. Create `DEFAULT_DEBATE_TEMPLATE` constant in commands.ts with clean template content
2. Update `promoteToDebate()` to use fallback template when file missing
3. Auto-create template file for future customization

## Files to Modify

| File | Changes |
|------|---------|
| `src/commands.ts` | Add DEFAULT_DEBATE_TEMPLATE, update fallback logic |
| `package.json` | Version bump to 0.8.1 |
| `CHANGELOG.md` | Document template fix |

## Verification

1. Remove template file, promote note - should work with default
2. Check created debate file - no copy instructions
3. Check template file auto-created

## Implementation Notes

- Added `DEFAULT_DEBATE_TEMPLATE` constant (~140 lines) in `commands.ts`
- Template is clean markdown without code fences or copy instructions
- Fallback logic auto-creates `docs/debates/templates/debate-template.md` for customization
- Added location link from promoted note to created DEB file (bidirectional navigation)
- Final version: 0.8.2
