# WebNav Setup Guide

This guide walks through setting up WebNav for browser automation.

## Prerequisites

- [Bun](https://bun.sh) runtime installed
- Google Chrome browser
- Unix-like OS (Linux or macOS)

## Step 1: Install CLI Dependencies

```bash
cd skills/webnav/scripts/webnav-cli
bun install
```

## Step 2: Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `extension/` directory from this plugin
5. **Copy the Extension ID** - it's a 32-character string shown under the extension name

## Step 3: Install Native Host Manifest

Run the setup command with your extension ID:

```bash
webnav setup --extension-id <your-32-char-extension-id>
```

This command:
- Creates a wrapper script to run the native host
- Installs the native messaging manifest to Chrome's directory
- Configures the allowed extension origin

## Step 4: Connect Extension

1. Go back to `chrome://extensions`
2. Find WebNav and click the **reload** icon
3. The extension will connect to the native host

## Step 5: Verify Connection

```bash
webnav status
```

Should return:
```json
{"ok":true,"action":"status","connected":true,"version":"1.0.0"}
```

## Troubleshooting

### "Native host not running"

The extension isn't connected. Try:
1. Reload the extension in `chrome://extensions`
2. Check that the manifest path is correct
3. Verify bun is in PATH

### "Extension not responding"

The socket exists but extension isn't responding:
1. Check Chrome's extension error log (click "Errors" on the extension card)
2. Reload the extension
3. Make sure Chrome is running

### "Invalid extension ID format"

Extension IDs are exactly 32 lowercase letters (a-z). Copy it carefully from `chrome://extensions`.

### Permission Denied

Make sure the wrapper script is executable:
```bash
chmod +x skills/webnav/scripts/webnav-cli/webnav-host
```

### Check Native Host Logs

The native host writes to stderr. You can run it manually to see errors:
```bash
webnav daemon
```

### Socket Location

The Unix socket is at: `~/.webnav/webnav.sock`

Check if it exists:
```bash
ls -la ~/.webnav/
```

## Chromium-based Browsers

For other Chromium browsers, the NativeMessagingHosts directory differs:

| Browser | Linux Path |
|---------|-----------|
| Chrome | `~/.config/google-chrome/NativeMessagingHosts` |
| Chromium | `~/.config/chromium/NativeMessagingHosts` |
| Brave | `~/.config/BraveSoftware/Brave-Browser/NativeMessagingHosts` |
| Edge | `~/.config/microsoft-edge/NativeMessagingHosts` |

## Windows Support

Windows native messaging requires registry entries instead of manifest files. This is not yet automated. Contributions welcome!
