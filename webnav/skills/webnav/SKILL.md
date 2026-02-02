---
name: webnav
description: This skill should be used when the user asks to "automate browser", "control Chrome", "navigate webpage", "click button on website", "fill web form", "take browser screenshot", "test website", "web scraping", "browser automation", or needs to interact with web pages via Chrome. Provides a CLI with JSON output optimized for LLM consumption.
---

# WebNav

Browser automation via Chrome extension with **JSON output** for LLM-friendly control.

## CLI Discovery

The CLI is located at `./scripts/webnav-cli/` relative to this SKILL.md file.

| Platform         | Script       |
| ---------------- | ------------ |
| Unix/Linux/macOS | `webnav`     |

**Claude Code:** Use `${CLAUDE_PLUGIN_ROOT}/skills/webnav/scripts/webnav-cli/webnav`.

## Prerequisites

- Bun runtime (https://bun.sh)
- Google Chrome browser
- WebNav extension loaded in Chrome (unpacked)
- Native host manifest installed via `webnav setup`

## Setup (One-time)

1. Load the extension in Chrome:
   - Open `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `${CLAUDE_PLUGIN_ROOT}/extension/`
   - Copy the extension ID (32-character string)

2. Install the native host:
   ```bash
   webnav setup --extension-id <your-extension-id>
   ```

3. Reload the extension in Chrome to connect

4. Verify connection:
   ```bash
   webnav status
   ```

## Quick Start

```bash
# Check connection
webnav status

# Get current tab info
webnav info

# Navigate to URL
webnav goto "https://example.com"

# Take screenshot
webnav screenshot

# Click by text
webnav click -t "Sign In"

# Fill form field
webnav fill "Email" "user@example.com"
```

## Core Commands

### status
Check if the extension is connected.

```bash
webnav status
```

**Response:** `{"ok":true,"action":"status","connected":true,"version":"1.0.0"}`

### info
Get current tab information.

```bash
webnav info
```

**Response:** `{"ok":true,"action":"info","id":123,"url":"https://example.com","title":"Example","status":"complete","active":true}`

### tabs
List all browser tabs.

```bash
webnav tabs
```

**Response:** `{"ok":true,"action":"tabs","count":3,"tabs":[...]}`

### goto
Navigate to a URL.

```bash
webnav goto "https://example.com"
webnav goto "example.com"              # https:// added automatically
```

**Response:** `{"ok":true,"action":"goto","url":"https://example.com","title":"Example Domain"}`

### screenshot
Capture screenshot of the current tab.

```bash
webnav screenshot
webnav screenshot --dir /path/to/output
```

**Response:** `{"ok":true,"action":"screenshot","screenshot":"/tmp/screenshot_20240101_120000.png","url":"https://example.com","title":"Example"}`

### click
Click an element by text or CSS selector.

```bash
webnav click -t "Sign In"              # By text
webnav click -s "button.submit"        # By CSS selector
webnav click -t "Item" --index 2       # Third match (0-indexed)
```

**Response:** `{"ok":true,"action":"click","clicked":true,"tag":"button","text":"Sign In"}`

### type
Type text into the focused element.

```bash
webnav type "Hello World"
```

**Response:** `{"ok":true,"action":"type","typed":true,"value":"Hello World"}`

### key
Send a keyboard event.

```bash
webnav key enter
webnav key tab
webnav key escape
```

**Valid keys:** `enter`, `tab`, `escape`, `backspace`, `delete`, `arrowup`, `arrowdown`, `arrowleft`, `arrowright`, `space`

**Response:** `{"ok":true,"action":"key","sent":true,"key":"enter"}`

### fill
Find an input by label/placeholder and fill with value.

```bash
webnav fill "Email" "user@example.com"
webnav fill "Password" "secret123"
```

**Response:** `{"ok":true,"action":"fill","filled":true,"label":"Email","value":"user@example.com"}`

### wait-for
Wait for an element to appear.

```bash
webnav wait-for -t "Welcome"           # Wait for text
webnav wait-for -s ".success"          # Wait for selector
webnav wait-for -t "Done" --timeout 5000
```

**Response:** `{"ok":true,"action":"wait-for","found":true}`

### elements
List interactive elements on the page.

```bash
webnav elements
```

**Response:** `{"ok":true,"action":"elements","count":25,"elements":[{"tag":"button","text":"Submit",...}]}`

## Form Filling Workflow

```bash
# Navigate to form
webnav goto "https://example.com/login"

# Fill fields
webnav fill "Email" "user@example.com"
webnav fill "Password" "secret123"

# Submit
webnav click -t "Sign In"

# Verify success
webnav wait-for -t "Welcome"
```

## Testing Workflow

```bash
# 1. Take screenshot to see current state
webnav screenshot

# 2. Read the screenshot with Claude's Read tool

# 3. Interact based on what you see
webnav click -t "Get Started"

# 4. Verify the action worked
webnav wait-for -t "Step 1"
```

## Tips

- **Use text matching** (`-t`) when possible - more robust than coordinates
- **Use `fill`** instead of click + type for form fields
- **Use `wait-for`** instead of blind waiting for reliable verification
- **Check `elements`** if you need to find clickable items
- **Screenshots** are saved to system temp directory by default

## Error Handling

All errors return JSON with `"ok":false`:

```bash
webnav click -t "NonexistentButton"
# {"ok":false,"error":"No element found matching text \"NonexistentButton\"","code":"EXTENSION_ERROR"}

webnav status  # When not connected
# {"ok":false,"error":"Native host not running","code":"NOT_CONNECTED","hint":"Load the extension in Chrome to start the native host."}
```

## Architecture

```
CLI (webnav) → Unix Socket → Native Host → Native Messaging → Chrome Extension
```

The extension runs inside Chrome and has full access to the DOM, while the CLI provides a simple command interface for automation scripts and LLMs.
