# webnav

A Claude Code plugin that gives Claude the ability to control your browser. It works through a Chrome extension and a native messaging bridge — Claude sends commands via the CLI, and the extension executes them in your browser.

## What Can It Do?

- **Browse the web** — Navigate to pages, go back/forward, reload, scroll, open new tabs
- **See what's on screen** — Take screenshots, read page structure via accessibility snapshots
- **Interact with pages** — Click buttons/links, fill forms, select dropdowns, check/uncheck boxes, type text, press keys
- **Wait for things** — Wait for elements to appear, pages to load, URLs to change
- **Read page data** — Get text content, input values, element attributes, check visibility and state
- **Run multiple actions** — Batch commands for efficient multi-step workflows
- **Debug pages** — View console logs, JS errors, network requests, execute JavaScript
- **Manage tabs** — Open, switch between, and close browser tabs

## Supported Browsers

- Google Chrome
- Brave
- Microsoft Edge
- Chromium

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
- A supported Chromium-based browser (see above)
- Linux, macOS, or Windows

## Setup

After installing the plugin, just ask your AI agent to use WebNav (e.g. "take a screenshot of this page" or "automate my browser"). The agent will detect the setup state automatically and guide you through any required steps — loading the extension, installing the native host, and verifying the connection.

No manual setup is needed.

## Architecture

```
CLI (webnav) → Unix Socket → Native Host → Native Messaging → Browser Extension
```

- **CLI** — Sends commands and receives JSON responses. Uses shell wrapper (`webnav` on Unix, `webnav.ps1` on Windows).
- **Native Host** — Relay process spawned by the browser via native messaging. Bridges the Unix socket and Chrome's stdio-based native messaging protocol.
- **Extension** — MV3 service worker that executes commands in the browser using content scripts and the Chrome APIs.

## License

MIT
