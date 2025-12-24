# Commands

This directory contains slash commands for the `tlmtech` plugin.

## Adding a Command

Create a markdown file (e.g., `my-command.md`) with the following structure:

```markdown
---
description: Brief description shown in /help
---

# Command Name

Instructions for what Claude should do when this command is invoked.

Use $ARGUMENTS to capture user input, or $1, $2 for positional args.
```

The command will be available as `/tlmtech:my-command`.

## Examples

- `deploy.md` → `/tlmtech:deploy`
- `status.md` → `/tlmtech:status`

See [Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code) for more details.
