---
name: specdev
description: Specification-driven development workflow for AI agents. Use when tasks are too large for a single session, require multi-step implementation, span multiple files/features, or need persistent requirements tracking. Provides structured specification management with token-optimized artifacts for complex feature development, brownfield modifications, and cross-session continuity.
---

# Spec-Driven Development

## Overview

A CLI tool for managing structured specifications that persist across sessions, with JSON-first output designed for AI agents.

## Scripts

The `specdev` CLI location varies by environment:

| Environment | Path |
|-------------|------|
| Claude Code plugins | `${CLAUDE_PLUGIN_ROOT}/skills/specdev/scripts/specdev-cli/specdev` |
| Vercel Skills (claude.ai) | `/mnt/skills/user/specdev/scripts/specdev-cli/specdev` |
| Windows PowerShell | Use `.ps1` extension |

## Commands

### Initialize Specs Directory

```bash
specdev init
```

Output: `{"ok":true,"created":[".specs/project.md",".specs/active/",".specs/archived/"]}`

### Create New Spec

```bash
specdev new auth-feature
```

Output: `{"ok":true,"spec":"auth-feature","created":["spec.md","plan.md","tasks.yaml"],"path":".specs/active/auth-feature"}`

### Show Status

```bash
specdev status
```

Output:
```json
{
  "ok": true,
  "specs": [
    {"name": "auth-feature", "progress": "3/5 (60%)", "phase": "implementation", "nextTask": "T3"}
  ]
}
```

### Get Context

Get current task context for implementation. Levels: `min` (tight context), `standard` (default), `full` (first time/planning).

```bash
# Minimal context (familiar spec)
specdev context auth-feature --level min

# Full context (first time on spec)
specdev context auth-feature --level full
```

Output (min): `{"ok":true,"spec":"auth-feature","task":{"id":"T3","title":"Add JWT validation","files":["src/auth.ts"]}}`

Output (full): Includes all phases, notes, dependencies, and checkpoint.

### Get Spec Path

```bash
specdev path auth-feature
```

Output: `{"ok":true,"spec":"auth-feature","path":".specs/active/auth-feature"}`

### Archive Completed Spec

```bash
specdev archive auth-feature
```

Output: `{"ok":true,"spec":"auth-feature","from":".specs/active/auth-feature","to":".specs/archived/auth-feature"}`

### Validate Spec

```bash
specdev validate .specs/active/auth-feature
```

Output: `{"ok":true,"valid":true,"files":{"spec.md":true,"plan.md":true,"tasks.yaml":true}}`

### Compact File

Token-optimized version for context loading (~60% reduction).

```bash
specdev compact .specs/active/auth-feature/tasks.yaml
```

Output: `{"ok":true,"original":1200,"compacted":480,"reduction":"60%","content":"..."}`

## Directory Structure

```
.specs/
├── project.md           # Project conventions, stack
├── active/{spec}/       # Active specifications
│   ├── spec.md          # Requirements (WHAT)
│   ├── plan.md          # Technical approach (HOW)
│   └── tasks.yaml       # Task breakdown (WHEN)
└── archived/{spec}/     # Completed specs
```

## Common Usage Patterns

**Starting a new feature:**
1. `specdev init` - Initialize .specs/ if needed
2. `specdev new {name}` - Create spec structure
3. Edit `spec.md` → `plan.md` → `tasks.yaml`
4. Use `AskUserQuestion` to clarify ambiguities

**Resuming work:**
1. `specdev status` - See all active specs
2. `specdev context {spec} --level min` - Get current task
3. Read files, implement, test
4. Edit tasks.yaml → set `done: true`

**Completing a spec:**
1. `specdev status` - Verify 100% complete
2. `specdev archive {spec}` - Move to archived/

**Brownfield changes:**
- Create `delta.md` showing ADDED/MODIFIED/REMOVED sections
- Reference existing requirements by ID

## Error Responses

All errors follow a consistent JSON format:

```json
{
  "ok": false,
  "error": "Spec not found",
  "code": "SPEC_NOT_FOUND",
  "hint": "Check spec name with 'specdev status'"
}
```

**Error codes:** `SPEC_NOT_FOUND`, `ALREADY_EXISTS`, `NOT_INITIALIZED`, `VALIDATION_FAILED`, `PREREQ_MISSING`

## Hooks (Automatic)

- **SessionStart**: Shows spec context when `.specs/active/` exists
- **PostToolUse**: Validates tasks.yaml after edits
- **Stop**: Reminds to update checkpoint.md

## Tool Integration

| Tool | When |
|------|------|
| `AskUserQuestion` | Clarify requirements, get decisions |
| `Explore` agent | Understand codebase, find patterns |
| `Plan` agent | Design complex implementation approach |

## References

Templates and patterns available in `references/` directory:
- `spec-template.md` - Specification format
- `plan-template.md` - Planning format
- `tasks-template.md` - Task breakdown format
- `patterns.md` - Best practices
