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
  "passwordEnv": "PGPASSWORD"
}
```

Set the password via environment variable:

```bash
export PGPASSWORD=your_password
```

## Features

- **Schema exploration** - List schemas, tables, columns with PK/FK info
- **Relationship mapping** - View foreign key relationships across tables
- **Query execution** - Run SQL queries with formatted output
- **Data sampling** - Quick preview of table contents
- **JSON-first output** - All commands output JSON by default for AI consumption

## License

MIT
