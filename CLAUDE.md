# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **Claude Code plugin marketplace** (`tlmtech`) by ThilinaTLM. The marketplace manifest is at `.claude-plugin/marketplace.json`.

### Marketplace Structure

```
claude-plugin/
├── .claude-plugin/
│   └── marketplace.json      # Marketplace manifest
├── spec-driven-dev/          # Plugin directory
│   ├── .claude-plugin/
│   │   └── plugin.json       # Plugin manifest
│   └── ...
└── README.md
```

### Installation

```bash
/plugin marketplace add ThilinaTLM/claude-plugin
/plugin install spec-driven-dev@tlmtech
```

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

- **spec-parser.ts**: `parseTasksFile()`, `parseTasksContent()`, `getNextTask()`, `countCheckboxes()` - Parses YAML tasks into Phase[] structure
- **validator.ts**: Validates spec.md sections (Purpose, User Stories, Requirements), YAML structure, dependency references
- **compactor.ts**: Token reduction (~60%) via compact notation (GIVEN/WHEN/THEN → shorthand), removes rationale sections
- **progress.ts**: `calculateProgressFromCounts()` - Computes completion percentages from subtask done/total counts

### CLI Command Pattern

Each command in `cli/src/commands/` follows the citty pattern:
```typescript
export const commandName = defineCommand({
  meta: { name: "...", description: "..." },
  args: { /* positional and flag args */ },
  async run({ args }) { /* implementation */ },
});
```
Commands support `--json` for machine output and `--quiet`/`-q` for minimal output.

### Plugin Integration

The skill at `skills/spec-driven-dev/SKILL.md` is loaded by Claude Code when the plugin is installed. It provides workflow guidance for spec-driven development, not programmatic functionality. The CLI provides the actual tooling.

### Technology Stack

- **Runtime**: Bun (native TypeScript execution)
- **CLI Framework**: citty (lightweight command framework)
- **Data Format**: YAML for task/config files (via `yaml` package)
- **Build**: Bun compile (produces standalone executables per platform)
