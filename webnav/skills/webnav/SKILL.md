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

Run `webnav status` to check connection. If not set up, the output includes step-by-step setup instructions. Seek help from user to set up the extension.

## Command Reference

### Observe (read page state)

| Command        | Args / Flags                                                       | Description                                         |
| -------------- | ------------------------------------------------------------------ | --------------------------------------------------- |
| `status`       | —                                                                  | Check extension connection                          |
| `info`         | —                                                                  | Current tab URL, title, status                      |
| `observe`      | `--no-screenshot`, `-f` full-tree, `-d` dir                        | Screenshot + accessibility tree snapshot (compact)  |
| `screenshot`   | `-d` dir, `-f` full-page, `-s` selector                            | Capture viewport or element screenshot              |
| `elements`     | `-d` dir                                                           | List all interactive elements with metadata         |
| `snapshot`     | `--all` include-all, `-s` selector, `-d` max-depth, `-c` compact, `--dir` | Accessibility tree with `@ref` IDs (interactive-only by default) |
| `gettext`      | `-t` text, `-s` selector                                           | Get element text content                            |
| `inputvalue`   | `-t` text, `-s` selector                                           | Get current input value                             |
| `getattribute` | `-t` text, `-s` selector, `-n` name (required)                     | Get element attribute value                         |
| `isvisible`    | `-t` text, `-s` selector                                           | Check element visibility                            |
| `isenabled`    | `-t` text, `-s` selector                                           | Check if element is enabled                         |
| `ischecked`    | `-t` text, `-s` selector                                           | Check checkbox/radio state                          |
| `boundingbox`  | `-t` text, `-s` selector                                           | Get element bounding rectangle                      |

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

### Wait (explicit waits)

| Command       | Args / Flags                                          | Description                                                 |
| ------------- | ----------------------------------------------------- | ----------------------------------------------------------- |
| `wait-for`    | `-t` text, `-s` selector, `-r` ref, `--timeout` (10s) | Wait for element to appear                                  |
| `waitforload` | `-t` timeout (30s)                                    | Wait for page load (only needed after external navigations) |
| `waitforurl`  | `-p` pattern (required), `-t` timeout (30s)           | Wait for URL to match glob                                  |

### Advanced (JS, debugging, dialogs)

| Command    | Args / Flags                            | Description                               |
| ---------- | --------------------------------------- | ----------------------------------------- |
| `evaluate` | `<expression>`                          | Execute JS in page context, return result |
| `console`  | `-c` clear, `-d` dir                    | Get captured console logs                 |
| `errors`   | `-c` clear, `-d` dir                    | Get captured JS errors                    |
| `dialog`   | `-a` action (accept/dismiss), `-t` text | Configure alert/confirm/prompt handling   |

### Batch (multi-command in single round trip)

| Command | Args / Flags                                                 | Description                                        |
| ------- | ------------------------------------------------------------ | -------------------------------------------------- |
| `act`   | `--json`, `--timeout` (60s), `-d` dir, or positional strings | Run multiple actions sequentially (stops on error) |
| `query` | `--json`, or positional strings                              | Run multiple read-only queries                     |

**`act` JSON format:** `[{"action":"fill","label":"Email","value":"x"},{"action":"click","text":"Submit"}]`
**`act` positional:** `'goto "https://example.com"' 'click -t "Login"'`
**`query` types:** `gettext`, `inputvalue`, `getattribute`, `isvisible`, `isenabled`, `ischecked`, `boundingbox`

### Tabs (multi-tab management)

| Command        | Args / Flags                | Description                            |
| -------------- | --------------------------- | -------------------------------------- |
| `group tabs`   | —                           | List tabs in webnav group              |
| `group switch` | `<tabId>`                   | Switch active tab                      |
| `group add`    | `[tabId]`                   | Add tab to group (default: active tab) |
| `group remove` | `<tabId>`                   | Remove tab from group (keeps tab open) |
| `group close`  | `<tabId>`                   | Close tab                              |
| `history`      | `-n` limit (50), `--offset` | View command history                   |

