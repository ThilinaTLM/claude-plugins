# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A specification-driven development CLI tool designed for AI agents managing complex, multi-session software development tasks. It provides structured specification management with token-optimized artifacts for feature development, brownfield modifications, and cross-session continuity.

## Build & Development Commands

```bash
# Development (requires Bun)
cd cli && bun install
bun run dev [command]           # Run CLI in development mode

# Build
bun run build                   # Build for current platform
bun run build:all               # Build for all platforms (linux/darwin/windows, x64/arm64)

# Run compiled binary
./cli/dist/spec-linux-x64 [command]
```

## CLI Commands

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

## Architecture

```
cli/
├── src/
│   ├── index.ts              # CLI entry (citty framework)
│   ├── commands/             # Command implementations
│   │   ├── init.ts           # Initialize specs/ structure
│   │   ├── status.ts         # Show feature progress
│   │   ├── resume.ts         # Resume work on feature
│   │   ├── next.ts           # Show next task (minimal output)
│   │   ├── mark.ts           # Mark tasks complete
│   │   ├── validate.ts       # Validate spec files
│   │   └── compact.ts        # Token optimization
│   ├── lib/                  # Core libraries
│   │   ├── spec-parser.ts    # YAML task parsing
│   │   ├── validator.ts      # Spec validation logic
│   │   ├── compactor.ts      # Token compression
│   │   └── progress.ts       # Progress calculation
│   ├── types/                # TypeScript interfaces
│   └── ui/                   # CLI output formatting (ANSI colors)
├── build.ts                  # Bun build configuration (multi-platform)
└── dist/                     # Compiled binaries
```

## Key Data Structures

**tasks.yaml format** (parsed by `spec-parser.ts`):
```yaml
feature: feature-name
phases:
  - id: 1
    name: Phase Name
    checkpoint: Validation criteria
    tasks:
      - id: "1.1"
        title: Task Title
        files: [src/file.ts]
        depends: ["1.0"]
        subtasks:
          - text: Implementation
            done: false
```

## Core Libraries

- **spec-parser.ts**: `parseTasksFile()`, `getNextTask()`, `countCheckboxes()`
- **validator.ts**: Validates spec.md sections (Purpose, User Stories, Requirements), YAML structure, dependencies
- **compactor.ts**: Token reduction via compact notation (GIVEN/WHEN/THEN → shorthand), removes rationale sections
- **progress.ts**: Calculates completion from subtask done/total counts

## Validation Rules

The validator checks:
- Required sections in spec.md: Purpose, User Stories, Requirements
- Acceptance criteria presence per user story
- Formal requirements with SHALL/MUST/SHOULD keywords (RFC 2119)
- Valid dependency references in tasks.yaml
- YAML structural validity

## Token Optimization

The compactor reduces tokens ~60% through:
- Compact acceptance criteria: `GIVEN/WHEN/THEN` → `[given+when→then]`
- Shortened requirements: Remove "The system" preambles
- Inline tables and comma-separated short lists
- Stripped rationale sections

## Technology Stack

- **Runtime**: Bun (native TypeScript execution)
- **CLI Framework**: citty
- **Data Format**: YAML for task/config files
- **Build**: Bun compile (produces standalone executables)
