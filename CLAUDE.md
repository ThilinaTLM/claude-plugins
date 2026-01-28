# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Claude Code plugin marketplace (`tlmtech`) containing multiple plugins. Marketplace manifest: `.claude-plugin/marketplace.json`.

| Plugin | Purpose |
|--------|---------|
| `spec-driven-dev/` | Specification-driven development workflow with skill and CLI |
| `adb-pilot/` | Android device automation via ADB (Python scripts) |
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
/plugin install spec-driven-dev@tlmtech
```

## CLI Tools

Both `spec-cli` and `pgtool/pgtool-cli` follow the same development pattern:

```bash
cd {spec-cli|pgtool/pgtool-cli} && bun install
bun run dev [command]           # Run in development
bun run build                   # Build for current platform
bun run build:all               # Build for all platforms (linux/darwin/windows, x64/arm64)
```

### Releasing spec-cli

Push a semantic version tag to trigger GitHub Action release:
```bash
git tag v1.0.0 && git push origin v1.0.0
```

## spec-cli Commands

All commands output JSON by default. Use `--plain` for human-readable, `-q` for minimal output.

| Command | Description |
|---------|-------------|
| `spec init [name]` | Initialize `.specs/` structure |
| `spec status` | Show all specs and progress |
| `spec resume {spec}` | Progress + next task + context |
| `spec mark {spec} {task-id}` | Mark task/subtask complete |
| `spec archive {spec}` | Move completed spec to `.specs/archived/` |
| `spec validate {path}` | Check spec completeness |
| `spec compact {file}` | Token-optimized version (~60% reduction) |

### spec-cli Architecture

**Entry:** `src/index.ts` uses citty framework.

**Core Libraries (`src/lib/`):** `project-root.ts` (finds `.specs/`), `spec-parser.ts` (YAML→Phase[]), `validator.ts`, `compactor.ts` (GIVEN/WHEN/THEN→shorthand), `progress.ts`.

## pgtool-cli Commands

Requires `.pgtool.json` config file with connection details.

| Command | Description |
|---------|-------------|
| `pgtool schemas` | List database schemas |
| `pgtool tables [schema]` | List tables |
| `pgtool describe <table>` | Show columns with PK/FK info |
| `pgtool query <sql>` | Execute SQL query |

### pgtool-cli Architecture

**Entry:** `src/index.ts` uses citty framework.

**Core Libraries (`src/lib/`):** `config.ts` (reads `.pgtool.json`), `connection.ts` (pg pool), `project-root.ts`, `output.ts` (JSON/plain formatting).
