# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Claude Code plugin marketplace (`tlmtech`) with the `spec-driven-dev` plugin for specification-driven development workflows. The marketplace manifest is at `.claude-plugin/marketplace.json`.

| Component | Purpose |
|-----------|---------|
| `spec-driven-dev/` | Plugin with workflow skill (`skills/spec-driven-dev/SKILL.md`) |
| `spec-cli/` | CLI tool for spec management (installed separately from plugin) |

## spec-cli Development

```bash
cd spec-cli && bun install
bun run dev [command]           # Run in development mode
bun run build                   # Build for current platform
bun run build:all               # Build for linux/darwin/windows (x64/arm64)
```

### Releasing

Push a semantic version tag to trigger GitHub Action release:
```bash
git tag v1.0.0 && git push origin v1.0.0
```

### CLI Commands

All commands output JSON by default. Use `--plain` for human-readable, `-q` for minimal output, `--root` to specify project root.

| Command | Description |
|---------|-------------|
| `spec init [name]` | Initialize `.specs/` structure with templates |
| `spec status` | Show all specs and progress |
| `spec resume {spec}` | Progress + next task + minimal context |
| `spec next {spec}` | Next task only (minimal AI output) |
| `spec mark {spec} {task-id}` | Mark task/subtask complete |
| `spec archive {spec}` | Move completed spec to `.specs/archived/` |
| `spec validate {path}` | Check spec completeness, dependencies |
| `spec compact {file} [-o out]` | Token-optimized version (~60% reduction) |

### Architecture

**Entry:** `src/index.ts` uses citty framework for CLI commands.

**Core Libraries (`src/lib/`):**
- `project-root.ts` - Auto-detects project root by walking up to find `.specs/`
- `spec-parser.ts` - Parses YAML tasks into Phase[] structure, finds next task
- `validator.ts` - Validates spec.md sections and YAML structure
- `compactor.ts` - Token reduction via compact notation (GIVEN/WHEN/THEN → shorthand)
- `progress.ts` - Computes completion percentages from subtask counts

**Stack:** Bun runtime, citty CLI framework, yaml package. Bun compile produces standalone executables.
