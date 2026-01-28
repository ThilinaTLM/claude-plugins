# specdev

A Claude Code plugin for specification-driven development workflow. Designed for AI agents managing complex, multi-session software development tasks.

**Version:** 3.0.0

## Features

- **Structured specifications** - Define requirements (WHAT) separately from implementation (HOW)
- **Task tracking** - YAML-based task breakdown with dependencies and progress tracking
- **Cross-session continuity** - Resume work seamlessly across multiple sessions
- **Token optimization** - Compact notation reduces context usage by ~60%
- **Auto-detection** - CLI automatically finds project root from any subdirectory
- **JSON-first output** - All commands output JSON by default for AI consumption
- **Embedded CLI** - No external installation required; runs via Bun with auto-dependency installation

## Prerequisites

- **Bun runtime** - Install from [https://bun.sh](https://bun.sh)

## Installation

```bash
/plugin marketplace add tlmtech
/plugin install specdev@tlmtech
```

## Usage

The plugin provides:

1. **Skill** - Workflow guidance loaded into Claude Code context
2. **CLI** - Embedded command-line tool for spec management (runs via Bun)
3. **Hooks** - Automatic session integration

### CLI Commands

The CLI is embedded within the plugin. Hooks invoke it automatically, but you can also run commands directly:

```bash
${CLAUDE_PLUGIN_ROOT}/specdev-cli/specdev init                  # Initialize .specs/ structure
${CLAUDE_PLUGIN_ROOT}/specdev-cli/specdev new {name}            # Create new spec with templates
${CLAUDE_PLUGIN_ROOT}/specdev-cli/specdev status                # Show all active specs with progress
${CLAUDE_PLUGIN_ROOT}/specdev-cli/specdev context {spec}        # Show spec context (--level min|standard|full)
${CLAUDE_PLUGIN_ROOT}/specdev-cli/specdev path {spec}           # Analyze task dependencies
${CLAUDE_PLUGIN_ROOT}/specdev-cli/specdev archive {spec}        # Archive completed spec
${CLAUDE_PLUGIN_ROOT}/specdev-cli/specdev validate {path}       # Validate spec completeness
${CLAUDE_PLUGIN_ROOT}/specdev-cli/specdev compact {file}        # Generate token-optimized version
```

All commands output JSON by default. Use `--plain` for human-readable output.

Dependencies auto-install on first run.

### Hooks

The plugin includes automatic hooks:
- **SessionStart** - Shows spec context when starting a session
- **PostToolUse** - Validates tasks.yaml after edits
- **Stop** - Reminds to update checkpoint.md

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

## Development

To work on the CLI:

```bash
cd specdev/specdev-cli
bun install
bun run dev [command]     # Run in development
bun test                  # Run tests
```

## License

MIT
