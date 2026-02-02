import { defineCommand } from "citty";
import { isSocketAvailable, sendCommand } from "../lib/client";
import {
	getConnectionErrorHint,
	getExtensionDisconnectedHint,
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
			jsonOk({
				action: "status",
				connected: result.connected,
				version: result.version,
			});
		} catch {
			jsonError(
				"Extension not responding",
				"EXTENSION_DISCONNECTED",
				getExtensionDisconnectedHint(),
			);
		}
	},
});
