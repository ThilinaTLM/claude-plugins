# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **Claude Code plugin repository** containing plugins by TLM. Each subdirectory is a standalone plugin that can be installed independently.

### Plugins

| Plugin | Description |
|--------|-------------|
| `spec-driven-dev` | Specification-driven development workflow with CLI and skill for AI agents |

## spec-driven-dev Plugin

A specification-driven development CLI tool designed for AI agents managing complex, multi-session software development tasks. It provides structured specification management with token-optimized artifacts for feature development, brownfield modifications, and cross-session continuity.

### Build & Development Commands

```bash
# Development (requires Bun)
cd spec-driven-dev/cli && bun install
bun run dev [command]           # Run CLI in development mode

# Build
bun run build                   # Build for current platform
bun run build:all               # Build for all platforms (linux/darwin/windows, x64/arm64)

# Run compiled binary
./spec-driven-dev/cli/dist/spec-linux-x64 [command]
```

### CLI Commands

| Command | Description |
|---------|-------------|
| `spec init [name]` | Initialize `specs/` directory structure with templates |
| `spec status` | Show all features and their progress |
| `spec resume {feature}` | Show progress + next task + minimal context for continuation |
| `spec next {feature}` | Show only the next task (minimal output for AI tools) |
| `spec mark {feature} {task-id}` | Mark task/subtask as complete |
| `spec validate {path}` | Check spec completeness, task coverage, dependencies |
| `spec compact {file} [-o out]` | Generate token-optimized version (~60% reduction) |

**Flags:** All commands support `--json` for machine-readable output and `--quiet`/`-q` for minimal output.

### Architecture

```
spec-driven-dev/
├── .claude-plugin/
│   └── plugin.json           # Plugin manifest
├── skills/
│   └── spec-driven-dev/
│       └── SKILL.md          # Workflow skill for Claude Code
├── cli/
│   ├── src/
│   │   ├── index.ts          # CLI entry (citty framework)
│   │   ├── commands/         # Command implementations
│   │   ├── lib/              # Core libraries
│   │   ├── types/            # TypeScript interfaces
│   │   └── ui/               # CLI output formatting
│   ├── build.ts              # Bun build configuration
│   └── dist/                 # Compiled binaries
├── assets/templates/         # Spec templates
├── references/               # Documentation
├── commands/                 # Plugin slash commands (future)
├── agents/                   # Plugin agents (future)
└── hooks/                    # Plugin hooks (future)
```

### Core Libraries

- **spec-parser.ts**: `parseTasksFile()`, `getNextTask()`, `countCheckboxes()`
- **validator.ts**: Validates spec.md sections (Purpose, User Stories, Requirements), YAML structure, dependencies
- **compactor.ts**: Token reduction via compact notation (GIVEN/WHEN/THEN → shorthand), removes rationale sections
- **progress.ts**: Calculates completion from subtask done/total counts

### Technology Stack

- **Runtime**: Bun (native TypeScript execution)
- **CLI Framework**: citty
- **Data Format**: YAML for task/config files
- **Build**: Bun compile (produces standalone executables)
