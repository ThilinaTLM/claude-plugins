# specdev

A Claude Code plugin for specification-driven development. It helps AI agents manage complex, multi-session software tasks by breaking them into structured specs, plans, and trackable tasks.

## What Can It Do?

- **Structure large projects** — Break complex work into specs with requirements, plans, and tasks
- **Track progress across sessions** — Resume where you left off with persistent task state
- **Manage dependencies** — Analyze task dependencies and find the critical path
- **Validate completeness** — Check that specs and plans meet required structure
- **Archive finished work** — Move completed specs out of the active workspace

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

## Setup

After installing the plugin, just ask your AI agent to start a spec (e.g. "create a spec for user authentication" or "let's plan out the new API"). The agent will initialize the `.specs/` directory if needed and guide you through defining requirements, creating a plan, and breaking work into tasks.

No manual setup is needed.

## Workflow

1. **Spec** — Define requirements in `.specs/active/{spec}/spec.md`
2. **Plan** — Create technical approach in `plan.md`
3. **Tasks** — Break down into actionable items in `tasks.yaml`
4. **Implement** — Execute tasks with validation
5. **Archive** — Move completed specs to `.specs/archived/`

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
