# droid

Android device automation and UI testing via ADB for AI agents.

## Installation

### Claude Code

```bash
/plugin marketplace add ThilinaTLM/agent-skills
/plugin install droid@tlmtech
```

### Other Tools

```bash
npx skills add ThilinaTLM/agent-skills/droid
```

## Prerequisites

- [ADB](https://developer.android.com/tools/adb) in PATH
- Connected Android device or running emulator

## Features

- **Text-based targeting** - Tap elements by text content, no coordinate hunting
- **Screenshot capture** - Get screenshots with UI element information
- **Form automation** - Fill text fields, clear inputs, type text
- **Gesture support** - Tap, long press, swipe in any direction
- **Wait conditions** - Wait for elements to appear before proceeding
- **JSON-first output** - All commands output JSON by default for AI consumption

## CLI Commands

All commands output JSON by default for AI consumption.

### Screen & Information

| Command            | Description                             |
| ------------------ | --------------------------------------- |
| `droid screenshot` | Capture screenshot with UI element list |
| `droid info`       | Device information                      |
| `droid current`    | Current activity and package            |

### Interaction

| Command                     | Description                                          |
| --------------------------- | ---------------------------------------------------- |
| `droid tap <x> <y>`         | Tap at coordinates                                   |
| `droid tap -t <text>`       | Tap element by text                                  |
| `droid longpress -t <text>` | Long press on element                                |
| `droid swipe <direction>`   | Swipe up/down/left/right                             |
| `droid fill <field> <text>` | Fill text field (tap + clear + type + hide-keyboard) |
| `droid type <text>`         | Type into focused field                              |
| `droid clear`               | Clear focused field                                  |
| `droid key <keyname>`       | Send key event (back, home, enter, etc.)             |
| `droid select-all`          | Select all text in focused field                     |

### App Control

| Command                    | Description                 |
| -------------------------- | --------------------------- |
| `droid launch <package>`   | Launch app by package name  |
| `droid hide-keyboard`      | Dismiss on-screen keyboard  |
| `droid wait <ms>`          | Wait specified milliseconds |
| `droid wait-for -t <text>` | Wait for element to appear  |

### Command Options

| Command      | Option                | Description                             |
| ------------ | --------------------- | --------------------------------------- |
| `screenshot` | `--clickable, -c`     | Only return clickable elements          |
| `screenshot` | `--text, -t <text>`   | Filter elements by text                 |
| `screenshot` | `--dir, -d <path>`    | Output directory (default: system temp) |
| `screenshot` | `--no-ui`             | Skip UI hierarchy dump (faster)         |
| `tap`        | `--text, -t <text>`   | Find element by text                    |
| `tap`        | `--index, -i <n>`     | Index if multiple matches (default: 0)  |
| `tap`        | `--wait, -w <ms>`     | Wait after tap                          |
| `tap`        | `--prefer-input`      | Prefer input fields over labels         |
| `tap`        | `--clickable`         | Only match clickable elements           |
| `longpress`  | `--text, -t <text>`   | Find element by text                    |
| `longpress`  | `--index, -i <n>`     | Index if multiple matches               |
| `longpress`  | `--duration, -d <ms>` | Press duration (default: 1000)          |
| `longpress`  | `--wait, -w <ms>`     | Wait after action                       |
| `swipe`      | `--duration, -d <ms>` | Swipe duration (default: 300)           |
| `swipe`      | `--wait, -w <ms>`     | Wait after swipe                        |
| `fill`       | `--wait, -w <ms>`     | Wait after action                       |
| `wait-for`   | `--text, -t <text>`   | Text to wait for (required)             |
| `wait-for`   | `--timeout, -s <sec>` | Timeout in seconds (default: 10)        |

## License

MIT
