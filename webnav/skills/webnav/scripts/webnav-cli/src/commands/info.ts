import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonOk } from "../lib/output";
import type { TabInfo } from "../types";

export const infoCommand = defineCommand({
	meta: {
		name: "info",
		description: "Get current tab info",
	},
	async run() {
		const result = await sendCommand<TabInfo>("info");
		jsonOk({
			action: "info",
			...result,
		});
	},
});
