# Specification Templates

## Full Specification Template

```markdown
# {Feature Name}

## Overview
{One paragraph summary of the feature}

## Purpose
{Single sentence: What problem does this solve?}

## User Stories

### US-1: {Story Title}
**As a** {role}  
**I want** {capability}  
**So that** {benefit}

#### Acceptance Criteria
- [ ] **AC-1.1:** GIVEN {precondition} WHEN {action} THEN {expected result}
- [ ] **AC-1.2:** GIVEN {precondition} WHEN {action} THEN {expected result}

#### Scenarios
| Scenario | Input | Expected Output |
|----------|-------|-----------------|
| Happy path | {input} | {output} |
| Edge case | {input} | {output} |
| Error case | {input} | {error} |

### US-2: {Story Title}
...

## Functional Requirements

### REQ-F1: {Requirement Name}
The system **SHALL** {required behavior}.

**Rationale:** {Why this is needed}

### REQ-F2: {Requirement Name}
The system **MUST** {mandatory constraint}.

## Non-Functional Requirements

### REQ-NF1: Performance
The system **SHALL** respond within {X}ms for {operation}.

### REQ-NF2: Security
The system **MUST** {security constraint}.

### REQ-NF3: Scalability
The system **SHOULD** support {X} concurrent users.

## Constraints
- {Technical constraint}
- {Business constraint}
- {Regulatory constraint}

## Dependencies
- {External system/API}
- {Upstream feature}
- {Third-party service}

## Out of Scope
- {Explicitly excluded functionality}
- {Future consideration}

## Open Questions
- [ ] {Decision needed: options A vs B}
- [ ] {Clarification needed: {topic}}

## Glossary
| Term | Definition |
|------|------------|
| {term} | {definition} |
```

## Compact Specification Template

For token-constrained contexts (~60% reduction):

```markdown
# {Feature}
{One-line purpose}

## Stories
### US-1: {Title}
AC: [{condition}→{result}] [{condition}→{result}]
REQ: SHALL {behavior}, MUST {constraint}

### US-2: {Title}
AC: [{condition}→{result}]
REQ: SHALL {behavior}

## NFR
- Perf: <{X}ms for {op}
- Scale: {X} concurrent
- Security: {constraint}

## Scope
IN: {included}
OUT: {excluded}

## Open: {questions}
```

## Implementation Plan Template

```markdown
# Implementation Plan: {Feature}

## Summary
{One paragraph technical approach}

## Architecture Decision
**Approach:** {chosen approach}
**Alternatives considered:** {rejected options}
**Rationale:** {why this approach}

## Technology Stack
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| {component} | {tech} | {ver} | {why} |

## Data Model

### New Entities
```
{EntityName}
├── id: UUID (PK)
├── field: Type
├── created_at: Timestamp
└── FK: related_entity_id
```

### Schema Changes
```sql
ALTER TABLE {table} ADD COLUMN {column} {type};
CREATE INDEX {index} ON {table}({column});
```

## API Contracts

### {Endpoint Name}
```
{METHOD} /api/v1/{resource}

Request:
{
  "field": "type"
}

Response (200):
{
  "id": "uuid",
  "field": "value"
}

Errors:
- 400: {validation error}
- 401: {auth error}
- 404: {not found}
```

## Implementation Phases

### Phase 1: Foundation ({estimate})
- {Component 1}
- {Component 2}
**Deliverable:** {what's working at end}

### Phase 2: Core Logic ({estimate})
- {Component 3}
- {Component 4}
**Depends on:** Phase 1
**Deliverable:** {what's working at end}

### Phase 3: Integration ({estimate})
- {Component 5}
**Depends on:** Phase 1, Phase 2
**Deliverable:** {complete feature}

## Testing Strategy
| Level | Scope | Tools |
|-------|-------|-------|
| Unit | {scope} | {tool} |
| Integration | {scope} | {tool} |
| E2E | {scope} | {tool} |

## Risks & Mitigations
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| {risk} | H/M/L | H/M/L | {strategy} |

## Success Criteria
- [ ] All acceptance criteria pass
- [ ] Performance targets met
- [ ] No P0/P1 bugs
- [ ] Documentation updated
```

## Task Breakdown Template

