<div align="center">

<pre>
    _   ___ ___ _  _ _____   ___ _  _____ _    _    ___
   /_\ / __| __| \| |_   _| / __| |/ /_ _| |  | |  / __|
  / _ \ (_ | _||  ` | | |   \__ \ ' < | || |__| |__\__ \
 /_/ \_\___|___|_|\_| |_|   |___/_|\_\___|____|____|___/
</pre>

**Reusable skills for AI coding assistants**

[Claude Code](https://claude.ai/code) • [Cursor](https://cursor.sh) • [GitHub Copilot](https://github.com/features/copilot) • and more

</div>

---

## Installation

### Claude Code

```bash
/plugin marketplace add ThilinaTLM/agent-skills
/plugin install specdev@tlmtech
/plugin install pgtool@tlmtech
/plugin install droid@tlmtech
/plugin install webnav@tlmtech
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
npx skills add ThilinaTLM/agent-skills/webnav
```

---

## Available Skills

| Skill                | Description                                     | Tags                      |
| -------------------- | ----------------------------------------------- | ------------------------- |
| [specdev](./specdev) | Spec-driven development for multi-session tasks | `productivity` `workflow` |
| [pgtool](./pgtool)   | PostgreSQL database exploration and debugging   | `database` `sql`          |
| [droid](./droid)     | Android device automation via ADB               | `testing` `android`       |
| [webnav](./webnav)   | Browser automation via Chrome extension         | `browser` `automation`    |

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
