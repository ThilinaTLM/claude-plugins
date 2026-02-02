import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir, platform } from "node:os";
import { dirname, join, resolve } from "node:path";
import { defineCommand } from "citty";
import {
	getInvalidExtensionIdHint,
	getMissingExtensionIdHint,
} from "../lib/errors";
import { jsonError, jsonOk } from "../lib/output";

function getHostWrapper(): string {
	const os = platform();
	return os === "win32" ? "webnav-host.ps1" : "webnav-host";
}

// Get the CLI root directory (webnav-cli/)
function getCliRoot(): string {
	const currentFile = new URL(import.meta.url).pathname;
	// Go up: commands -> src -> webnav-cli
	return resolve(dirname(currentFile), "..", "..");
}

function getNativeMessagingHostsDir(): string {
	const os = platform();

	if (os === "darwin") {
		// macOS
		return join(
			homedir(),
			"Library",
			"Application Support",
			"Google",
			"Chrome",
			"NativeMessagingHosts",
		);
	}
	if (os === "linux") {
		// Linux
		return join(homedir(), ".config", "google-chrome", "NativeMessagingHosts");
	}
	if (os === "win32") {
		// Windows - requires registry, we'll handle this differently
		jsonError(
			"Windows requires registry setup for native messaging",
			"SETUP_FAILED",
			"Please follow the manual setup instructions in SETUP.md",
		);
	}

	jsonError(`Unsupported platform: ${os}`, "SETUP_FAILED");
}

export const setupCommand = defineCommand({
	meta: {
		name: "setup",
		description: "Install the native messaging host manifest",
	},
	args: {
		"extension-id": {
			type: "string",
			alias: "e",
			description: "Chrome extension ID (find in chrome://extensions)",
			required: true,
		},
	},
	async run({ args }) {
		const extensionId = args["extension-id"] as string;

		if (!extensionId) {
			jsonError(
				"Extension ID is required",
				"INVALID_ARGS",
				getMissingExtensionIdHint(),
			);
		}

		// Validate extension ID format (32 lowercase letters)
		if (!/^[a-z]{32}$/.test(extensionId)) {
			jsonError(
				"Invalid extension ID format",
				"INVALID_ARGS",
				getInvalidExtensionIdHint(extensionId),
			);
		}

		const cliRoot = getCliRoot();
		const hostWrapper = join(cliRoot, getHostWrapper());

		// Verify static host wrapper exists
		if (!existsSync(hostWrapper)) {
			jsonError(
				`Native host wrapper not found: ${hostWrapper}`,
				"SETUP_FAILED",
				"Make sure the plugin is installed correctly",
			);
		}

		// Create the manifest with correct paths
		const manifest = {
			name: "com.tlmtech.webnav",
			description: "WebNav native messaging host for browser automation",
			path: hostWrapper,
			type: "stdio",
			allowed_origins: [`chrome-extension://${extensionId}/`],
		};

		// Get native messaging hosts directory
		const hostsDir = getNativeMessagingHostsDir();

		// Create directory if it doesn't exist
		if (!existsSync(hostsDir)) {
			mkdirSync(hostsDir, { recursive: true });
		}

		// Write manifest
		const manifestPath = join(hostsDir, "com.tlmtech.webnav.json");
		writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

		jsonOk({
			action: "setup",
			manifest: manifestPath,
			nativeHost: hostWrapper,
			extensionId,
			hostsDir,
			hint: "Now reload the extension in chrome://extensions to connect",
		});
	},
});
