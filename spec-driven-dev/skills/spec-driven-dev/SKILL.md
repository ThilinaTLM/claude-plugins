---
name: spec-driven-dev
description: Specification-driven development workflow for AI agents. Use when tasks are too large for a single session, require multi-step implementation, span multiple files/features, or need persistent requirements tracking. Provides structured specification management with token-optimized artifacts for complex feature development, brownfield modifications, and cross-session continuity.
---

# Spec-Driven Development

Manage complex development tasks through structured specifications that persist across sessions and minimize context overhead.

## Prerequisites

Install the `spec` CLI:

```bash
curl -fsSL https://raw.githubusercontent.com/tlmtech/claude-plugins/main/spec-cli/install.sh | bash
```

This installs the `spec` command to `~/.local/bin/`.

## When to Use

- Feature too large for single chat session
- Multiple implementation phases required
- Cross-cutting changes spanning multiple files
- Need to track requirements/progress across sessions
- Brownfield changes to existing behavior

## Core Workflow

1. **Spec** → Define requirements (WHAT, not HOW)
2. **Plan** → Technical approach (architecture, stack)
3. **Tasks** → Actionable breakdown with dependencies
4. **Implement** → Execute tasks with validation
5. **Archive** → Update specs, close feature

## Directory Structure

```
.specs/
├── project.md           # Project-level conventions, stack, patterns
├── active/              # Active specifications (source of truth)
│   └── {spec-name}/
│       ├── spec.md      # Requirements + acceptance criteria
│       ├── plan.md      # Technical implementation plan
│       ├── tasks.yaml   # Task breakdown (YAML format)
│       └── design.md    # Architecture decisions (optional)
└── archived/            # Completed specs
    └── {spec-name}/     # Same structure as active/
```

## Phase 1: Specification

Create `.specs/active/{spec}/spec.md`:

```markdown
# {Feature Name}

## Purpose
One-line description of what this delivers.

## User Stories
### US-1: {Story Title}
AS A {role} I WANT {capability} SO THAT {benefit}

#### Acceptance Criteria
- [ ] GIVEN {context} WHEN {action} THEN {outcome}
- [ ] ...

## Requirements
### REQ-1: {Requirement}
The system SHALL {behavior}.

### REQ-2: {Requirement}
The system MUST {constraint}.

## Out of Scope
- {Explicitly excluded items}

## Open Questions
- [ ] {Unresolved decisions}
```

**Key principles:**
- Focus on WHAT, not HOW
- Be explicit about boundaries
- One user story = one testable unit
- Use SHALL/MUST/SHOULD per RFC 2119

