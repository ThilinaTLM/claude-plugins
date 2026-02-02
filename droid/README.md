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

## Supported Actions

- Screenshots with UI hierarchy extraction
- Tap, long press, swipe gestures
- Text input and field manipulation
- Key events (back, home, enter, etc.)
- App launching and activity inspection
- Keyboard dismissal

## License

MIT
