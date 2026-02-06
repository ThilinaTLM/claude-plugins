/**
 * Centralized error hints for self-documenting CLI errors.
 * Provides structured hints that AI can parse to guide users through setup/troubleshooting.
 */

import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import type { ErrorCode, ErrorHint } from "../types";
import {
	BROWSERS,
	type BrowserSlug,
	getInstalledBrowsers,
	getManifestPathForBrowser,
} from "./browsers";

const SOCKET_PATH = join(homedir(), ".webnav", "webnav.sock");
const EXTENSION_DIST_PATH = resolve(
	import.meta.dir,
	"../../../../extension/dist",
);

// ── Internal helpers ────────────────────────────────────────────────

function browserLabel(browser?: BrowserSlug): string {
	return browser ? BROWSERS[browser].name : "your browser";
}

function extensionsUrl(browser?: BrowserSlug): string {
	if (browser) return BROWSERS[browser].extensionsUrl;
	// Try to detect from installed manifests
	const installed = getInstalledBrowsers();
	if (installed.length === 1) return BROWSERS[installed[0]].extensionsUrl;
	return "chrome://extensions";
}

// ── Public path / state helpers ─────────────────────────────────────

/**
 * Get the native messaging manifest path.
 * If a browser is specified, returns its path. Otherwise returns the first
 * installed browser's path, falling back to Chrome.
 */
export function getManifestPath(browser?: BrowserSlug): string {
	if (browser) return getManifestPathForBrowser(browser);

	const installed = getInstalledBrowsers();
	if (installed.length > 0) return getManifestPathForBrowser(installed[0]);
	return getManifestPathForBrowser("chrome");
}

/**
 * Check if any browser has a native messaging manifest installed.
 */
export function manifestExists(): boolean {
	return getInstalledBrowsers().length > 0;
}

/**
 * Check if the socket exists (indicates native host is running).
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

// ── Connection error detection ──────────────────────────────────────

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

// ── Hint functions ──────────────────────────────────────────────────

/**
 * Full setup instructions for fresh systems.
 */
export function getSetupRequiredHint(browser?: BrowserSlug): ErrorHint {
	const label = browserLabel(browser);
	const extUrl = extensionsUrl(browser);

	return {
		summary: `WebNav has not been set up. Complete the one-time setup to connect ${label} to the CLI.`,
		steps: [
			"Step 1: Load the extension",
			`  - Open ${label}: ${extUrl}`,
			"  - Enable 'Developer mode' (top-right toggle)",
			"  - Click 'Load unpacked'",
			`  - Select: ${EXTENSION_DIST_PATH}`,
			"",
			"Step 2: Copy the Extension ID",
			`  - Find WebNav card in ${extUrl}`,
			"  - Copy the 32-character ID under the name",
			"",
			"Step 3: Run setup",
			browser
				? `  - Run: webnav setup install <your-id> --browser ${browser}`
				: "  - Run: webnav setup install <your-id>",
			"",
			"Step 4: Reload extension",
			`  - Click reload icon on WebNav card in ${extUrl}`,
			"",
			"Step 5: Verify",
			"  - Run: webnav status",
		],
		diagnostics: [
			"Check manifest: ls -la ~/.config/*/NativeMessagingHosts/ ~/Library/Application\\ Support/*/NativeMessagingHosts/ 2>/dev/null",
			"Check socket: ls -la ~/.webnav/",
		],
	};
}

/**
 * Hint when manifest exists but socket doesn't (extension not loaded/connected).
 */
export function getNotConnectedHint(browser?: BrowserSlug): ErrorHint {
	const label = browserLabel(browser);
	const extUrl = extensionsUrl(browser);

	return {
		summary: `WebNav is set up but the extension is not connected. The ${label} extension needs to be loaded and active.`,
		steps: [
			`Step 1: Check ${label} is running`,
			`  - Open ${label} if not already running`,
			"",
			"Step 2: Reload the extension",
			`  - Open ${label}: ${extUrl}`,
			"  - Find WebNav and click the reload icon",
			"",
			"Step 3: Verify connection",
			"  - Run: webnav status",
		],
		diagnostics: [
			"Check socket: ls -la ~/.webnav/",
			`Check extension errors: ${label} > ${extUrl} > WebNav > Errors`,
		],
		context:
			"The native messaging manifest exists but the native host socket is not present. This usually means the extension hasn't connected yet or the browser is not running.",
	};
}

