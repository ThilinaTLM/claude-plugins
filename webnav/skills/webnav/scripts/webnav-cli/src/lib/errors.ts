/**
 * Centralized error hints for self-documenting CLI errors.
 * Provides structured hints that AI can parse to guide users through setup/troubleshooting.
 */

import { existsSync } from "node:fs";
import { homedir, platform } from "node:os";
import { join } from "node:path";
import type { ErrorCode, ErrorHint } from "../types";

const SOCKET_PATH = join(homedir(), ".webnav", "webnav.sock");

/**
 * Get the native messaging manifest path based on platform.
 */
export function getManifestPath(): string {
	const os = platform();
	if (os === "darwin") {
		return join(
			homedir(),
			"Library",
			"Application Support",
			"Google",
			"Chrome",
			"NativeMessagingHosts",
			"com.tlmtech.webnav.json",
		);
	}
	if (os === "linux") {
		return join(
			homedir(),
			".config",
			"google-chrome",
			"NativeMessagingHosts",
			"com.tlmtech.webnav.json",
		);
	}
	if (os === "win32") {
		return join(
			homedir(),
			"AppData",
			"Local",
			"Google",
			"Chrome",
			"User Data",
			"NativeMessagingHosts",
			"com.tlmtech.webnav.json",
		);
	}
	return "";
}

/**
 * Check if the native messaging manifest exists (indicates setup was run).
 */
export function manifestExists(): boolean {
	const path = getManifestPath();
	return path !== "" && existsSync(path);
}

/**
 * Check if the socket exists (indicates daemon is running).
 */
export function socketExists(): boolean {
	return existsSync(SOCKET_PATH);
}

/**
 * Get the socket path.
 */
export function getSocketPath(): string {
	return SOCKET_PATH;
}

/**
 * Detect connection state and return appropriate error code and hint.
 */
export function getConnectionErrorHint(): { code: ErrorCode; hint: ErrorHint } {
	const hasManifest = manifestExists();
	const hasSocket = socketExists();

	if (!hasManifest) {
		return {
			code: "SETUP_REQUIRED",
			hint: getSetupRequiredHint(),
		};
	}

	if (!hasSocket) {
		return {
			code: "NOT_CONNECTED",
			hint: getNotConnectedHint(),
		};
	}

	// Socket exists but connection failed - likely stale
	return {
		code: "CONNECTION_FAILED",
		hint: getConnectionFailedHint(),
	};
}

/**
 * Full setup instructions for fresh systems.
 */
export function getSetupRequiredHint(): ErrorHint {
	const manifestDir =
		platform() === "darwin"
			? "~/Library/Application Support/Google/Chrome/NativeMessagingHosts/"
			: "~/.config/google-chrome/NativeMessagingHosts/";

	return {
		summary:
			"WebNav has not been set up. Complete the one-time setup to connect Chrome to the CLI.",
		steps: [
			"Step 1: Load the Chrome extension",
			"  - Open Chrome: chrome://extensions",
			"  - Enable 'Developer mode' (top-right toggle)",
			"  - Click 'Load unpacked'",
			"  - Select: ${CLAUDE_PLUGIN_ROOT}/extension/",
			"",
			"Step 2: Copy the Extension ID",
			"  - Find WebNav card in chrome://extensions",
			"  - Copy the 32-character ID under the name",
			"",
			"Step 3: Run setup",
			"  - Run: webnav setup install <your-id>",
			"",
			"Step 4: Reload extension",
			"  - Click reload icon on WebNav card in chrome://extensions",
			"",
			"Step 5: Verify",
			"  - Run: webnav status",
		],
		diagnostics: [
			`Check manifest: ls -la ${manifestDir}`,
			"Check socket: ls -la ~/.webnav/",
		],
	};
}

/**
 * Hint when manifest exists but socket doesn't (extension not loaded/connected).
 */
export function getNotConnectedHint(): ErrorHint {
	return {
		summary:
			"WebNav is set up but the extension is not connected. The Chrome extension needs to be loaded and active.",
		steps: [
			"Step 1: Check Chrome is running",
			"  - Open Chrome if not already running",
			"",
			"Step 2: Reload the extension",
			"  - Open Chrome: chrome://extensions",
			"  - Find WebNav and click the reload icon",
			"",
			"Step 3: Verify connection",
			"  - Run: webnav status",
		],
		diagnostics: [
			"Check socket: ls -la ~/.webnav/",
			"Check extension errors: Chrome > chrome://extensions > WebNav > Errors",
		],
		context:
			"The native messaging manifest exists but the daemon socket is not present. This usually means the extension hasn't connected yet or Chrome is not running.",
	};
}

