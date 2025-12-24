# Token Optimization Patterns

Strategies for minimizing token usage while maintaining specification quality.

## Context Loading Hierarchy

### Priority 1: Always Load (~200 tokens)
```
project.md    → Tech stack, conventions (summary only)
tasks.yaml    → Current phase tasks only
checkpoint.md → Last session state
```

### Priority 2: On-Demand
```
spec.md   → When requirement questions arise
plan.md   → When making architectural decisions  
design.md → When deep technical decisions needed
```

### Priority 3: Never Load Fully
```
Full spec history → Use git blame instead
Completed phases  → Already done, not needed
Archive/          → Historical only
```

## Compact Notation System

### Acceptance Criteria Shorthand

Full form (45 tokens):
```markdown
#### Acceptance Criteria
- [ ] **AC-1.1:** GIVEN the user is logged in WHEN they click logout THEN the session is terminated and they are redirected to the login page
```

Compact form (12 tokens):
```markdown
AC: [logged-in + click-logout → session-end + redirect-login]
```

### Requirements Shorthand

Full form (30 tokens):
```markdown
### REQ-F1: Session Timeout
The system **SHALL** automatically terminate user sessions after 30 minutes of inactivity.
```

Compact form (10 tokens):
```markdown
REQ: SHALL timeout sessions @ 30min inactive
```

### Multiple Conditions

```markdown
# Full (~80 tokens)
- GIVEN valid credentials WHEN login submitted THEN issue JWT
- GIVEN invalid credentials WHEN login submitted THEN return 401
- GIVEN account locked WHEN login submitted THEN return 403 with unlock time

# Compact (~20 tokens)
AC: [valid-creds→JWT] [invalid→401] [locked→403+unlock-time]
```

## Spec Compression Script

Transform verbose specs to compact format:

```python
# Input: Full spec.md
# Output: Compact version with ~60% token reduction

Compression rules:
1. User stories → "US-{N}: {title}\nAC: [{shorthand}]"
2. Requirements → "REQ: {keyword} {core behavior}"
3. Remove all "The system" preambles
4. Remove rationale (reference full spec if needed)
5. Tables → Inline key:value
6. Lists → Comma-separated inline
```

## Progressive Spec Loading

### For New Sessions
```
1. Load checkpoint.md (last state)
2. Load tasks.yaml (current phase only)
3. Load files[] from next task
4. Defer: spec.md, plan.md until needed
```

### For Implementation
```
1. Task definition only
2. File paths to load
3. Relevant code sections
4. Skip: other tasks, completed phases
```

### For Clarification
```
1. Load spec.md (full requirements)
2. Load relevant user stories
3. Skip: plan.md, tasks.yaml
```

## File Sectioning

### Large Spec Files

Instead of loading entire spec.md, use line ranges:

```yaml
# In tasks.yaml - reference spec sections in notes
- id: "2.1"
  title: Implement Auth
  notes: "Context: spec.md:45-67 (Auth requirements only)"
  files: [auth/handler.py]
```

### Code Context

Only load relevant sections:
```
# Bad: Load entire 500-line file
cat src/services/user_service.py

# Good: Load relevant function only
sed -n '45,67p' src/services/user_service.py
```

## Checkpoint Optimization

### Minimal Checkpoint (Target: <100 tokens)
```markdown
## {date}
Done: 1.1-1.3 | Next: 2.1 | Block: none
Note: Using Redis for cache (decided)
```

### What to Include
- Task IDs completed
- Next task ID
- Blockers (brief)
- Key decisions made
- Non-obvious context

### What to Exclude
- Full task descriptions (in tasks.yaml)
- Code snippets (in git)
- Rationale for decisions (in design.md)

## Delta-Only Changes

For brownfield work, never duplicate unchanged specs:

```markdown
# Bad: Repeat entire spec with changes
[Full 200-line spec with 3 lines changed]

# Good: Delta only
## MODIFIED: REQ-3 (Session Timeout)
- Was: 24h timeout
- Now: 1h inactive timeout
- Rationale: Security audit finding
```

## Task Reference Pattern

Instead of embedding context, reference it:

```markdown
# Bad (High tokens)
### Task 2.1: Implement User Registration
The user registration endpoint should accept email and password,
validate email format using RFC 5322, hash password with bcrypt
cost factor 12, store in users table, and return JWT...

# Good (Low tokens)
### Task 2.1: Implement User Registration
**Spec:** spec.md:REQ-1, REQ-4
**Contract:** plan.md:API-1
**Files:** auth/register.py, tests/test_register.py
```

## Context Window Budget

For a ~100K token context, budget allocation:

```
System prompt:     ~10K (fixed)
Conversation:      ~30K (grows with session)
Spec context:      ~10K (budget for specs)
Code context:      ~40K (files being edited)
Reserve:           ~10K (responses, tool output)
```

### Spec Budget Breakdown (~10K)
```
project.md:        ~500  (conventions summary)
checkpoint.md:     ~100  (last state)
tasks.yaml:        ~500  (current phase)
spec.md (partial): ~2K   (relevant sections)
plan.md (partial): ~1K   (relevant sections)
────────────────────────
Typical use:       ~4K
Buffer:            ~6K   (for expansion when needed)
```

## Caching Patterns

### KV-Cache Optimization

Keep context prefix stable for cache hits:

```
[STABLE PREFIX - Cached]
System prompt
Project conventions
Spec preamble

[VARIABLE SUFFIX - Not cached]
Current task
User message
Recent changes
```

### Session-to-Session

Store in checkpoint for fast resume:
```markdown
## Cache Keys
- Current branch: feature/auth
- Last commit: abc123
- Test state: all passing
- Open files: auth/handler.py:45
```

## Anti-Patterns

### Token Waste Patterns to Avoid

1. **Full spec every turn** - Use progressive loading
2. **Repeated rationale** - State once in design.md
3. **Verbose examples** - Use compact notation
4. **Complete file loads** - Use line ranges
5. **History in context** - Use git, not spec files
6. **Duplicate info** - Single source of truth
7. **Unused phases** - Load current phase only

### Recovery from Bloated Context

If context becomes too large mid-session:

```
1. Save checkpoint.md with current state
2. Clear conversation (start fresh turn)
3. Load only: checkpoint + current task + required files
4. Continue from saved state
```
