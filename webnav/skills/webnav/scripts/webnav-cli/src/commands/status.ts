import { defineCommand } from "citty";
import pkg from "../../package.json";
import { isSocketAvailable, sendCommand } from "../lib/client";
import {
	getConnectionErrorHint,
	getExtensionDisconnectedHint,
	getExtensionOutdatedHint,
} from "../lib/errors";
import { jsonError, jsonOk } from "../lib/output";

export const statusCommand = defineCommand({
	meta: {
		name: "status",
		description: "Check if the extension is connected",
	},
	async run() {
		if (!isSocketAvailable()) {
			const { code, hint } = getConnectionErrorHint();
			const message =
				code === "SETUP_REQUIRED"
					? "WebNav has not been set up"
					: "Native host not running";
			jsonError(message, code, hint);
		}

		try {
			const result = await sendCommand<{ connected: boolean; version: string }>(
				"status",
				{},
				{ timeout: 5000 },
			);
			const response: Record<string, unknown> = {
				action: "status",
				connected: result.connected,
				version: result.version,
				cliVersion: pkg.version,
			};
			if (result.version !== pkg.version) {
				response.versionMismatch = true;
				response.hint = getExtensionOutdatedHint(result.version, pkg.version);
			}
			jsonOk(response);
		} catch {
			jsonError(
				"Extension not responding",
				"EXTENSION_DISCONNECTED",
				getExtensionDisconnectedHint(),
			);
		}
	},
});