/**
 * Hint when socket exists but connection fails (stale socket, daemon crashed).
 */
export function getConnectionFailedHint(): ErrorHint {
	return {
		summary:
			"Connection to WebNav failed. The socket exists but the daemon may have crashed or the socket is stale.",
		steps: [
			"Step 1: Remove stale socket",
			"  - Run: rm ~/.webnav/webnav.sock",
			"",
			"Step 2: Reload the extension",
			"  - Open Chrome: chrome://extensions",
			"  - Find WebNav and click the reload icon",
			"",
			"Step 3: Verify connection",
			"  - Run: webnav status",
		],
		diagnostics: [
			"Check socket: ls -la ~/.webnav/",
			"Check if Chrome is running: pgrep -x chrome || pgrep -x 'Google Chrome'",
		],
		context:
			"The socket file exists but the daemon process is not responding. This can happen if Chrome crashed or the extension was disabled.",
	};
}

/**
 * Hint when connected but extension doesn't respond.
 */
export function getExtensionDisconnectedHint(): ErrorHint {
	return {
		summary:
			"The native host is running but the extension is not responding. The extension may be disabled or unresponsive.",
		steps: [
			"Step 1: Check extension status",
			"  - Open Chrome: chrome://extensions",
			"  - Verify WebNav is enabled (toggle should be on)",
			"",
			"Step 2: Reload the extension",
			"  - Click the reload icon on WebNav card",
			"",
			"Step 3: Check for errors",
			"  - Click 'Errors' on the WebNav card if visible",
			"  - Open Chrome DevTools (F12) > Console for extension errors",
			"",
			"Step 4: Verify connection",
			"  - Run: webnav status",
		],
		diagnostics: [
			"Check daemon logs: webnav daemon (run manually to see stderr)",
			"Check socket: ls -la ~/.webnav/",
		],
		context:
			"The daemon socket is accepting connections but the Chrome extension is not sending responses. The extension may have been disabled or encountered an error.",
	};
}

/**
 * Hint for timeout errors.
 */
export function getTimeoutHint(timeoutMs: number): ErrorHint {
	return {
		summary: `Command timed out after ${timeoutMs}ms. The page may be loading slowly or the extension is unresponsive.`,
		steps: [
			"Step 1: Check if page is still loading",
			"  - Wait for the page to finish loading",
			"  - Retry the command",
			"",
			"Step 2: If page is loaded, reload extension",
			"  - Open Chrome: chrome://extensions",
			"  - Click reload icon on WebNav card",
			"",
			"Step 3: Retry the command",
			"  - Run your command again",
		],
		diagnostics: ["Check extension status: webnav status"],
		context:
			"Commands have a default 30-second timeout. Very slow pages or an unresponsive extension can cause timeouts.",
	};
}

/**
 * Hint for invalid extension ID format.
 */
export function getInvalidExtensionIdHint(providedId: string): ErrorHint {
	const issues: string[] = [];
	if (providedId.length !== 32) {
		issues.push(`Got ${providedId.length} characters, expected 32`);
	}
	if (/[A-Z]/.test(providedId)) {
		issues.push("Contains uppercase letters (should be lowercase only)");
	}
	if (/[^a-zA-Z]/.test(providedId)) {
		issues.push("Contains non-letter characters (should be letters a-z only)");
	}

	return {
		summary:
			"Invalid extension ID format. Extension IDs are exactly 32 lowercase letters.",
		steps: [
			"Step 1: Open Chrome extensions",
			"  - Navigate to: chrome://extensions",
			"",
			"Step 2: Find WebNav extension",
			"  - Look for the WebNav card",
			"  - The ID is the 32-character string under the extension name",
			"",
			"Step 3: Copy carefully",
			"  - Select and copy the entire ID",
			"  - Make sure no extra spaces or characters are included",
			"",
			"Step 4: Run setup again",
			"  - Run: webnav setup install <your-id>",
		],
		context:
			issues.length > 0 ? `Issues found: ${issues.join("; ")}` : undefined,
	};
}

/**
 * Hint for missing extension ID argument.
 */
export function getMissingExtensionIdHint(): ErrorHint {
	return {
		summary: "Extension ID is required to configure native messaging.",
		steps: [
			"Step 1: Find your extension ID",
			"  - Open Chrome: chrome://extensions",
			"  - Find WebNav card",
			"  - Copy the 32-character ID under the name",
			"",
			"Step 2: Run setup with the ID",
			"  - Run: webnav setup install <your-id>",
		],
	};
}
