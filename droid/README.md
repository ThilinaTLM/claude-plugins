# droid

A Claude Code plugin that gives Claude the ability to control Android devices. It works through ADB — Claude sends commands via the CLI, and actions are executed on your connected device or emulator.

## What Can It Do?

- **See what's on screen** — Take screenshots with UI element information
- **Tap and interact** — Tap elements by visible text or coordinates, long press, swipe in any direction
- **Fill forms** — Type text, fill fields, clear inputs, select all
- **Navigate** — Press back, home, enter, and other system keys
- **Wait for things** — Wait for elements to appear before proceeding
- **Control apps** — Launch apps, get current activity, dismiss keyboards

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

## Setup

After installing the plugin, connect your Android device via USB (with USB debugging enabled) or start an emulator, then just ask your AI agent to interact with it (e.g. "take a screenshot of my phone" or "tap the Settings app"). The agent will use ADB to control the device directly.

No manual setup is needed beyond having ADB available and a device connected.

## License

MIT
