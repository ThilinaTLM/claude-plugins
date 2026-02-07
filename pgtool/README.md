# pgtool

An AI agent plugin for exploring and querying PostgreSQL databases. It connects using a simple config file and lets the agent inspect schemas, tables, relationships, and run queries.

## What Can It Do?

- **Explore schemas** — List schemas, tables, and columns with primary/foreign key info
- **Map relationships** — View foreign key relationships across tables
- **Run queries** — Execute SQL and explain query plans
- **Sample data** — Preview table contents and count rows
- **Search** — Find tables and columns by name

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

## Prerequisites

- [Bun runtime](https://bun.sh) - CLI runs via Bun with auto-dependency installation

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

## Setup

After installing the plugin and creating your `.pgtool.json` config file, just ask your AI agent to explore your database (e.g. "show me the database schema" or "what tables have user data?"). The agent will connect and query the database directly.

## License

MIT
