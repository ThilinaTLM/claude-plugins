# pgtool

PostgreSQL database exploration and debugging for AI agents.

## Installation

### Claude Code

```bash
/plugin marketplace add ThilinaTLM/agent-skills
/plugin install pgtool@tlmtech
```

### Other Tools

```bash
npx skills add ThilinaTLM/agent-skills/pgtool
```

## Configuration

Create a `.pgtool.json` file in your project root:

```json
{
  "host": "localhost",
  "port": 5432,
  "database": "mydb",
  "user": "postgres",
  "password": "your_password"
}
```

| Field         | Required | Description                              |
| ------------- | -------- | ---------------------------------------- |
| `host`        | Yes      | Database hostname                        |
| `port`        | No       | Port (default: 5432)                     |
| `database`    | Yes      | Database name                            |
| `user`        | Yes      | Username                                 |
| `password`    | One of   | Direct password                          |
| `passwordEnv` | One of   | Environment variable containing password |
| `schema`      | No       | Default schema (default: public)         |

**Using environment variable for password:**

```json
{
  "host": "localhost",
  "database": "mydb",
  "user": "postgres",
  "passwordEnv": "PGPASSWORD"
}
```

```bash
export PGPASSWORD=your_password
```

## Features

- **Schema exploration** - List schemas, tables, columns with PK/FK info
- **Relationship mapping** - View foreign key relationships across tables
- **Query execution** - Run SQL queries with formatted output
- **Data sampling** - Quick preview of table contents
- **JSON-first output** - All commands output JSON by default for AI consumption

## CLI Commands

All commands output JSON by default. Use `--plain` for human-readable output.

| Command                         | Description                                            |
| ------------------------------- | ------------------------------------------------------ |
| `pgtool schemas`                | List database schemas                                  |
| `pgtool tables [schema]`        | List tables in schema (default: from config or public) |
| `pgtool describe <table>`       | Show columns with PK/FK info                           |
| `pgtool indexes <table>`        | List table indexes                                     |
| `pgtool constraints <table>`    | List table constraints                                 |
| `pgtool relationships [schema]` | Show FK relationships in/to schema                     |
| `pgtool query <sql>`            | Execute SQL query                                      |
| `pgtool sample <table>`         | Sample rows from table                                 |
| `pgtool count <table>`          | Count table rows                                       |
| `pgtool search <pattern>`       | Search tables and columns (case-insensitive)           |
| `pgtool overview [schema]`      | Database overview with relationships                   |
| `pgtool explain <sql>`          | Show query execution plan                              |

### Global Options

| Option              | Description                                  |
| ------------------- | -------------------------------------------- |
| `--root, -r <path>` | Project root (where .pgtool.json is located) |
| `--plain`           | Human-readable output instead of JSON        |

### Command Options

| Command   | Option            | Description                           |
| --------- | ----------------- | ------------------------------------- |
| `sample`  | `--limit, -l <n>` | Number of rows to sample (default: 5) |
| `explain` | `--no-analyze`    | Show plan without executing query     |

### Table Name Format

Table names can include schema prefix: `schema.table`

```bash
pgtool describe users          # Uses default schema
pgtool describe auth.users     # Explicit schema
pgtool sample public.orders --limit 10
```

## License

MIT
