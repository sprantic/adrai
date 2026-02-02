# ADR-001: Technology Stack

> **Status:** Accepted
> **Date:** 2026-01-29
> **Deciders:** @sprantic
> **Related:** AIDE-0001

---

## Context

adrai needs a technology stack for:
1. CLI tools for debate management and mesh operations
2. VS Code extension for personal annotations
3. Data storage for debates, notes, and dependency graphs
4. Documentation and visualization

The technology choices need to align with:
- Modern development practices
- Type safety for complex data structures
- Fast iteration during development
- Human-readable artifacts for version control

---

## Decision

**We will use the following technology stack:**

| Component | Choice | Version |
|-----------|--------|---------|
| **Language** | TypeScript | 5.3+ |
| **Runtime** | bun | 1.0+ |
| **Extension Platform** | VS Code Extension API | 1.85+ |
| **Structured Data** | YAML | - |
| **Diagrams** | Mermaid | - |
| **Debate Syntax** | Argdown-compatible Markdown | - |
| **Package Management** | bun | - |

---

## Consequences

### Positive

- TypeScript provides type safety for complex debate/graph data structures
- bun offers fast execution and native TypeScript support
- YAML is human-readable and diff-friendly in git
- Mermaid integrates with GitHub/GitLab markdown rendering
- Argdown syntax is established for structured argumentation
- VS Code is the dominant IDE, maximizing potential adoption

### Negative

- bun is newer runtime, may have edge cases
- YAML parsing can be slow for very large files
- Argdown tooling is limited compared to mainstream formats

### Neutral

- Team needs TypeScript experience (common skill)
- VS Code extension development has learning curve

---

## Alternatives Considered

### Option 1: Python + pip

**Description:** Use Python for CLI tools, pip for packages.

**Pros:**
- Large ecosystem
- Widely known

**Cons:**
- No native type checking
- Virtual environment complexity
- Slower execution

**Why not chosen:** TypeScript's type system better suited for complex data structures.

### Option 2: Go

**Description:** Use Go for CLI tools and tooling.

**Pros:**
- Fast execution
- Simple deployment (single binary)
- Strong typing

**Cons:**
- VS Code extensions require JavaScript/TypeScript
- Would need two languages (Go + TypeScript)

**Why not chosen:** Maintaining two languages adds complexity.

### Option 3: JSON instead of YAML

**Description:** Use JSON for all structured data.

**Pros:**
- Faster parsing
- No indentation ambiguity

**Cons:**
- Less human-readable
- No comments allowed
- Verbose for nested structures

**Why not chosen:** YAML's readability prioritized for artifacts humans edit directly.

---

## Implementation Notes

- Use `yaml` npm package for YAML parsing
- Use `uuid` for generating identifiers
- Keep YAML files under version control
- Generate Mermaid diagrams from YAML programmatically

---

## References

- [AIDE-0001: Review Notes Extension](../../plans/AIDE-0001-review-notes-extension.md)
- [adrai Conceptual Overview](../adrai-concepts/adrai-conceptual-overview.md)
- [Argdown](https://argdown.org/)
- [Mermaid](https://mermaid.js.org/)

---

## Revision History

| Date | Author | Description |
|------|--------|-------------|
| 2026-01-29 | @sprantic | Initial decision |