```markdown
# Tasks: {Feature}

## Progress
- Total: {N} tasks
- Complete: {X}
- Remaining: {Y}
- Blocked: {Z}

## Legend
- [ ] Pending  
- [x] Complete
- [P] Parallelizable
- [B] Blocked (see notes)
- [S] Skipped (see rationale)

---

## Phase 1: {Name}

### 1.1 {Task Title}
**Files:** `path/to/file.ext`, `path/to/other.ext`
**Depends:** None
**Estimate:** {time}

- [ ] {Subtask 1}
- [ ] {Subtask 2}
- [ ] Tests: {test description}

**Notes:** {implementation hints}

### 1.2 {Task Title} [P]
**Files:** `path/to/file.ext`
**Depends:** None
**Estimate:** {time}

- [ ] {Subtask 1}
- [ ] Tests: {test description}

---
### ✓ Phase 1 Checkpoint
- [ ] {Validation step 1}
- [ ] {Validation step 2}
- [ ] All Phase 1 tests pass

---

## Phase 2: {Name}

### 2.1 {Task Title}
**Files:** `path/to/file.ext`
**Depends:** 1.1, 1.2
**Estimate:** {time}

- [ ] {Subtask 1}
- [ ] Tests: {test description}

### 2.2 {Task Title} [B]
**Files:** `path/to/file.ext`
**Depends:** 2.1
**Blocked by:** {reason}

- [ ] {Subtask 1}

---
### ✓ Phase 2 Checkpoint
- [ ] Integration tests pass
- [ ] {Feature} functional end-to-end

---

## Final Checklist
- [ ] All tasks complete
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Ready for archive
```

## Change Proposal Template (Brownfield)

```markdown
# Change Proposal: {Name}

## Summary
{One sentence: what is changing}

## Motivation
{Why this change is needed}

## Affected Specs
- `specs/{feature}/spec.md` - {what changes}

## Spec Delta

### ADDED Requirements
#### REQ-{N}: {Name}
The system **SHALL** {new behavior}.

**Acceptance:**
- [ ] {criteria}

### MODIFIED Requirements
#### REQ-{N}: {Name} (was: {previous})
The system **SHALL** {updated behavior}.

**Previous:** {old behavior}
**Rationale:** {why changed}

### REMOVED Requirements
#### REQ-{N}: {Name}
**Rationale:** {why removed}

## Impact Assessment
- **Breaking changes:** {yes/no, details}
- **Migration needed:** {yes/no, details}
- **Rollback plan:** {strategy}

## Tasks
See `tasks.yaml`
```

## Project Configuration Template

```markdown
# Project: {Name}

## Overview
{One paragraph project description}

## Tech Stack
| Layer | Technology | Notes |
|-------|------------|-------|
| Frontend | {tech} | {conventions} |
| Backend | {tech} | {conventions} |
| Database | {tech} | {conventions} |
| Infra | {tech} | {conventions} |

## Conventions

### Code Style
- {Language}: {style guide/linter}
- {Language}: {style guide/linter}

### Naming
- Files: {convention}
- Classes: {convention}
- Functions: {convention}
- Database: {convention}

### Git
- Branch: `{type}/{ticket}-{description}`
- Commit: `{type}({scope}): {message}`

### Testing
- Unit: {framework}, {coverage target}
- Integration: {framework}
- E2E: {framework}

## Architecture Patterns
- {Pattern}: {where/when used}
- {Pattern}: {where/when used}

## Security Requirements
- {Requirement}
- {Requirement}

## Active Features
| Feature | Status | Spec |
|---------|--------|------|
| {name} | {status} | `specs/{name}/` |

## Team Contacts
| Role | Name | For |
|------|------|-----|
| {role} | {name} | {questions about} |
```

## Session Checkpoint Template

```markdown
# Checkpoint: {Feature}
**Session:** {date} {time}
**Duration:** {time spent}

## Progress
- **Completed this session:** {task IDs}
- **Total progress:** {X}/{N} tasks ({%})

## Current State
- **Last completed:** Task {ID}: {title}
- **Next task:** Task {ID}: {title}
- **Blockers:** {none or description}

## Context for Next Session
{Important context that would be lost}
- {Decision made}
- {Approach chosen}
- {Issue encountered}

## Files Modified
- `path/to/file.ext` - {what changed}
- `path/to/file.ext` - {what changed}

## Commands to Resume
```bash
# Load feature context
cat specs/features/{feature}/tasks.yaml

# Check current branch state
git status

# Run tests to verify state
{test command}
```

## Notes
{Any other relevant information}
```
