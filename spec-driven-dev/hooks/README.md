# Hooks

This directory contains event hooks for the `tlmtech` plugin.

## Adding Hooks

Create a `hooks.json` file with event handlers:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/format.sh"
          }
        ]
      }
    ]
  }
}
```

## Available Events

- `PreToolUse` - Before Claude uses a tool
- `PostToolUse` - After Claude uses a tool
- `UserPromptSubmit` - When user submits a prompt
- `SessionStart` - At session start
- `SessionEnd` - At session end
- `Stop` / `SubagentStop` - When stopping
- `Notification` - When Claude sends notifications
- `PreCompact` - Before conversation compaction

## Important

Always use `${CLAUDE_PLUGIN_ROOT}` for paths to ensure portability.

See [Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code) for more details.
