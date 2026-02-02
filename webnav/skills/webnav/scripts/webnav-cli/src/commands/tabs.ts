import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonOk } from "../lib/output";
import type { TabInfo } from "../types";

export const tabsCommand = defineCommand({
	meta: {
		name: "tabs",
		description: "List all browser tabs",
	},
	async run() {
		const result = await sendCommand<{ tabs: TabInfo[] }>("tabs");
		jsonOk({
			action: "tabs",
			count: result.tabs.length,
			tabs: result.tabs,
		});
	},
});
