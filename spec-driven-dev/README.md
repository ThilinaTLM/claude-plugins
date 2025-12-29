# spec-driven-dev

A Claude Code plugin for specification-driven development workflow. Designed for AI agents managing complex, multi-session software development tasks.

**Version:** 1.0.0

## Features

- **Structured specifications** - Define requirements (WHAT) separately from implementation (HOW)
- **Task tracking** - YAML-based task breakdown with dependencies and progress tracking
- **Cross-session continuity** - Resume work seamlessly across multiple sessions
- **Token optimization** - Compact notation reduces context usage by ~60%
- **Auto-detection** - CLI automatically finds project root from any subdirectory
- **JSON-first output** - All commands output JSON by default for AI consumption

## Installation

### 1. Install the CLI

**Linux/macOS:**
```bash
curl -fsSL https://raw.githubusercontent.com/tlmtech/claude-plugins/main/spec-cli/install.sh | bash
```

**Windows (PowerShell):**
```powershell
irm https://raw.githubusercontent.com/tlmtech/claude-plugins/main/spec-cli/install.ps1 | iex
```

**Windows (Git Bash):**
```bash
curl -fsSL https://raw.githubusercontent.com/tlmtech/claude-plugins/main/spec-cli/install.sh | bash
```

This installs the `spec` command to `~/.local/bin/` (or `%USERPROFILE%\.local\bin\` on Windows).

### 2. Install the Plugin

```bash
claude plugins add /path/to/spec-driven-dev
```

## Usage

The plugin provides:

1. **Skill** - Workflow guidance loaded into Claude Code context
2. **CLI** - Command-line tool for spec management (installed separately)

### CLI Commands

```bash
spec init                  # Initialize .specs/ structure
spec new {name}            # Create new spec with templates
spec context {spec}        # Show spec context (--level min|standard|full)
spec path {spec}           # Analyze task dependencies
spec archive {spec}        # Archive completed spec
spec validate {path}       # Validate spec completeness
spec compact {file}        # Generate token-optimized version
```

All commands output JSON by default. Use `--plain` for human-readable output.

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

## License

MIT
