# Agents

This directory contains custom subagents for the `tlmtech` plugin.

## Adding an Agent

Create a markdown file (e.g., `my-agent.md`) with the following structure:

```markdown
---
description: When to use this agent and what it does
capabilities:
  - Capability 1
  - Capability 2
---

# Agent Name

## Expertise
What this agent specializes in.

## When to use this agent
- Scenario 1
- Scenario 2

## Approach
How this agent tackles problems.
```

## Examples

- `code-reviewer.md` - Code review specialist
- `security-auditor.md` - Security analysis agent

See [Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code) for more details.
