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

## License

MIT
