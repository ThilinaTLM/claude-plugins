import { existsSync, readdirSync, rmSync, unlinkSync } from "node:fs";
import { dirname } from "node:path";
import { defineCommand } from "citty";
import { getManifestPath, getSocketPath } from "../../lib/errors";
import { jsonOk } from "../../lib/output";

export const uninstallCommand = defineCommand({
	meta: {
		name: "uninstall",
		description: "Remove native messaging host manifest and runtime artifacts",
	},
	async run() {
		const removed: string[] = [];

		// Remove native messaging manifest
		const manifestPath = getManifestPath();
		if (manifestPath && existsSync(manifestPath)) {
			unlinkSync(manifestPath);
			removed.push(manifestPath);
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

		jsonOk({ action: "uninstall", removed });
	},
});
