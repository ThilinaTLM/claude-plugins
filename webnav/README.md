# webnav

Browser automation via Chrome extension for AI agents.

## Installation

### Claude Code

```bash
/plugin marketplace add ThilinaTLM/agent-skills
/plugin install webnav@tlmtech
```

### Other Tools

```bash
npx skills add ThilinaTLM/agent-skills/webnav
```

## Prerequisites

- [Bun](https://bun.sh) runtime
- Google Chrome browser
- Unix-like OS (Linux or macOS)

## Setup

1. **Load extension in Chrome:**
   - Open `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `skills/webnav/extension/dist/` directory
   - Copy the Extension ID (32-character string)

2. **Install native host:**
   ```bash
   webnav setup --extension-id <your-extension-id>
   ```

3. **Reload extension** in Chrome to connect

4. **Verify:**
   ```bash
   webnav status
   ```

See `skills/webnav/SETUP.md` for detailed instructions.

## Features

- **Text-based targeting** - Click elements by text content, no coordinate hunting
- **Screenshot capture** - Get screenshots of the current tab
- **Form automation** - Fill text fields by label/placeholder
- **Keyboard events** - Send enter, tab, escape, and more
- **Wait conditions** - Wait for elements to appear before proceeding
- **JSON-first output** - All commands output JSON by default for AI consumption

## CLI Commands

All commands output JSON by default for AI consumption.

### Status & Information

| Command          | Description                      |
| ---------------- | -------------------------------- |
| `webnav status`  | Check if extension is connected  |
| `webnav info`    | Current tab information          |
| `webnav tabs`    | List all browser tabs            |

### Navigation

| Command              | Description          |
| -------------------- | -------------------- |
| `webnav goto <url>`  | Navigate to URL      |
| `webnav screenshot`  | Capture tab screenshot |

### Interaction

| Command                        | Description                     |
| ------------------------------ | ------------------------------- |
| `webnav click -t <text>`       | Click element by text           |
| `webnav click -s <selector>`   | Click element by CSS selector   |
| `webnav fill <label> <value>`  | Fill input by label/placeholder |
| `webnav type <text>`           | Type into focused element       |
| `webnav key <keyname>`         | Send keyboard event             |

### Wait & Inspect

| Command                    | Description                  |
| -------------------------- | ---------------------------- |
| `webnav wait-for -t <text>` | Wait for text to appear     |
| `webnav wait-for -s <sel>`  | Wait for selector to appear |
| `webnav elements`          | List interactive elements    |

### Command Options

| Command      | Option                   | Description                             |
| ------------ | ------------------------ | --------------------------------------- |
| `setup`      | `--extension-id, -e`     | Chrome extension ID (required)          |
| `screenshot` | `--dir, -d <path>`       | Output directory (default: system temp) |
| `click`      | `--text, -t <text>`      | Find element by text                    |
| `click`      | `--selector, -s <sel>`   | Find element by CSS selector            |
| `click`      | `--index, -i <n>`        | Index if multiple matches (default: 0)  |
| `wait-for`   | `--text, -t <text>`      | Text to wait for                        |
| `wait-for`   | `--selector, -s <sel>`   | Selector to wait for                    |
| `wait-for`   | `--timeout <ms>`         | Timeout in milliseconds (default: 10000) |

### Keyboard Keys

Valid keys for `webnav key`: `enter`, `tab`, `escape`, `backspace`, `delete`, `arrowup`, `arrowdown`, `arrowleft`, `arrowright`, `space`

## Architecture

```
┌─────────────────┐    Unix Socket    ┌──────────────────┐    Native Msg    ┌───────────────┐
│   CLI commands  │ ←───────────────→ │  webnav daemon   │ ←──────────────→ │   Extension   │
│    (bun)        │      JSON         │     (relay)      │      stdio       │  (stateful)   │
└─────────────────┘                   └──────────────────┘                  └───────────────┘
```

- **CLI**: Simple client that sends commands and receives JSON responses
- **Daemon**: Native host relay (runs as `webnav daemon`, spawned by Chrome)
- **Extension**: Service worker with full DOM access via content scripts

## License

MIT
