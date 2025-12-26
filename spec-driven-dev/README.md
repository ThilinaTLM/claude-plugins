# spec-driven-dev

A Claude Code plugin for specification-driven development workflow. Designed for AI agents managing complex, multi-session software development tasks.

**Version:** 3.0.0

## Features

- **Structured specifications** - Define requirements (WHAT) separately from implementation (HOW)
- **Task tracking** - YAML-based task breakdown with dependencies and progress tracking
- **Cross-session continuity** - Resume work seamlessly across multiple sessions
- **Token optimization** - Compact notation reduces context usage by ~60%
- **Auto-detection** - CLI automatically finds project root from any subdirectory
- **JSON-first output** - All commands output JSON by default for AI consumption

## Requirements

- **[Bun](https://bun.sh)** - Required for building the CLI on first use

Install Bun:
```bash
curl -fsSL https://bun.sh/install | bash
```

## Installation

Install as a Claude Code plugin:

```bash
claude plugins add /path/to/spec-driven-dev
```

The CLI binary is automatically built on first session start.

## Usage

The plugin provides:

1. **Skill** - Workflow guidance loaded into Claude Code context
2. **CLI** - Command-line tool for spec management

### CLI Commands

```bash
${CLAUDE_PLUGIN_ROOT}/cli/dist/spec init [name]           # Initialize .specs/ structure
${CLAUDE_PLUGIN_ROOT}/cli/dist/spec status                # Show all specs and progress
${CLAUDE_PLUGIN_ROOT}/cli/dist/spec resume {spec}         # Resume work on a spec
${CLAUDE_PLUGIN_ROOT}/cli/dist/spec next {spec}           # Get next task
${CLAUDE_PLUGIN_ROOT}/cli/dist/spec mark {spec} {task-id} # Mark task complete
${CLAUDE_PLUGIN_ROOT}/cli/dist/spec archive {spec}        # Archive completed spec
${CLAUDE_PLUGIN_ROOT}/cli/dist/spec validate {path}       # Validate spec completeness
${CLAUDE_PLUGIN_ROOT}/cli/dist/spec compact {file}        # Generate token-optimized version
```

All commands output JSON by default. Use `-q` for minimal output.

## Workflow

1. **Spec** - Define requirements in `.specs/active/{spec}/spec.md`
2. **Plan** - Create technical approach in `plan.md`
3. **Tasks** - Break down into actionable items in `tasks.yaml`
4. **Implement** - Execute tasks with validation
5. **Archive** - Run `spec archive {spec}` to move to `.specs/archived/`

## Directory Structure

```
.specs/
├── project.md           # Project conventions
├── active/              # Active specifications
│   └── {spec}/
│       ├── spec.md      # Requirements
│       ├── plan.md      # Technical plan
│       └── tasks.yaml   # Task breakdown
└── archived/            # Completed specs
```

## License

MIT
