---
name: adb-pilot
description: This skill should be used when the user asks to "test Android app", "automate Android emulator", "tap button on Android", "take Android screenshot", "interact with Android UI", "ADB automation", "fill Android form", "swipe on emulator", "validate Android UI flow", or needs to control an Android device/emulator via ADB. Provides a unified CLI with JSON output optimized for LLM consumption.
---

# ADB Pilot

Unified Android testing tool with **JSON output** for LLM-friendly automation.

## Prerequisites

- Python 3.8+
- ADB (Android Debug Bridge) in PATH
- Connected Android device or running emulator
- USB debugging enabled on device

## Quick Start

```bash
# Check device connection
${CLAUDE_PLUGIN_ROOT}/skills/adb-pilot/scripts/adb-pilot info

# Screenshot + UI elements (most useful command)
${CLAUDE_PLUGIN_ROOT}/skills/adb-pilot/scripts/adb-pilot screenshot

# Tap by text (no coordinates needed!)
${CLAUDE_PLUGIN_ROOT}/skills/adb-pilot/scripts/adb-pilot tap -t "Book Now"

# Fill a form field in one command
${CLAUDE_PLUGIN_ROOT}/skills/adb-pilot/scripts/adb-pilot fill "Email" "user@example.com"

# Wait for element to appear
${CLAUDE_PLUGIN_ROOT}/skills/adb-pilot/scripts/adb-pilot wait-for -t "Success" -s 5
```

## Core Commands

### screenshot
Capture screenshot AND UI elements. Returns element coordinates for tapping.

```bash
adb-pilot screenshot
adb-pilot screenshot --clickable      # Only clickable elements
adb-pilot screenshot --no-ui          # Fast, no element dump
```

**Response:** `{"ok":true,"screenshot":"/tmp/screenshot.png","elements":[{"text":"Book","class":"Button","clickable":true,"x":540,"y":350,"bounds":[400,300,680,400]}]}`

### tap
Tap by text or coordinates.

```bash
adb-pilot tap -t "Book Now"           # By text
adb-pilot tap -t "State" --prefer-input  # Prefer input fields over labels
adb-pilot tap -t "Submit" --clickable    # Only clickable elements
adb-pilot tap 540 960                 # By coordinates
```

### fill
Fill text field in one command (tap + clear + type + hide-keyboard).

```bash
adb-pilot fill "Enter your email" "user@example.com"
```

### wait-for
Wait for element to appear (with timeout).

```bash
adb-pilot wait-for -t "Welcome" -s 10
# Returns: {"ok":true,"found":true,"element":{...}} or {"ok":true,"found":false,"timeout":true}
```

## Form Workflow Commands

### clear / type / hide-keyboard

```bash
adb-pilot clear                       # Clear focused field
adb-pilot type "hello@example.com"    # Type into focused field
adb-pilot hide-keyboard               # Dismiss keyboard (use instead of 'key back')
```

### key
Send key events.

| Key | Purpose |
|-----|---------|
| `back` | Navigate back |
| `enter` | Submit/confirm |
| `move_home` | Cursor to start of text |
| `move_end` | Cursor to end of text |
| `delete` | Backspace |
| `app_home` | Android home screen |

```bash
adb-pilot key back
adb-pilot key move_home
```

## Other Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `swipe` | Scroll | `adb-pilot swipe up` |
| `longpress` | Long press | `adb-pilot longpress -t "Item"` |
| `launch` | Launch app | `adb-pilot launch com.example.app` |
| `current` | Current activity | `adb-pilot current` |
| `info` | Device info | `adb-pilot info` |
| `wait` | Wait ms | `adb-pilot wait 1000` |
| `select-all` | Select text | `adb-pilot select-all` |

See `references/commands.md` for full documentation.

## Testing Workflow

### Recommended Pattern

```bash
# 1. Screenshot to see current state
adb-pilot screenshot

# 2. Read the screenshot image with Claude's Read tool
# 3. Tap by text when possible
adb-pilot tap -t "Book Now" -w 1000

# 4. Verify the action worked
adb-pilot wait-for -t "Booking Confirmed" -s 5
```

### Form Filling Pattern

```bash
# Use fill command for efficiency
adb-pilot fill "Email" "user@example.com"
adb-pilot fill "Password" "secret123"
adb-pilot tap -t "Sign In" --clickable
adb-pilot wait-for -t "Welcome" -s 10
```

### Tips

- **Use `--prefer-input`** when tapping form fields to avoid hitting labels
- **Use `--clickable`** when tapping buttons to ensure element is interactive
- **Use `hide-keyboard`** not `key back` to dismiss keyboard
- **Use `wait-for`** instead of blind `wait` for reliable verification

## Error Handling

All errors return JSON with `"ok":false`:

```bash
adb-pilot tap -t "NonexistentButton"
# {"ok":false,"error":"No element found matching 'NonexistentButton'"}
```
