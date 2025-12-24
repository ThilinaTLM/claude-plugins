# Implementation Plan: {Feature Name}

## Summary
<!-- One paragraph technical approach -->

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
-- Migration: {description}
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
- 400: Validation error
- 401: Unauthorized
- 404: Not found
```

## Implementation Phases

### Phase 1: {Name} ({estimate})
- {Component 1}
- {Component 2}

**Deliverable:** {what's working at end}

### Phase 2: {Name} ({estimate})
- {Component 3}

**Depends on:** Phase 1  
**Deliverable:** {what's working at end}

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
