---
name: spec-driven-dev
description: Specification-driven development workflow for AI agents. Use when tasks are too large for a single session, require multi-step implementation, span multiple files/features, or need persistent requirements tracking. Provides structured specification management with token-optimized artifacts for complex feature development, brownfield modifications, and cross-session continuity.
---

# Spec-Driven Development

Manage complex tasks through structured specifications that persist across sessions.

## Quick Start

```
NEW SPEC:   spec new {name} → edit spec.md → plan.md → tasks.yaml
RESUME:     spec status → spec context {spec} --level min → implement
BLOCKED:    AskUserQuestion (decisions) | Explore agent (context)
COMPLETE:   spec status → spec archive {spec}
```

## Session Entry

| Situation | Action |
|-----------|--------|
| First time on spec | `spec context {spec} --level full` |
| Familiar, continuing | `spec context {spec} --level min` |
| Multiple specs active | `spec status` → pick one |
| Spec 100% complete | `spec archive {spec}` |

## Directory Structure

```
.specs/
├── project.md           # Project conventions, stack
├── active/{spec}/       # Active specifications
│   ├── spec.md          # Requirements (WHAT)
│   ├── plan.md          # Technical approach (HOW)
│   ├── tasks.yaml       # Task breakdown (WHEN)
│   └── checkpoint.md    # Session progress (optional)
└── archived/{spec}/     # Completed specs
```

## Workflow Phases

### Phase 1: Specification
Create `.specs/active/{spec}/spec.md`:
- [ ] Purpose (1 line)
- [ ] User Stories (AS/WANT/SO THAT + acceptance criteria)
- [ ] Requirements (SHALL/MUST/SHOULD per RFC 2119)
- [ ] Out of Scope (explicit boundaries)

Use `AskUserQuestion` to clarify ambiguities before writing.
Template: `references/spec-template.md`

### Phase 2: Planning
Create `.specs/active/{spec}/plan.md`:
- [ ] Explore codebase first (`Task` with `subagent_type=Explore`)
- [ ] Technical approach + rationale
- [ ] Stack/dependencies
- [ ] Implementation phases with checkpoints

Template: `references/plan-template.md`

### Phase 3: Task Breakdown
Create `.specs/active/{spec}/tasks.yaml`:
- [ ] Break into phases with checkpoints
- [ ] Each task: 1-2 files, <100 lines, clear done criteria
- [ ] Mark dependencies explicitly
- [ ] Include file paths for context loading

Template: `references/tasks-template.md`

### Phase 4: Implementation
```bash
spec status                        # Overview
spec context {spec} --level min    # Get current task
# Read files, implement, test
# Edit tasks.yaml → set done: true
```

Use `Explore` agent for broader context. Use `AskUserQuestion` when blocked.

### Phase 5: Archive
```bash
spec status          # Verify 100% / "ready to archive"
spec archive {spec}  # Move to .specs/archived/
```

## Brownfield Changes

For modifications to existing behavior, create `delta.md` showing only changes:

```markdown
## ADDED
### REQ-5: Two-Factor Auth
The system MUST require OTP on login.

## MODIFIED
### REQ-2: Session Duration (was: 24h)
The system SHALL expire sessions after 1h of inactivity.

## REMOVED
### REQ-3: Remember Me
Deprecated in favor of REQ-5.
```

## CLI Reference

| Command | Description |
|---------|-------------|
| `spec init` | Initialize `.specs/` structure |
| `spec new {name}` | Create new spec with templates |
| `spec status` | All active specs with progress |
| `spec context {spec}` | Task context (`--level min\|standard\|full`) |
| `spec archive {spec}` | Move completed spec to archived/ |
| `spec validate {path}` | Check spec completeness |

All commands output JSON. Use `-q` for minimal output.

### Context Levels

| Level | Use When | Includes |
|-------|----------|----------|
| `min` | Familiar spec, tight context | Task ID, title, files |
| `standard` | Default | + subtasks, progress, checkpoint |
| `full` | First time, planning | + all phases, notes, dependencies |

## Hooks (Automatic)

- **SessionStart**: Shows spec context when `.specs/active/` exists
- **PostToolUse**: Validates tasks.yaml after edits
- **Stop**: Reminds to update checkpoint.md

## Tool Usage

| Tool | When |
|------|------|
| `AskUserQuestion` | Clarify requirements, get decisions |
| `Explore` agent | Understand codebase, find patterns |
| `Plan` agent | Design complex implementation approach |

**Principle:** Ask early, explore thoroughly. See `references/patterns.md` for best practices.
