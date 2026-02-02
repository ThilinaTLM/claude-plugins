<div align="center">

<pre>
    _   ___ ___ _  _ _____   ___ _  _____ _    _    ___
   /_\ / __| __| \| |_   _| / __| |/ /_ _| |  | |  / __|
  / _ \ (_ | _||  ` | | |   \__ \ ' < | || |__| |__\__ \
 /_/ \_\___|___|_|\_| |_|   |___/_|\_\___|____|____|___/
</pre>

**Reusable skills for AI coding assistants**

[Claude Code](https://claude.ai/code) • [Cursor](https://cursor.sh) • [GitHub Copilot](https://github.com/features/copilot) • and more

---

</div>

## Installation

### Claude Code

```bash
/plugin marketplace add ThilinaTLM/agent-skills
/plugin install specdev@tlmtech
/plugin install pgtool@tlmtech
/plugin install droid@tlmtech
```

### Other Tools (Cursor, Copilot, etc.)

```bash
npx skills add ThilinaTLM/agent-skills
```

Or install individual skills:

```bash
npx skills add ThilinaTLM/agent-skills/specdev
npx skills add ThilinaTLM/agent-skills/pgtool
npx skills add ThilinaTLM/agent-skills/droid
```

---

## Available Skills

### specdev

> Specification-driven development for complex, multi-session tasks

Break down large features into structured specs that persist across sessions. Perfect for:

- Multi-file refactors
- New feature implementation
- Complex bug fixes requiring investigation

**Key Commands:**

```bash
specdev new my-feature    # Create new spec
specdev list              # Show active specs
specdev context my-spec   # Get current task context
```

[Documentation](./specdev)

---

### pgtool

> PostgreSQL database exploration and debugging

Explore schemas, tables, and relationships with JSON-first output designed for AI agents. Never write raw SQL to understand your database again.

**Key Commands:**

```bash
pgtool overview           # ERD-like schema view
pgtool describe users     # Column details with PK/FK
pgtool sample orders      # Quick data preview
pgtool query "SELECT..."  # Execute queries
```

[Documentation](./pgtool)

---

### droid

> Android device automation and UI testing via ADB

Control Android emulators and devices with text-based element targeting. No coordinate hunting required.

**Key Commands:**

```bash
droid screenshot          # Capture + get UI elements
droid tap -t "Submit"     # Tap by text
droid fill "Email" "x@y"  # Fill form fields
droid wait-for -t "Done"  # Wait for elements
```

[Documentation](./droid)

---

## Contributing

Each skill is self-contained in its own directory:

```
skill-name/
├── .claude-plugin/plugin.json
└── skills/skill-name/
    ├── SKILL.md          # Main skill definition
    └── scripts/          # CLI tools (if any)
```

## License

MIT
