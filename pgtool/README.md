# pgtool

PostgreSQL database exploration and debugging plugin for Claude Code.

## Installation

This plugin is part of the `tlmtech` Claude Code plugin marketplace. Install via:

```bash
claude plugin install tlmtech/pgtool
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

## Commands

| Command | Description |
|---------|-------------|
| `pgtool schemas` | List database schemas |
| `pgtool tables [schema]` | List tables in a schema |
| `pgtool describe <table>` | Show columns with PK/FK info |
| `pgtool indexes <table>` | List table indexes |
| `pgtool constraints <table>` | List constraints |
| `pgtool relationships [schema]` | Show FK relationships |
| `pgtool query <sql>` | Execute SQL query |

All commands output JSON by default. Use `--plain` for human-readable output.

## Development

```bash
cd pgtool-cli
bun install
bun run dev schemas        # Run in development mode
bun run dev tables public  # List tables
```

## License

MIT
