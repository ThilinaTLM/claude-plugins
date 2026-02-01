# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Claude Code plugin marketplace (`tlmtech`) containing multiple plugins. Marketplace manifest: `.claude-plugin/marketplace.json`.

| Plugin | Purpose |
|--------|---------|
| `specdev/` | Specification-driven development workflow with skill and CLI |
| `droid/` | Android device automation via ADB (TypeScript CLI) |
| `pgtool/` | PostgreSQL database exploration and debugging |

## Plugin Structure

Each plugin follows this structure:
```
plugin-name/
├── .claude-plugin/plugin.json   # Plugin manifest
├── skills/                      # Claude Code skills (SKILL.md files)
├── commands/                    # Slash commands
├── agents/                      # Custom agents
└── hooks/                       # Event hooks
```

## Local Development

Test plugins locally:
```bash
/plugin marketplace add /path/to/claude-plugins
/plugin install specdev@tlmtech
```

## CLI Tools

All three CLIs (`specdev-cli`, `pgtool-cli`, `droid-cli`) follow the same development pattern:

```bash
cd {plugin}-cli && bun install  # pgtool-cli, droid-cli
cd specdev/skills/specdev/scripts/specdev-cli && bun install  # specdev-cli
bun run dev [command]           # Run in development
bun run lint                    # Check with Biome
bun run lint:fix                # Auto-fix lint issues
bun run format                  # Format with Biome
```

Testing (specdev-cli only):
```bash
bun test                        # Run all tests
bun test --watch                # Watch mode
```

### Releasing specdev-cli

Push a semantic version tag to trigger GitHub Action release:
```bash
git tag v1.0.0 && git push origin v1.0.0
```

## specdev-cli Commands

All commands output JSON by default. Use `--plain` for human-readable output.

| Command | Description |
|---------|-------------|
| `specdev init` | Initialize `.specs/` structure |
| `specdev new {name}` | Create new spec with templates |
| `specdev list` | List all active specs and progress |
| `specdev context {spec}` | Show spec context (--level min\|standard\|full) |
| `specdev path {spec}` | Analyze task dependencies |
| `specdev archive {spec}` | Move completed spec to `.specs/archived/` |
| `specdev validate {path}` | Check spec completeness |

### specdev-cli Architecture

**Entry:** `src/index.ts` uses citty framework.

**Commands (`src/commands/`):** Each file exports a citty command definition.

**Core Libraries (`src/lib/`):**
- `project-root.ts` - Finds `.specs/` directory
- `spec-parser.ts` - Parses YAML tasks into Phase[]
- `spec-lookup.ts` - Resolves spec names to paths
- `validator.ts` - Validates spec completeness
- `progress.ts` - Calculates task completion
- `dependency-graph.ts` - Task dependency analysis
- `checkpoint-parser.ts` - Parses checkpoint.md files
- `safe-io.ts` - Safe file I/O operations
- `args.ts` - Argument parsing utilities
- `diff.ts` - Diff generation utilities

**Other (`src/`):** `templates/` (spec templates), `types/` (TypeScript types), `ui/output.ts` (JSON/plain formatting)

## pgtool-cli Commands

Requires `.pgtool.json` config file with connection details.

| Command | Description |
|---------|-------------|
| `pgtool schemas` | List database schemas |
| `pgtool tables [schema]` | List tables |
| `pgtool describe <table>` | Show columns with PK/FK info |
| `pgtool indexes <table>` | List table indexes |
| `pgtool constraints <table>` | List constraints |
| `pgtool relationships [schema]` | Show FK relationships |
| `pgtool query <sql>` | Execute SQL query |
| `pgtool sample <table>` | Sample rows from table |
| `pgtool count <table>` | Count rows |
| `pgtool search <term>` | Search across tables |
| `pgtool overview` | Database overview |
| `pgtool explain <sql>` | Explain query plan |

### pgtool-cli Architecture

**Entry:** `src/index.ts` uses citty framework.

**Core Libraries (`src/lib/`):**
- `config.ts` - Reads `.pgtool.json`
- `connection.ts` - PostgreSQL pool management
- `project-root.ts` - Finds config file
- `output.ts` - JSON/plain formatting
- `init.ts` - Initialization utilities

## droid-cli Commands

Requires ADB in PATH and connected Android device/emulator.

| Command | Description |
|---------|-------------|
| `droid screenshot` | Capture screenshot + UI elements |
| `droid tap` | Tap by text or coordinates |
| `droid fill <field> <text>` | Fill text field |
| `droid wait-for -t <text>` | Wait for element |
| `droid clear` | Clear focused field |
| `droid type <text>` | Type into focused field |
| `droid key <keyname>` | Send key event |
| `droid swipe <direction>` | Swipe gesture |
| `droid longpress` | Long press |
| `droid launch <package>` | Launch app |
| `droid current` | Current activity |
| `droid info` | Device info |
| `droid wait <ms>` | Wait milliseconds |
| `droid select-all` | Select text |
| `droid hide-keyboard` | Dismiss keyboard |

### droid-cli Architecture

**Entry:** `src/index.ts` uses citty framework.

**Core Libraries (`src/lib/`):**
- `adb.ts` - ADB command execution
- `ui-hierarchy.ts` - UI dump parsing
- `ui-element.ts` - Element finding and matching
- `keycodes.ts` - Android keycode mappings
- `output.ts` - JSON output formatting
