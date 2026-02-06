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
| Windows          | `webnav.ps1` |

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
   - Select `${CLAUDE_PLUGIN_ROOT}/skills/webnav/extension/dist/`
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

### goto
Navigate to a URL.

```bash
webnav goto "https://example.com"
webnav goto "example.com"              # https:// added automatically
```

**Response:** `{"ok":true,"action":"goto","url":"https://example.com","title":"Example Domain"}`

### back
Navigate back in browser history.

```bash
webnav back
```

**Response:** `{"ok":true,"action":"back","url":"https://example.com","title":"Example"}`

### forward
Navigate forward in browser history.

```bash
webnav forward
```

**Response:** `{"ok":true,"action":"forward","url":"https://example.com","title":"Example"}`

### reload
Reload the current page.

```bash
webnav reload
```

**Response:** `{"ok":true,"action":"reload","url":"https://example.com","title":"Example"}`

### scroll
Scroll the page or a specific element.

```bash
webnav scroll -d down              # Scroll down one viewport
webnav scroll -d up --amount 200   # Scroll up 200px
webnav scroll --y 0                # Scroll to top
webnav scroll -d down -s ".panel"  # Scroll within element
```

**Response:** `{"ok":true,"action":"scroll","scrollX":0,"scrollY":800}`

### scrollintoview
Scroll an element into the visible viewport.

```bash
webnav scrollintoview -t "Section Title"   # By text
webnav scrollintoview -s "#footer"         # By CSS selector
```

**Response:** `{"ok":true,"action":"scrollintoview","scrolledTo":true,"tag":"h2","text":"Section Title","position":{"top":300,"left":0}}`

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

### clear
Clear the value of an input element.

```bash
webnav clear -s "#search"
```

**Response:** `{"ok":true,"action":"clear","cleared":true,"tag":"input"}`

### focus
Focus an element.

```bash
webnav focus -s "#username"
```

**Response:** `{"ok":true,"action":"focus","focused":true,"tag":"input"}`

### select
Select an option from a `<select>` element.

```bash
webnav select -s "#country" -v "US"            # By option value
webnav select -s "#country" -o "United States"  # By option text
```

**Response:** `{"ok":true,"action":"select","selectedValue":"US","selectedText":"United States"}`

### check
Check a checkbox or radio button.

```bash
webnav check -s "#terms"
```

**Response:** `{"ok":true,"action":"check","checked":true,"changed":true}`

### uncheck
Uncheck a checkbox.

```bash
webnav uncheck -s "#newsletter"
```

**Response:** `{"ok":true,"action":"uncheck","checked":false,"changed":true}`

### hover
Hover over an element (triggers mouseenter/mouseover events).

```bash
webnav hover -t "Menu"
webnav hover -s ".dropdown-trigger"
```

**Response:** `{"ok":true,"action":"hover","hovered":true,"tag":"button","text":"Menu"}`

### dblclick
Double-click an element.

```bash
webnav dblclick -t "Edit"
webnav dblclick -s "td.cell" -i 2     # Third match
```

**Response:** `{"ok":true,"action":"dblclick","dblclicked":true,"tag":"td","text":"Cell content"}`

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

### gettext
Get text content of an element.

```bash
webnav gettext -s "h1"                # By CSS selector
webnav gettext -t "Welcome"           # By text match
```

**Response:** `{"ok":true,"action":"gettext","text":"Welcome to Example"}`

### inputvalue
Get the current value of an input element.

```bash
webnav inputvalue -s "#email"
```

**Response:** `{"ok":true,"action":"inputvalue","value":"user@example.com"}`

### getattribute
Get an attribute value from an element.

```bash
webnav getattribute -s "a.logo" -n href
```

**Response:** `{"ok":true,"action":"getattribute","name":"href","value":"/home","exists":true}`

### isvisible
Check if an element is visible (display, visibility, opacity, dimensions).

```bash
webnav isvisible -s ".modal"
```

**Response:** `{"ok":true,"action":"isvisible","visible":false}`

### isenabled
Check if an element is enabled (not disabled).

