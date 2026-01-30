# AIDE-0002: VS Code Extension Marketplace Deployment

> **Status:** Complete
> **Author:** @sprantic
> **Created:** 2026-01-29
> **AIDE ID:** AIDE-0002
> **Risk Level:** Low
> **Blocked by:** None

---

## Summary

Prepare the adrai Review Notes VS Code extension for publishing to the VS Code Marketplace by adding required metadata files and configuration.

---

## Context

### Problem Statement

The extension is functionally complete but cannot be published to the VS Code Marketplace without:
- LICENSE file
- CHANGELOG.md
- Marketplace icon
- Complete package.json metadata

### Current State

Extension has 8 commands implemented, sidebar panel, YAML storage, and debate promotion. Missing marketplace-required files.

### Related Work

- AIDE-0001: Review Notes VS Code Extension (Complete)

---

## Proposed Changes

### Overview

Add marketplace-required files and update package.json with proper metadata.

### Files to Create

| File | Change Type | Description |
|------|-------------|-------------|
| `tools/adrai-review-notes/LICENSE` | Create | MIT license file |
| `tools/adrai-review-notes/CHANGELOG.md` | Create | Version history |
| `tools/adrai-review-notes/media/icon.png` | Copy | Use existing `assets/adrai.png` |
| `tools/adrai-review-notes/package.json` | Modify | Add publisher, icon, license, galleryBanner |

### Implementation Details

**1. LICENSE (MIT)**
```
MIT License
Copyright (c) 2026 sprantic GmbH
...
```

**2. CHANGELOG.md**
```markdown
# Changelog

## [0.1.0] - 2026-01-29
### Added
- Sidebar review notes panel
- 5 note types: question, uncertainty, concern, bookmark, pre-debate
- 4 status states: open, investigating, promote, resolved
- Multi-location note linking
- Debate promotion workflow (note → DEB-NNNN)
- 8 commands with keyboard shortcuts
- YAML-based personal storage (~/.adrai/review-notes.yaml)
- Status bar note count indicator
```

**3. package.json updates**
```json
{
  "publisher": "sprantic",
  "icon": "media/icon.png",
  "license": "MIT",
  "author": {
    "name": "sprantic"
  },
  "galleryBanner": {
    "color": "#1e3a5f",
    "theme": "dark"
  }
}
```

**4. Icon**
- Copy existing `assets/adrai.png` to `tools/adrai-review-notes/media/icon.png`
- Verify dimensions meet marketplace requirements (128x128 minimum)

---

## Test Scenarios

### Scenario 1: Package Extension

```gherkin
Given all marketplace files are in place
When I run `bun run package` in tools/adrai-review-notes/
Then a .vsix file is created without errors
```

### Scenario 2: Local Installation

```gherkin
Given the .vsix package exists
When I run `code --install-extension *.vsix`
Then the extension installs successfully
And the sidebar panel appears
```

### Scenario 3: Validate Package Contents

```gherkin
Given the .vsix package exists
When I run `npx vsce ls`
Then LICENSE, CHANGELOG.md, and icon.png are included
And node_modules and src/ are excluded
```

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Publisher name taken | Low | Low | Can use alternative name |
| Icon requirements | Low | Low | Marketplace accepts 128x128+ |
| vsce version issues | Low | Low | Use latest npx vsce |

---

## Out of Scope

- Automated CI/CD publishing
- GitHub repository setup
- Marketplace publisher account creation (manual step)

---

## Dependencies

- [x] Extension code complete (AIDE-0001)
- [ ] vsce CLI available via npx

---

## Verification

After implementation:

1. **Package builds:**
   ```bash
   cd tools/adrai-review-notes
   bun run package
   ```

2. **Install and test:**
   ```bash
   code --install-extension adrai-review-notes-0.1.0.vsix
   ```

3. **Verify in VS Code:**
   - Sidebar panel appears
   - Commands work (Ctrl+Shift+N)
   - Notes persist

---

## Notes

- Publisher "sprantic" must be created on marketplace.visualstudio.com first
- Repository URL can be added later when GitHub repo exists
- Icon is placeholder - can be replaced with professional design later

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-29 | @sprantic | Initial plan |