### Utilities

| Command            | Args / Flags                                                                   | Description                                   |
| ------------------ | ------------------------------------------------------------------------------ | --------------------------------------------- |
| `util json-search` | `<file>` `[pattern]`, `-t` tag, `-r` role, `--ref`, `-n` limit (50), `--offset` | Search JSON file from elements/snapshot/observe |

### Setup

| Command           | Args / Flags                                              | Description                  |
| ----------------- | --------------------------------------------------------- | ---------------------------- |
| `setup install`   | `[extensionId]`, `-b` browser (chrome/edge/brave/vivaldi) | Install native host manifest |
| `setup uninstall` | `-b` browser (omit for all)                               | Remove native host manifest  |

## Key Concepts

**Snapshot refs** — `observe` and `snapshot` assign `@e1`, `@e2`, ... to elements. Use with `-r @e5` on `click`, `type`, `key`, `fill`, `wait-for` for precise targeting.

**`--screenshot` flag** — Available on `goto`, `click`, `fill`, `type`, `key`, `check`, `select`. Captures viewport after action. Saves to `--dir` or system temp.

**`click --wait-*` flags** — Combine click + wait in one call: `--wait-url "*/dashboard*"`, `--wait-text "Success"`, `--wait-selector ".results"`, `--wait-timeout 15000`.

**File output** — `elements`, `snapshot`, `observe`, `console`, and `errors` auto-save to file when results exceed 50 items. Output includes `nodeCount` + file path instead of inline data. Use `util json-search` to query the file.

## Workflows

**Start any session:**

```bash
webnav status
webnav goto "https://example.com" --screenshot
webnav observe
```

**Fill a form:**

```bash
webnav goto "https://example.com/login" --screenshot
webnav observe
webnav fill "Email" "user@example.com"
webnav fill "Password" "secret123"
webnav click -t "Sign In" --wait-url "*/dashboard*" --screenshot
```

**Batch form fill (fewer round trips):**

```bash
webnav goto "https://example.com/login" --screenshot
webnav observe
webnav act --json '[
  {"action":"fill","label":"Email","value":"user@example.com"},
  {"action":"fill","label":"Password","value":"secret123"},
  {"action":"click","text":"Sign In","waitUrl":"*/dashboard*","screenshot":true}
]'
```

**Precise targeting with snapshot refs:**

```bash
webnav observe
webnav click -r @e5
webnav fill -r @e7 "value"
```

**Search through large result sets:**

```bash
webnav observe                               # returns snapshotFile if >50 nodes
webnav util json-search /tmp/snapshot_*.json "Login"
webnav util json-search /tmp/snapshot_*.json --role button
webnav util json-search /tmp/snapshot_*.json --ref @e42
```

**Debug JS issues:**

```bash
webnav console
webnav errors
webnav evaluate "document.querySelector('#app').__vue__"
```

**Multi-tab workflow:**

```bash
webnav goto "https://site-a.com"
webnav goto "https://site-b.com" --new-tab
webnav group tabs
webnav group switch <tabId>
```

## Tips

- Prefer `fill` over click + type for form fields
- Prefer `observe` over `elements` — snapshot provides hierarchy, roles, and `@ref` IDs for precise targeting
- Use `elements` only when you need bounding box coordinates
- Use `act` to batch multiple actions in one round trip
- Use `click --wait-*` instead of click then wait-for
- Navigation commands (`goto`, `back`, `forward`, `reload`) auto-wait for page load
- Use `--screenshot` on action commands instead of separate screenshot call
- Use text matching (`-t`) over selectors when possible — more robust
- Use snapshot refs (`-r @e5`) for precise targeting after `observe`

## Error Handling

All errors return `{"ok":false, "error":"...", "code":"...", "hint":"..."}`.

## Architecture

```
CLI (webnav) → Unix Socket → Native Host → Native Messaging → Chrome Extension
```
