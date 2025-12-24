# Tasks: {Feature Name}

## Progress
- Total: {N} tasks
- Complete: 0
- Remaining: {N}

## Legend
- [ ] Pending  
- [x] Complete
- [P] Can run in parallel
- [B] Blocked (see notes)

---

## Phase 1: {Phase Name}

### 1.1 {Task Title}
**Files:** `path/to/file.ext`
**Depends:** None
**Estimate:** {time}

- [ ] {Subtask}
- [ ] Tests: {test description}

**Notes:** {implementation hints}

### 1.2 {Task Title} [P]
**Files:** `path/to/file.ext`
**Depends:** None

- [ ] {Subtask}
- [ ] Tests: {test description}

---
### ✓ Phase 1 Checkpoint
- [ ] {Validation criteria}
- [ ] All Phase 1 tests pass

---

## Phase 2: {Phase Name}

### 2.1 {Task Title}
**Files:** `path/to/file.ext`
**Depends:** 1.1, 1.2

- [ ] {Subtask}
- [ ] Tests: {test description}

---
### ✓ Phase 2 Checkpoint
- [ ] {Validation criteria}
- [ ] Feature functional end-to-end

---

## Final Checklist
- [ ] All tasks complete
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Ready for archive
