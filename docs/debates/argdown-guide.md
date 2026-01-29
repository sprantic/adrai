# Argdown Syntax Guide

Reference for writing structured debates using Argdown notation.

---

## What is Argdown?

Argdown is a Markdown-like syntax for structured argumentation. It lets you:

- Define **theses** (proposed positions)
- Add **supporting claims** (pros)
- Add **opposing claims** (cons)
- Structure **objections** and **rebuttals**
- Create machine-readable argument maps

**Official documentation:** [argdown.org](https://argdown.org/)

---

## Core Syntax

### Central Question

The question being debated, enclosed in square brackets:

```argdown
[Central Question]: Which database should we use for order management?
```

### Thesis Statements

A thesis is a proposed answer, wrapped in angle brackets:

```argdown
<[Thesis A]>: We should use PostgreSQL for its reliability.

<[Thesis B]>: We should use CockroachDB for horizontal scaling.
```

### Supporting Claims (+)

Claims that support a thesis use `+` prefix:

```argdown
<[Thesis A]>: We should use PostgreSQL.

+ [Battle-tested]: PostgreSQL has decades of production usage.
+ [Team expertise]: Our team has deep PostgreSQL experience.
+ [Tooling]: Excellent ecosystem of monitoring and backup tools.
```

### Opposing Claims (-)

Claims against a thesis use `-` prefix:

```argdown
<[Thesis A]>: We should use PostgreSQL.

+ [Battle-tested]: PostgreSQL has decades of production usage.
- [Scaling limits]: Single-node write throughput caps at ~50K TPS.
- [Operational burden]: Requires manual sharding for large datasets.
```

### Nested Arguments

Indent to show claim hierarchy:

```argdown
<[Thesis A]>: We should use PostgreSQL.

+ [Battle-tested]: PostgreSQL has decades of production usage.
  + [Stability]: Rare data corruption issues.
  + [Documentation]: Extensive community knowledge.
- [Scaling limits]: Single-node write throughput caps at ~50K TPS.
  + [Mitigation available]: Read replicas handle read scaling.
```

### Objections

Objections to specific claims use angle brackets with `-`:

```argdown
+ [Team expertise]: Our team has deep PostgreSQL experience.
  - <Learning curve objection>: CockroachDB uses PostgreSQL wire protocol anyway.
```

### Rebuttals to Objections

Respond to objections with nested `+`:

```argdown
+ [Team expertise]: Our team has deep PostgreSQL experience.
  - <Learning curve objection>: CockroachDB uses PostgreSQL wire protocol anyway.
    + [Response]: Wire protocol compatibility doesn't cover operational differences.
```

---

## Complete Example

```argdown
[Central Question]: Which database for order management?

===

<[Thesis A: PostgreSQL]>: Use PostgreSQL for reliability and team familiarity.

+ [Battle-tested]: Decades of production usage across industries.
  + [Stability]: Known failure modes, predictable behavior.
  + [Documentation]: Extensive community knowledge base.

+ [Team expertise]: Team has 5+ years PostgreSQL experience.
  - <Wire protocol objection>: CockroachDB is PostgreSQL-compatible.
    + [Response]: Compatibility doesn't extend to operations, monitoring, tuning.

+ [Tooling ecosystem]: Mature backup, monitoring, and HA solutions.
  + [pgBackRest]: Battle-tested backup and restore.
  + [Patroni]: Production-grade HA clustering.

- [Scaling ceiling]: Write throughput limited to single node.
  + [Mitigation]: Read replicas for read scaling.
  + [Mitigation]: Citus extension for write sharding.

- [Manual sharding]: Requires application-level partitioning.

===

<[Thesis B: CockroachDB]>: Use CockroachDB for native horizontal scaling.

+ [Horizontal scaling]: Automatic data distribution across nodes.
  + [No sharding logic]: Application remains simple.
  + [Linear scaling]: Add nodes, get proportional throughput.

+ [Geo-distribution]: Multi-region with strong consistency.

- [Team unfamiliarity]: 2-3 week learning curve for operations.
- [Cost]: Higher infrastructure cost at small scale.
- [Maturity]: Fewer years of production battle-testing.

===

<[Thesis C: Status Quo]>: Delay decision, continue with existing MySQL.

+ [No disruption]: No migration risk.
- [Tech debt]: MySQL limitations continue to constrain features.
- [Deferred cost]: Migration becomes harder as data grows.
```

---

## Syntax Reference Table

| Element | Syntax | Example |
|---------|--------|---------|
| Question | `[Name]: text` | `[Central Question]: What should we do?` |
| Thesis | `<[Name]>: text` | `<[Thesis A]>: We should use X.` |
| Supporting claim | `+ [Name]: text` | `+ [Benefit]: This helps because...` |
| Opposing claim | `- [Name]: text` | `- [Drawback]: This hurts because...` |
| Objection | `- <Name>: text` | `- <Objection>: But what about...` |
| Nested claim | `  + [Name]: text` | (indent with 2 spaces) |
| Section break | `===` | Separates theses visually |

---

## Naming Conventions

### Claims

Use descriptive, noun-phrase names:

```argdown
# Good
+ [Team expertise]: Our team knows PostgreSQL.
+ [Scaling limits]: Single-node throughput caps at 50K TPS.

# Avoid
+ [Good]: PostgreSQL is good.  # Too vague
+ [It scales well]: ...  # Sentence fragment as name
```

### Theses

Include the option name:

```argdown
# Good
<[Thesis A: PostgreSQL]>: Use PostgreSQL for reliability.
<[Thesis B: CockroachDB]>: Use CockroachDB for scaling.

# Avoid
<[Option 1]>: Use PostgreSQL.  # Not descriptive
```

---

## Integrating with adrAI

### In Debate Files

Use Argdown within the Theses section:

```markdown
## Theses

### Thesis A: PostgreSQL

<[Thesis A]>: Use PostgreSQL for reliability and team familiarity.

+ [Battle-tested]: Decades of production usage.
  + [Stability]: Known failure modes.
  - <Scaling objection>: What about write throughput?
    + [Response]: Read replicas and Citus extension.

- [Manual sharding]: Requires application-level logic.
```

### Evidence References

Link evidence to claims:

```argdown
+ [Benchmark results]: PostgreSQL handles 45K TPS in our tests.
  <!-- Evidence: E1 in Evidence section -->
```

---

## Tooling

### Argdown CLI

Install for syntax validation and visualization:

```bash
npm install -g @argdown/cli

# Validate syntax
argdown validate docs/debates/DEB-0001-topic.deb.md

# Generate HTML visualization
argdown html docs/debates/DEB-0001-topic.deb.md -o output/
```

### VS Code Extension

Install "Argdown" extension for:
- Syntax highlighting
- Live preview
- Argument map visualization

---

## Common Patterns

### Pro/Con Structure

```argdown
<[Thesis A]>: Position statement.

+ [Pro 1]: First benefit.
+ [Pro 2]: Second benefit.
- [Con 1]: First drawback.
- [Con 2]: Second drawback.
```

### Objection/Rebuttal Chain

```argdown
+ [Main claim]: Primary argument.
  - <Objection 1>: Counter-argument.
    + [Rebuttal]: Response to objection.
      - <Counter-rebuttal>: Response to rebuttal.
        + [Final response]: Closing argument.
```

### Trade-off Acknowledgment

```argdown
+ [Benefit]: This approach gives us X.
  - <Trade-off>: But we lose Y.
    + [Acceptable]: Y is less important than X because...
```

---

## Tips for Good Arguments

1. **Be specific** - "45K TPS" beats "high performance"
2. **Name claims descriptively** - The name should summarize the claim
3. **Acknowledge weaknesses** - Include cons for your preferred thesis
4. **Link evidence** - Reference benchmarks, research, expert opinion
5. **Keep nesting shallow** - 3 levels max for readability
6. **Use section breaks** - `===` between theses improves scanability

---

## References

- [Argdown Official Docs](https://argdown.org/)
- [Argdown GitHub](https://github.com/argdown/argdown)
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=argdown.argdown-vscode)

---

[← Debates README](README.md) | [Debate Template](templates/debate-template.md)
