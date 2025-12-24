# spec-driven-dev

A Claude Code plugin for specification-driven development workflow. Designed for AI agents managing complex, multi-session software development tasks.

## Features

- **Structured specifications** - Define requirements (WHAT) separately from implementation (HOW)
- **Task tracking** - YAML-based task breakdown with dependencies and progress tracking
- **Cross-session continuity** - Resume work seamlessly across multiple sessions
- **Token optimization** - Compact notation reduces context usage by ~60%

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
${CLAUDE_PLUGIN_ROOT}/cli/dist/spec init [name]        # Initialize specs/ structure
${CLAUDE_PLUGIN_ROOT}/cli/dist/spec status             # Show all features and progress
${CLAUDE_PLUGIN_ROOT}/cli/dist/spec resume {feature}   # Resume work on a feature
${CLAUDE_PLUGIN_ROOT}/cli/dist/spec next {feature}     # Get next task
${CLAUDE_PLUGIN_ROOT}/cli/dist/spec mark {feature} {task-id}  # Mark task complete
${CLAUDE_PLUGIN_ROOT}/cli/dist/spec validate {path}    # Validate spec completeness
${CLAUDE_PLUGIN_ROOT}/cli/dist/spec compact {file}     # Generate token-optimized version
```

All commands support `--json` for machine-readable output and `-q` for minimal output.

## Workflow

1. **Spec** - Define requirements in `specs/features/{feature}/spec.md`
2. **Plan** - Create technical approach in `plan.md`
3. **Tasks** - Break down into actionable items in `tasks.yaml`
4. **Implement** - Execute tasks with validation
5. **Archive** - Move completed features to `specs/archive/`

## Directory Structure

```
specs/
├── project.md           # Project conventions
├── features/            # Active specifications
│   └── {feature}/
│       ├── spec.md      # Requirements
│       ├── plan.md      # Technical plan
│       └── tasks.yaml   # Task breakdown
└── archive/             # Completed features
```

## License

MIT
