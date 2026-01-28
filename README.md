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

### Install specdev-cli (Optional)

The `spec` CLI tool can be installed separately for command-line spec management:

**Linux/macOS:**
```bash
curl -fsSL https://raw.githubusercontent.com/ThilinaTLM/claude-plugins/main/specdev-cli/install.sh | bash
```

**Windows (PowerShell):**
```powershell
irm https://raw.githubusercontent.com/ThilinaTLM/claude-plugins/main/specdev-cli/install.ps1 | iex
```

**Windows (Git Bash):**
```bash
curl -fsSL https://raw.githubusercontent.com/ThilinaTLM/claude-plugins/main/specdev-cli/install.sh | bash
```

Supports: Linux (x64, arm64), macOS (x64, arm64), Windows (x64)

Installs to `~/.local/bin/spec` (or `%USERPROFILE%\.local\bin\spec.exe` on Windows).

## Available Plugins

| Plugin | Description | Version |
|--------|-------------|---------|
| [specdev](./specdev) | Specification-driven development workflow with CLI and skill for AI agents | 1.0.0 |

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
