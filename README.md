# TLM Claude Code Plugins

A Claude Code plugin marketplace by ThilinaTLM.

## Installation

### Add the Marketplace

```bash
/plugin marketplace add ThilinaTLM/claude-plugin
```

### Install Plugins

```bash
/plugin install specdev@tlmtech
```

## Available Plugins

| Plugin | Description | Version |
|--------|-------------|---------|
| [specdev](./specdev) | Specification-driven development workflow skill for AI agents | 3.0.0 |
| [droid](./droid) | Android device automation and UI testing via ADB | 1.0.0 |
| [pgtool](./pgtool) | PostgreSQL database exploration and debugging | 2.1.0 |

## Local Development

For local testing, you can add the marketplace from a local path:

```bash
/plugin marketplace add /path/to/claude-plugin
/plugin install specdev@tlmtech
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
