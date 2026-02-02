# specdev

Specification-driven development workflow for AI agents managing complex, multi-session software development tasks.

## Installation

### Claude Code

```bash
/plugin marketplace add ThilinaTLM/agent-skills
/plugin install specdev@tlmtech
```

### Other Tools

```bash
npx skills add ThilinaTLM/agent-skills/specdev
```

## Prerequisites

- [Bun runtime](https://bun.sh) - CLI runs via Bun with auto-dependency installation

## Features

- **Structured specifications** - Define requirements (WHAT) separately from implementation (HOW)
- **Task tracking** - YAML-based task breakdown with dependencies and progress tracking
- **Cross-session continuity** - Resume work seamlessly across multiple sessions
- **Token optimization** - Compact notation reduces context usage
- **JSON-first output** - All commands output JSON by default for AI consumption

## Workflow

1. **Spec** - Define requirements in `.specs/active/{spec}/spec.md`
2. **Plan** - Create technical approach in `plan.md`
3. **Tasks** - Break down into actionable items in `tasks.yaml`
4. **Implement** - Execute tasks with validation
5. **Archive** - Move completed specs to `.specs/archived/`

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

## CLI Commands

All commands output JSON by default. Use `--plain` for human-readable output.

| Command                   | Description                                      |
| ------------------------- | ------------------------------------------------ |
| `specdev init`            | Initialize `.specs/` structure                   |
| `specdev new <name>`      | Create new spec with templates                   |
| `specdev list`            | List all active specs and progress               |
| `specdev context [spec]`  | Show spec context for AI consumption             |
| `specdev path [spec]`     | Analyze task dependencies and show critical path |
| `specdev archive <spec>`  | Move completed spec to `.specs/archived/`        |
| `specdev validate <path>` | Check spec file completeness                     |
| `specdev hook <event>`    | Hook handlers for Claude Code integration        |

### Global Options

| Option              | Description                                   |
| ------------------- | --------------------------------------------- |
| `--root, -r <path>` | Project root directory (default: auto-detect) |
| `--plain`           | Human-readable output instead of JSON         |

### Command Options

| Command    | Option                | Description                                   |
| ---------- | --------------------- | --------------------------------------------- |
| `context`  | `--level, -l <level>` | Context detail: min, standard (default), full |
| `archive`  | `--force, -f`         | Archive even if not 100% complete             |
| `archive`  | `--quiet, -q`         | Minimal output                                |
| `path`     | `--quiet, -q`         | Minimal output (critical path only)           |
| `list`     | `--quiet, -q`         | Minimal output                                |
| `new`      | `--quiet, -q`         | Minimal output                                |
| `validate` | `--quiet, -q`         | Minimal output (pass/fail + error count)      |

## License

MIT