/**
 * Hint when socket exists but connection fails (stale socket, native host crashed).
 */
export function getConnectionFailedHint(browser?: BrowserSlug): ErrorHint {
	const label = browserLabel(browser);
	const extUrl = extensionsUrl(browser);

	return {
		summary:
			"Connection to WebNav failed. The socket exists but the native host may have crashed or the socket is stale.",
		steps: [
			"Step 1: Remove stale socket",
			"  - Run: rm ~/.webnav/webnav.sock",
			"",
			"Step 2: Reload the extension",
			`  - Open ${label}: ${extUrl}`,
			"  - Find WebNav and click the reload icon",
			"",
			"Step 3: Verify connection",
			"  - Run: webnav status",
		],
		diagnostics: [
			"Check socket: ls -la ~/.webnav/",
			`Check if ${label} is running: pgrep -x chrome || pgrep -x 'Google Chrome'`,
		],
		context:
			"The socket file exists but the native host process is not responding. This can happen if the browser crashed or the extension was disabled.",
	};
}

/**
 * Hint when connected but extension doesn't respond.
 */
export function getExtensionDisconnectedHint(browser?: BrowserSlug): ErrorHint {
	const label = browserLabel(browser);
	const extUrl = extensionsUrl(browser);

	return {
		summary:
			"The native host is running but the extension is not responding. The extension may be disabled or unresponsive.",
		steps: [
			"Step 1: Check extension status",
			`  - Open ${label}: ${extUrl}`,
			"  - Verify WebNav is enabled (toggle should be on)",
			"",
			"Step 2: Reload the extension",
			"  - Click the reload icon on WebNav card",
			"",
			"Step 3: Check for errors",
			"  - Click 'Errors' on the WebNav card if visible",
			`  - Open ${label} DevTools (F12) > Console for extension errors`,
			"",
			"Step 4: Verify connection",
			"  - Run: webnav status",
		],
		diagnostics: [
			"Check native host logs: webnav native-host (run manually to see stderr)",
			"Check socket: ls -la ~/.webnav/",
		],
		context:
			"The native host socket is accepting connections but the extension is not sending responses. The extension may have been disabled or encountered an error.",
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
			`  - Open ${extensionsUrl()}`,
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
 * Hint when extension version doesn't match CLI version.
 */
export function getExtensionOutdatedHint(
	extensionVersion: string,
	cliVersion: string,
): ErrorHint {
	const extUrl = extensionsUrl();
	return {
		summary: `Extension version (${extensionVersion}) does not match CLI version (${cliVersion}). Update the extension to get the latest features and fixes.`,
		steps: [
			"Step 1: Reload the extension",
			`  - Open: ${extUrl}`,
			"  - Find WebNav and click the reload icon",
			"",
			"Step 2: Verify",
			"  - Run: webnav status",
		],
		context: `CLI version: ${cliVersion}, Extension version: ${extensionVersion}. The extension dist is rebuilt automatically when the CLI runs, but the browser needs to reload the extension to pick up the changes.`,
	};
}

/**
 * Hint for invalid extension ID format.
 */
export function getInvalidExtensionIdHint(
	providedId: string,
	browser?: BrowserSlug,
): ErrorHint {
	const extUrl = extensionsUrl(browser);
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
			"Step 1: Open extensions page",
			`  - Navigate to: ${extUrl}`,
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
			browser
				? `  - Run: webnav setup install <your-id> --browser ${browser}`
				: "  - Run: webnav setup install <your-id>",
		],
		context:
			issues.length > 0 ? `Issues found: ${issues.join("; ")}` : undefined,
	};
}

/**
 * Hint for missing extension ID argument.
 */
export function getMissingExtensionIdHint(browser?: BrowserSlug): ErrorHint {
	const extUrl = extensionsUrl(browser);

	return {
		summary: "Extension ID is required to configure native messaging.",
		steps: [
			"Step 1: Find your extension ID",
			`  - Open: ${extUrl}`,
			"  - Find WebNav card",
			"  - Copy the 32-character ID under the name",
			"",
			"Step 2: Run setup with the ID",
			browser
				? `  - Run: webnav setup install <your-id> --browser ${browser}`
				: "  - Run: webnav setup install <your-id>",
		],
	};
}