**Clarifying requirements:** Use the `AskUserQuestion` tool to resolve ambiguities before writing specs. Common clarifications:
- User roles and permissions model
- Edge cases and error scenarios
- Priority between conflicting requirements
- Scope boundaries (what's explicitly out)

## Phase 2: Planning

Create `.specs/active/{spec}/plan.md`:

```markdown
# Implementation Plan: {Feature}

## Technical Approach
{High-level architecture decision and rationale}

## Stack/Dependencies
- {framework}: {version} - {purpose}
- {library}: {version} - {purpose}

## Data Model
{Schema changes, new models}

## API Contracts
{Endpoint definitions, request/response shapes}

## Implementation Phases
### Phase 1: {Name}
{Description and components}

### Phase 2: {Name}
{Dependencies on Phase 1}

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| {risk} | {H/M/L} | {strategy} |
```

**Before planning:**

1. **Explore the codebase** using the `Task` tool with `subagent_type=Explore` to understand:
   - Existing patterns and conventions
   - Related components and their interfaces
   - Current architecture and data flow
   - Files that will be affected

2. **Surface ambiguities** by reviewing:
   - Authentication/authorization model
   - Error handling strategy
   - Performance constraints
   - Integration boundaries

Use `AskUserQuestion` if exploration reveals architectural decisions that need user input.

## Phase 3: Task Breakdown

Create `.specs/active/{spec}/tasks.yaml`:

```yaml
feature: feature-name

phases:
  - id: 1
    name: Phase Name
    checkpoint: Validation criteria before Phase 2
    tasks:
      - id: "1.1"
        title: Task Title
        files: [src/file.ts]
        depends: []
        notes: Implementation hints
        subtasks:
          - text: Implementation
            done: false
          - text: Tests
            done: false

      - id: "1.2"
        title: Task Title
        files: [src/other.ts]
        depends: []
        parallel: true
        subtasks:
          - text: Implementation
            done: false
          - text: Tests
            done: false

  - id: 2
    name: Phase Name
    tasks:
      - id: "2.1"
        title: Task Title
        files: [src/file.ts]
        depends: ["1.1", "1.2"]
        subtasks:
          - text: Implementation
            done: false
          - text: Tests
            done: false
```

**Task granularity:**
- Each task: 1-2 files, <100 lines changed
- Include file paths for context loading
- Mark dependencies explicitly
- Group by functional area

## Phase 4: Implementation

Execute tasks sequentially:

```bash
# 1. Get files to load
spec next {spec} --filesOnly

# 2. Read files and implement changes

# 3. Run tests/validation

# 4. Mark complete
spec mark {spec} {task-id} -q
```

For broader context, use `Task` with `subagent_type=Explore` to understand related code.

**Session continuity:**
```bash
spec summary {spec} -q          # Quick orientation
spec path {spec} -q             # Check what's parallelizable/blocked
spec next {spec} --context min  # Get next task (familiar spec)
```

**When blocked:** Use `AskUserQuestion` to get user input on implementation decisions rather than making assumptions.

## Phase 5: Archive

When spec is complete:

```bash
# 1. Verify completion
spec summary {spec} -q          # Check allComplete: true

# 2. Archive
spec archive {spec}             # Move to .specs/archived/
```

3. Update project.md if conventions changed

## Token Optimization

### Spec Loading Strategy

**Always load** (minimal context):
- project.md (conventions only)
- tasks.yaml (current phase only)

**Load on demand:**
- spec.md → When clarifying requirements
- plan.md → When making technical choices
- design.md → When architecting

### Compact Spec Format

For token-constrained contexts, use compact notation:

```markdown
## US-1: User Login
AC: [valid-creds→JWT] [invalid→401] [lockout@5-fails]
REQ: SHALL issue JWT on success, MUST hash passwords bcrypt
```

### Progress Checkpoints

Save progress atomically:

```markdown
<!-- .specs/active/{spec}/checkpoint.md -->
## Session: {date}
- Completed: 1.1, 1.2, 1.3
- Next: 2.1
- Blockers: None
- Notes: {Context for next session}
```

## Brownfield Changes

For modifications to existing behavior:

1. Create spec in `.specs/active/{name}/` with a `delta.md` for changes
2. Spec delta shows ONLY changes:

```markdown
## ADDED Requirements
### REQ-5: Two-Factor Auth
The system MUST require OTP on login.

## MODIFIED Requirements
### REQ-2: Session Duration (was: 24h)
The system SHALL expire sessions after 1h of inactivity.

## REMOVED Requirements
### REQ-3: Remember Me
Deprecated in favor of REQ-5.
```

3. Tasks reference both existing code AND spec delta
4. Archive when complete: `spec archive {name}`

## CLI Commands

| Command | Description |
|---------|-------------|
| `spec init` | Initialize `.specs/` structure with project.md |
| `spec new {name}` | Create new spec in `.specs/active/{name}/` with templates |
| `spec status` | Show all specs and their progress |
| `spec summary {spec}` | Compact overview for context priming (phase, progress, current/next task) |
| `spec resume {spec}` | Show progress + next task + checkpoint context |
| `spec next {spec}` | Show only next task (minimal output for AI) |
| `spec path {spec}` | Critical path analysis, parallelizable tasks, blocked tasks |
| `spec mark {spec} {task-id}` | Mark task/subtask complete |
| `spec archive {spec}` | Archive a completed spec to `.specs/archived/` |
| `spec validate {path}` | Check spec completeness, task coverage, dependencies |
| `spec compact {file} [-o out]` | Generate token-optimized version |

### CLI Integration Patterns

All commands output JSON by default. Use `-q` for minimal output, `--plain` for human-readable.

**Session Start (minimal context):**
```bash
spec summary {spec} -q          # Quick orientation: phase, progress, current task
spec path {spec} -q             # Check dependencies before starting work
```

**Task Implementation:**
```bash
spec next {spec} --filesOnly    # Get just file paths to load
spec next {spec} --context min  # Task ID + files (familiar spec)
spec next {spec} --context full # Full details + notes (unfamiliar task)
```

**Progress Updates:**
```bash
spec mark {spec} {task-id} -q            # Mark all subtasks complete
spec mark {spec} {task-id} --subtask 0   # Mark first subtask only
```

**Session End / Checkpoint:**
```bash
spec resume {spec} --since last          # Get changes since last checkpoint
spec summary {spec} -q                   # Check if allComplete: true
spec archive {spec}                      # Archive when complete
```

### Context Level Reference

| Situation | Command | Output |
|-----------|---------|--------|
| Quick status check | `spec summary -q` | Single-line JSON: phase, percent, current task |
| Get files to load | `spec next --filesOnly` | Just `{"files": [...]}` |
| Unfamiliar task | `spec next --context full` | Full task + notes + all subtasks |
| Continuing work | `spec next --context min` | Just task ID, title, files |
| Check blocking | `spec path -q` | Critical path + parallelizable tasks |
| Session handoff | `spec resume --context standard` | Balanced detail for next session |
| Checkpoint data | `spec resume --since last` | Diff since last checkpoint |

## Tool Usage

| Tool | When to Use |
|------|-------------|
| `AskUserQuestion` | Clarify requirements, resolve ambiguities, get decisions on implementation choices |
| `Task` with `subagent_type=Explore` | Understand existing codebase, find patterns, discover affected files |
| `Task` with `subagent_type=Plan` | Design implementation approach for complex phases |

**Principle:** Ask early, explore thoroughly. Use `AskUserQuestion` before making assumptions about requirements. Use `Explore` agents before planning to understand what exists.

## Best Practices

1. **Spec first** - Never implement without written requirements
2. **Small tasks** - Each task fits in one context window
3. **Explicit dependencies** - Mark what blocks what
4. **Checkpoint often** - Save progress every 2-3 tasks
5. **Compact for continuation** - Use token-optimized format between sessions
6. **Separate concerns** - Spec (what) vs Plan (how) vs Tasks (when)
7. **Version specs** - Use git, specs are source of truth

## Quick Reference

```
SESSION START:      spec summary {spec} -q
CHECK DEPENDENCIES: spec path {spec} -q
GET TASK FILES:     spec next {spec} --filesOnly
FULL TASK CONTEXT:  spec next {spec} --context full
MARK COMPLETE:      spec mark {spec} {id} -q
CHECKPOINT DATA:    spec resume {spec} --since last
VERIFY COMPLETION:  spec summary {spec} -q  (check allComplete)
ARCHIVE:            spec archive {spec}
```
