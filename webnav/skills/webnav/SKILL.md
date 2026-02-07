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

## How It Works

Every interaction follows the **observe → read → act → verify** loop:

```
1. Observe  →  webnav observe          (returns file paths to screenshot + snapshot)
2. Read     →  Read the screenshot PNG + snapshot file to understand page state
3. Act      →  Run action commands (click, fill, type, etc.)
4. Verify   →  webnav observe again to confirm the result
```

**`observe` returns file paths, not inline data.** Example output:

```json
{
  "ok": true,
  "action": "observe",
  "url": "https://example.com/login",
  "title": "Login - Example",
  "screenshot": "/tmp/webnav_screenshot_abc123.png",
  "snapshot": {
    "file": "/tmp/webnav_snapshot_abc123.json",
    "nodeCount": 47,
    "tokens": 1820
  },
  "console": { "count": 0 },
  "errors": { "count": 0 },
  "network": { "count": 0 },
  "hint": "For large files use `webnav util json-search <file> [pattern]` to search; small files can be read directly"
}
```

You **must** read the screenshot and snapshot files to see what's on the page. The snapshot is a compact accessibility tree:

```
@e1 navigation "Main Menu"
  @e2 link "Home"
  @e3 link "About"
@e4 main
  @e5 heading "Welcome" [level=1]
  @e6 textbox "Email" [value= required=true]
  @e7 button "Submit"
```

Each `@eN` ref can be used with `-r @eN` on `click`, `fill`, `type`, `key`, `wait-for` for precise targeting.

## Prerequisites

Run `webnav status` to check connection. If not set up, the output includes step-by-step setup instructions. Seek help from user to set up the extension.

## Command Reference

### Observe (read page state)

| Command        | Args / Flags                                                              | Description                                                         |
| -------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `status`       | —                                                                         | Check extension connection                                          |
| `info`         | —                                                                         | Current tab URL, title, status                                      |
| `observe`      | `--no-screenshot`, `-f` full-tree, `-d` dir                               | Full page state: screenshot + snapshot + console + errors + network |
| `screenshot`   | `-d` dir, `-f` full-page, `-s` selector                                   | Capture viewport or element screenshot                              |
| `elements`     | `-d` dir                                                                  | List all interactive elements with metadata                         |
| `snapshot`     | `--all` include-all, `-s` selector, `-d` max-depth, `-c` compact, `--dir` | Accessibility tree with `@ref` IDs (interactive-only by default)    |
| `gettext`      | `-t` text, `-s` selector                                                  | Get element text content                                            |
| `inputvalue`   | `-t` text, `-s` selector                                                  | Get current input value                                             |
| `getattribute` | `-t` text, `-s` selector, `-n` name (required)                            | Get element attribute value                                         |
| `isvisible`    | `-t` text, `-s` selector                                                  | Check element visibility                                            |
| `isenabled`    | `-t` text, `-s` selector                                                  | Check if element is enabled                                         |
| `ischecked`    | `-t` text, `-s` selector                                                  | Check checkbox/radio state                                          |
| `boundingbox`  | `-t` text, `-s` selector                                                  | Get element bounding rectangle                                      |

`observe` returns compact text snapshot by default; use `-f` for full JSON tree. Results are always saved to files; the response includes file paths and a `tokens` estimate.

### Navigate (move between pages/positions)

| Command          | Args / Flags                                                     | Description                           |
| ---------------- | ---------------------------------------------------------------- | ------------------------------------- |
| `goto`           | `<url>`, `-n` new-tab, `--screenshot`, `-d` dir                  | Navigate to URL (auto-waits for load) |
| `back`           | —                                                                | Browser back (auto-waits)             |
| `forward`        | —                                                                | Browser forward (auto-waits)          |
| `reload`         | —                                                                | Reload page (auto-waits)              |
| `scroll`         | `-d` direction, `--x`/`--y` absolute, `-a` amount, `-s` selector | Scroll page or element                |
| `scrollintoview` | `-t` text, `-s` selector                                         | Scroll element into viewport          |

### Act (interact with elements)

