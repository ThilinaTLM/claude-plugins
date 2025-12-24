# TLM Claude Code Plugins

A collection of Claude Code plugins for enhanced AI-assisted development workflows.

## Plugins

| Plugin | Description | Install |
|--------|-------------|---------|
| [spec-driven-dev](./spec-driven-dev) | Specification-driven development workflow with CLI and skill | `claude plugins install <path>/spec-driven-dev` |

## Installation

Install a specific plugin by pointing to its directory:

```bash
# Local installation
claude plugins install /path/to/repo/spec-driven-dev

# From git (if published)
claude plugins install github:tlm/claude-plugins/spec-driven-dev
```

## Contributing

Each plugin is self-contained in its own directory with:
- `.claude-plugin/plugin.json` - Plugin manifest
- `skills/` - Claude Code skills
- `commands/` - Slash commands
- `agents/` - Custom agents
- `hooks/` - Event hooks

## License

MIT
