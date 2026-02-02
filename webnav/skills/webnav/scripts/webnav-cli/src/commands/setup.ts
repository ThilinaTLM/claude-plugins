import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { homedir, platform } from "node:os";
import { dirname, join, resolve } from "node:path";
import { defineCommand } from "citty";
import { jsonError, jsonOk } from "../lib/output";

// Get the plugin root (4 levels up from this file: commands -> src -> webnav-cli -> scripts -> webnav -> skills -> webnav)
function getPluginRoot(): string {
	// __dirname equivalent for this module
	const currentFile = new URL(import.meta.url).pathname;
	// Go up: commands -> src -> webnav-cli -> scripts -> webnav (skill) -> skills -> webnav (plugin)
	return resolve(dirname(currentFile), "..", "..", "..", "..", "..", "..");
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
				"Find your extension ID in chrome://extensions after loading the unpacked extension",
			);
		}

		// Validate extension ID format (32 lowercase letters)
		if (!/^[a-z]{32}$/.test(extensionId)) {
			jsonError(
				"Invalid extension ID format",
				"INVALID_ARGS",
				"Extension ID should be 32 lowercase letters (found in chrome://extensions)",
			);
		}

		const pluginRoot = getPluginRoot();
		const nativeHostDir = join(pluginRoot, "native-host");
		const nativeHostScript = join(nativeHostDir, "src", "index.ts");
		const manifestTemplate = join(
			nativeHostDir,
			"manifests",
			"com.tlmtech.webnav.json",
		);

		// Verify native host files exist
		if (!existsSync(nativeHostScript)) {
			jsonError(
				`Native host script not found: ${nativeHostScript}`,
				"SETUP_FAILED",
				"Make sure the plugin is installed correctly",
			);
		}

		if (!existsSync(manifestTemplate)) {
			jsonError(
				`Manifest template not found: ${manifestTemplate}`,
				"SETUP_FAILED",
				"Make sure the plugin is installed correctly",
			);
		}

		// Create wrapper script that runs the native host with bun
		const wrapperScript = join(nativeHostDir, "webnav-host");
		const wrapperContent = `#!/bin/bash
exec bun run "${nativeHostScript}"
`;
		writeFileSync(wrapperScript, wrapperContent, { mode: 0o755 });

		// Create the manifest with correct paths
		const manifest = {
			name: "com.tlmtech.webnav",
			description: "WebNav native messaging host for browser automation",
			path: wrapperScript,
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

		// Install native host dependencies
		const nativeHostPackageJson = join(nativeHostDir, "package.json");
		if (existsSync(nativeHostPackageJson)) {
			const { execSync } = await import("node:child_process");
			try {
				execSync("bun install", { cwd: nativeHostDir, stdio: "pipe" });
			} catch {
				// Dependencies are optional, continue anyway
			}
		}

		jsonOk({
			action: "setup",
			manifest: manifestPath,
			nativeHost: wrapperScript,
			extensionId,
			hostsDir,
			hint: "Now reload the extension in chrome://extensions to connect",
		});
	},
});