| Command    | Args / Flags                                                                                                                                         | Description                                                      |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `click`    | `-t` text, `-s` selector, `-i` index, `-r` ref, `-x` exact, `--wait-url`/`--wait-text`/`--wait-selector`, `--wait-timeout`, `--screenshot`, `-d` dir | Click element                                                    |
| `dblclick` | `-t` text, `-s` selector, `-i` index, `-x` exact                                                                                                     | Double-click element                                             |
| `type`     | `<text>`, `-r` ref, `--screenshot`, `-d` dir                                                                                                         | Type into focused element                                        |
| `key`      | `<key>`, `-r` ref, `--screenshot`, `-d` dir                                                                                                          | Send key (enter, tab, escape, backspace, delete, arrow\*, space) |
| `fill`     | `<label>` `<value>`, `-r` ref, `--screenshot`, `-d` dir                                                                                              | Fill input by label/placeholder                                  |
| `clear`    | `-t` text, `-s` selector                                                                                                                             | Clear input value                                                |
| `focus`    | `-t` text, `-s` selector                                                                                                                             | Focus an element                                                 |
| `select`   | `-s` selector, `-t` text, `-v` value, `-o` option-text, `--screenshot`, `-d` dir                                                                     | Select dropdown option                                           |
| `check`    | `-t` text, `-s` selector, `--screenshot`, `-d` dir                                                                                                   | Check checkbox/radio                                             |
| `uncheck`  | `-t` text, `-s` selector                                                                                                                             | Uncheck checkbox                                                 |
| `hover`    | `-t` text, `-s` selector                                                                                                                             | Hover over element                                               |

Text matching (`-t`): substring by default, `-x` for exact match. When multiple matches, interactive elements are preferred. `fill` with `-r @eN` omits the label arg: `fill -r @e6 "value"`. `select` requires one of `-v` (value) or `-o` (option text).

### Wait (explicit waits)

| Command       | Args / Flags                                          | Description                                                 |
| ------------- | ----------------------------------------------------- | ----------------------------------------------------------- |
| `wait-for`    | `-t` text, `-s` selector, `-r` ref, `--timeout` (10s) | Wait for element to appear                                  |
| `waitforload` | `-t` timeout (30s)                                    | Wait for page load (only needed after external navigations) |
| `waitforurl`  | `-p` pattern (required), `-t` timeout (30s)           | Wait for URL to match glob                                  |

### Advanced (JS, debugging, dialogs)

| Command    | Args / Flags                            | Description                                   |
| ---------- | --------------------------------------- | --------------------------------------------- |
| `evaluate` | `<expression>`                          | Execute JS in page context, return result     |
| `console`  | `-c` clear, `-d` dir                    | Get captured console logs                     |
| `errors`   | `-c` clear, `-d` dir                    | Get captured JS errors                        |
| `network`  | `-c` clear, `-d` dir                    | Get captured network requests (fetch and XHR) |
| `dialog`   | `-a` action (accept/dismiss), `-t` text | Configure alert/confirm/prompt handling       |

### Batch (multi-command in single round trip)

| Command | Args / Flags                                                 | Description                                        |
| ------- | ------------------------------------------------------------ | -------------------------------------------------- |
| `act`   | `--json`, `--timeout` (60s), `-d` dir, or positional strings | Run multiple actions sequentially (stops on error) |
| `query` | `--json`, or positional strings                              | Run multiple read-only queries                     |

**`act` JSON format:** `[{"action":"fill","label":"Email","value":"x"},{"action":"click","text":"Submit"}]`
**`act` positional:** `'goto "https://example.com"' 'click -t "Login"'`
**`query` types:** `gettext`, `inputvalue`, `getattribute`, `isvisible`, `isenabled`, `ischecked`, `boundingbox`

### Tabs (multi-tab management)

Webnav isolates its tabs in a Chrome tab group. Tab switching is virtual — it changes which tab commands target without visually disrupting the browser. Use `tab new` to open additional tabs and `tab switch` to move between them.

| Command      | Args / Flags                | Description                 |
| ------------ | --------------------------- | --------------------------- |
| `tab new`    | `[url]`                     | Open new tab (optional URL) |
| `tab list`   | —                           | List managed tabs           |
| `tab switch` | `<tabId>`                   | Switch active tab           |
| `tab close`  | `<tabId>`                   | Close a tab                 |
| `history`    | `-n` limit (50), `--offset` | View command history        |

### Utilities

| Command            | Args / Flags                                                                    | Description                                             |
| ------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `util json-search` | `<file>` `[pattern]`, `-t` tag, `-r` role, `--ref`, `-n` limit (50), `--offset` | Search JSON file from elements/snapshot/network/observe |

### Setup

| Command           | Args / Flags                                              | Description                  |
| ----------------- | --------------------------------------------------------- | ---------------------------- |
| `setup install`   | `[extensionId]`, `-b` browser (chrome/edge/brave/vivaldi) | Install native host manifest |
| `setup uninstall` | `-b` browser (omit for all)                               | Remove native host manifest  |

