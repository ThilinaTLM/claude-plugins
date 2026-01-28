---
name: pgtool
description: PostgreSQL database exploration and debugging. Use when user asks to explore database schemas, tables, columns, or run queries. Requires a `.pgtool.json` file in the project directory.
---

# PostgreSQL

## Overview

A CLI tool for exploring and debugging PostgreSQL databases with JSON-first output designed for AI agents.

## Scripts

- Unix/Linux/macOS: `${CLAUDE_PLUGIN_ROOT}/pgtool-cli/pgtool`
- Windows PowerShell: `${CLAUDE_PLUGIN_ROOT}/pgtool-cli/pgtool.ps1`
- Windows Git Bash: Use `pgtool` (bash script)

For setup instructions, see SETUP.md in this directory.

## Commands

### List Schemas

```bash
${CLAUDE_PLUGIN_ROOT}/pgtool-cli/pgtool schemas
```

Output: `{"ok":true,"schemas":[{"name":"public","owner":"postgres"}]}`

### List Tables

```bash
# Tables in default schema
${CLAUDE_PLUGIN_ROOT}/pgtool-cli/pgtool tables

# Tables in a specific schema
${CLAUDE_PLUGIN_ROOT}/pgtool-cli/pgtool tables auth
```

Output: `{"ok":true,"schema":"public","tables":[{"name":"users","type":"table","rowEstimate":1000,"sizeHuman":"256 KB"}]}`

### Describe Table

Get column details with primary key and foreign key information.

```bash
# Table in default schema
${CLAUDE_PLUGIN_ROOT}/pgtool-cli/pgtool describe users

# Table in specific schema
${CLAUDE_PLUGIN_ROOT}/pgtool-cli/pgtool describe auth.users
```

Output includes column types, nullability, defaults, PK/FK info, and foreign key references.

### List Indexes

```bash
${CLAUDE_PLUGIN_ROOT}/pgtool-cli/pgtool indexes users
```

Output: `{"ok":true,"indexes":[{"name":"users_pkey","unique":true,"primary":true,"columns":["id"],"type":"btree"}]}`

### List Constraints

```bash
${CLAUDE_PLUGIN_ROOT}/pgtool-cli/pgtool constraints users
```

Output includes PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK, and EXCLUDE constraints.

### List Relationships

Get all foreign key relationships in a schema.

```bash
${CLAUDE_PLUGIN_ROOT}/pgtool-cli/pgtool relationships
${CLAUDE_PLUGIN_ROOT}/pgtool-cli/pgtool relationships auth
```

Output: `{"ok":true,"relationships":[{"fromTable":"orders","fromColumns":["user_id"],"toTable":"users","toColumns":["id"]}]}`

### Execute Query

```bash
${CLAUDE_PLUGIN_ROOT}/pgtool-cli/pgtool query "SELECT * FROM users WHERE active = true"

# With custom limit
${CLAUDE_PLUGIN_ROOT}/pgtool-cli/pgtool query "SELECT * FROM users" --limit 50
```

Output: `{"ok":true,"rows":[...],"rowCount":5,"fields":["id","name","email"]}`

**Note:** Queries without LIMIT get `LIMIT 100` added automatically for safety.

## Common Usage Patterns

**Exploring a new database:**
1. `pgtool schemas` - See available schemas
2. `pgtool tables <schema>` - List tables in each schema
3. `pgtool describe <table>` - Understand table structures
4. `pgtool relationships` - See how tables connect

**Debugging data issues:**
1. `pgtool describe <table>` - Verify column types
2. `pgtool query "SELECT..."` - Inspect data
3. `pgtool indexes <table>` - Check index coverage

**Understanding relationships:**
1. `pgtool relationships` - Get all FK relationships
2. `pgtool constraints <table>` - See specific table constraints
