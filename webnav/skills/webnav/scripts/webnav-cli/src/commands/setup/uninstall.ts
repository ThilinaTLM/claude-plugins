import { existsSync, readdirSync, rmSync, unlinkSync } from "node:fs";
import { dirname } from "node:path";
import { defineCommand } from "citty";
import {
	BROWSER_SLUGS,
	getManifestPathForBrowser,
	parseBrowserSlug,
} from "../../lib/browsers";
import { getSocketPath } from "../../lib/errors";
import { jsonError, jsonOk } from "../../lib/output";

export const uninstallCommand = defineCommand({
	meta: {
		name: "uninstall",
		description: "Remove native messaging host manifest and runtime artifacts",
	},
	args: {
		browser: {
			type: "string",
			alias: "b",
			description: `Target browser to uninstall (omit to remove all): ${BROWSER_SLUGS.join(", ")}`,
			required: false,
		},
	},
	async run({ args }) {
		const removed: string[] = [];
		const browsers: string[] = [];

		if (args.browser) {
			const slug = parseBrowserSlug(args.browser);
			if (!slug) {
				jsonError(`Unknown browser "${args.browser}"`, "INVALID_ARGS", {
					summary: `Valid browsers: ${BROWSER_SLUGS.join(", ")}`,
				});
			}

			const manifestPath = getManifestPathForBrowser(slug);
			if (manifestPath && existsSync(manifestPath)) {
				unlinkSync(manifestPath);
				removed.push(manifestPath);
				browsers.push(slug);
			}
		} else {
			// No browser specified — remove all
			for (const slug of BROWSER_SLUGS) {
				const manifestPath = getManifestPathForBrowser(slug);
				if (manifestPath && existsSync(manifestPath)) {
					unlinkSync(manifestPath);
					removed.push(manifestPath);
					browsers.push(slug);
				}
			}
		}

		// Remove socket file
		const socketPath = getSocketPath();
		if (existsSync(socketPath)) {
			rmSync(socketPath);
			removed.push(socketPath);
		}

		// Remove ~/.webnav/ directory if empty
		const socketDir = dirname(socketPath);
		if (existsSync(socketDir)) {
			const entries = readdirSync(socketDir);
			if (entries.length === 0) {
				rmSync(socketDir, { recursive: true });
				removed.push(socketDir);
			}
		}

		jsonOk({ action: "uninstall", browsers, removed });
	},
});