## Snapshot Refs

`observe` and `snapshot` assign `@e1`, `@e2`, ... to interactive elements. These refs enable precise targeting:

- Use with `-r @eN` on: `click`, `fill`, `type`, `key`, `wait-for`
- Refs are assigned fresh on every `observe` or `snapshot` call
- **Refs go stale** after page navigation or DOM changes — always re-run `observe` before using refs

## Reading Output Files

`observe` saves screenshot, snapshot, console, errors, and network to files. How to read them:

- **Screenshot PNG** — always read with the Read tool to see the page visually
- **Snapshot / console / errors / network** — check the `tokens` field in the response:
  - Small (`tokens` < 4000): read the file directly
  - Large: use `webnav util json-search <file> [pattern]` to search
- **`json-search`** supports: text pattern, `--role button`, `--tag input`, `--ref @eN`

Standalone `elements`, `snapshot`, `console`, `errors`, `network` also auto-save to files when results exceed 10 items.

## Workflows

**Start + navigate:**

```bash
webnav status
webnav goto "https://example.com"
webnav observe
# → Read screenshot PNG and snapshot file to understand the page
```

**Fill and submit a form:**

```bash
webnav observe
# → Read snapshot to find form fields
webnav fill "Email" "user@example.com"
webnav fill "Password" "secret123"
webnav click -t "Sign In" --wait-url "*/dashboard*"
webnav observe
# → Read screenshot to verify navigation succeeded
```

**Debug JS errors:**

```bash
webnav observe
# → Check errors.count and console.count in response
# → If count > 0, read the errors/console file
webnav evaluate "document.querySelector('#app').dataset.version"
```

**Debug network requests:**

```bash
webnav observe
# → Check network.count in response
# → If count > 0, read the network file or search it:
webnav util json-search /tmp/network_*.json "api"
# Or standalone with clear:
webnav network -c
```

**Precise targeting with refs:**

```bash
webnav observe
# → Read snapshot file, find @e6 is the email textbox
webnav fill -r @e6 "user@example.com"
webnav click -r @e7
```

**Batch actions (fewer round trips):**

```bash
webnav act --json '[
  {"action":"fill","label":"Email","value":"user@example.com"},
  {"action":"fill","label":"Password","value":"secret123"},
  {"action":"click","text":"Sign In","waitUrl":"*/dashboard*","screenshot":true}
]'
# Or positional: webnav act 'fill "Email" "user@example.com"' 'click -t "Sign In"'
```

## Tips

- **Targeting priority:** prefer `-r @eN` (precise) > `-t text` (readable) > `-s selector` (fragile)
- **Page state:** use `observe` for combined view; use standalone `snapshot -s selector` for scoped subtree, standalone `console -c` / `errors -c` / `network -c` to clear after reading
- **Forms:** use `fill` over click + type — it handles focus, clear, and input events
- **Waiting:** use `click --wait-url` / `--wait-text` / `--wait-selector` over separate click then wait-for
- **After page changes:** always re-observe — refs from the previous snapshot are stale
- **Navigation commands** (`goto`, `back`, `forward`, `reload`) auto-wait for page load
- **SPA:** if you are in a Single Page Application, using goto could refresh the page which may cause the page to lose state or data.

## Error Handling

All errors return `{"ok":false, "error":"...", "code":"...", "hint":{...}}`. The `hint` object includes `summary`, `steps`, and `diagnostics`.

| Code                     | Meaning & Recovery                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------ |
| `ELEMENT_NOT_FOUND`      | Target not on page. Re-observe, check snapshot, try different targeting method.      |
| `TIMEOUT`                | Page may be loading slowly. Wait for load to finish, increase `--timeout`, or retry. |
| `NOT_CONNECTED`          | Extension not loaded. Ask user to open Chrome and reload the extension.              |
| `CONNECTION_FAILED`      | Stale socket. Ask user to run `rm ~/.webnav/webnav.sock` then reload extension.      |
| `SETUP_REQUIRED`         | First-time setup needed. Follow the `hint.steps` in the error response.              |
| `EXTENSION_ERROR`        | Extension-side failure. Check error message; page may block script injection.        |
| `EXTENSION_DISCONNECTED` | Native host running but extension unresponsive. Ask user to reload extension.        |

## Architecture

```
CLI (webnav) → Unix Socket → Native Host → Native Messaging → Chrome Extension
```