```bash
webnav isenabled -s "#submit-btn"
```

**Response:** `{"ok":true,"action":"isenabled","enabled":true}`

### ischecked
Check if a checkbox or radio button is checked.

```bash
webnav ischecked -s "#terms"
```

**Response:** `{"ok":true,"action":"ischecked","checked":false}`

### boundingbox
Get the bounding rectangle of an element.

```bash
webnav boundingbox -s ".hero"
```

**Response:** `{"ok":true,"action":"boundingbox","x":0,"y":100,"width":1200,"height":400,"top":100,"right":1200,"bottom":500,"left":0}`

### snapshot
Get an accessibility tree snapshot of the page. Assigns refs (`@e1`, `@e2`, ...) to elements for use with `--ref` flag on other commands.

```bash
webnav snapshot                       # Full tree
webnav snapshot -i                    # Interactive elements only
webnav snapshot -s "#main" -d 3       # Subtree, max depth 3
webnav snapshot -c                    # Compact text format
```

**Response (JSON):** `{"ok":true,"action":"snapshot","tree":[{"ref":"@e1","role":"navigation","name":"Main","tag":"nav","children":[...]}],"nodeCount":142}`

**Response (compact):** Text tree with `@e1 role "name" [states]` format.

**Using refs with other commands:**

```bash
webnav snapshot -i                    # Get interactive elements with refs
webnav click -r @e5                   # Click element by ref
webnav type "hello" -r @e3           # Focus ref, then type
webnav fill -r @e7 "user@example.com" # Fill ref element
```

Commands supporting `--ref/-r`: `click`, `type`, `key`, `fill`, `wait-for`.

### evaluate
Execute JavaScript in the page context and return the result.

```bash
webnav evaluate "document.title"
webnav evaluate "document.querySelectorAll('a').length"
webnav evaluate "fetch('/api/data').then(r => r.json())"
```

**Response:** `{"ok":true,"action":"evaluate","result":"Example Page","type":"string"}`

### dialog
Configure auto-handling of alert/confirm/prompt dialogs.

```bash
webnav dialog -a accept              # Auto-accept dialogs
webnav dialog -a dismiss             # Auto-dismiss dialogs
webnav dialog -a accept -t "yes"     # Accept with text for prompts
```

**Response:** `{"ok":true,"action":"dialog","configured":true,"action":"accept","text":null}`

### console
Get captured console log messages from the page.

```bash
webnav console                       # Get all captured logs
webnav console --clear               # Get logs and clear buffer
```

**Response:** `{"ok":true,"action":"console","logs":[{"level":"log","args":["Hello"],"timestamp":1234567890}],"count":1}`

### errors
Get captured JavaScript errors from the page.

```bash
webnav errors                        # Get all captured errors
webnav errors --clear                # Get errors and clear buffer
```

**Response:** `{"ok":true,"action":"errors","errors":[{"message":"TypeError: x is not a function","source":"app.js","line":42}],"count":1}`

### screenshot (advanced options)
Enhanced screenshot with full-page and element capture.

```bash
webnav screenshot                              # Viewport screenshot
webnav screenshot --full-page                  # Full scrollable page
webnav screenshot --selector ".hero-section"   # Specific element
```

**Response:** `{"ok":true,"action":"screenshot","screenshot":"/tmp/screenshot_20240101_120000.png","url":"https://example.com","title":"Example"}`

### waitforload
Wait for the page to finish loading.

```bash
webnav waitforload                   # Wait up to 30s (default)
webnav waitforload -t 5000           # Wait up to 5s
```

**Response:** `{"ok":true,"action":"waitforload","loaded":true,"url":"https://example.com","title":"Example"}`

### waitforurl
Wait for the URL to match a glob pattern.

```bash
webnav waitforurl -p "*://example.com/dashboard*"
webnav waitforurl -p "*/success*" -t 10000
```

**Response:** `{"ok":true,"action":"waitforurl","matched":true,"url":"https://example.com/dashboard","pattern":"*://example.com/dashboard*"}`

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
