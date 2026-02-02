import { defineCommand } from "citty";
import { isSocketAvailable, sendCommand } from "../lib/client";
import { jsonError, jsonOk } from "../lib/output";

export const statusCommand = defineCommand({
	meta: {
		name: "status",
		description: "Check if the extension is connected",
	},
	async run() {
		if (!isSocketAvailable()) {
			jsonError(
				"Native host not running",
				"NOT_CONNECTED",
				"Load the extension in Chrome to start the native host.",
			);
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
				"NOT_CONNECTED",
				"The native host is running but the extension is not connected.",
			);
		}
	},
});
