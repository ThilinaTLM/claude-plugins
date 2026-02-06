import { defineCommand } from "citty";
import { sendCommand } from "../../lib/client";
import { jsonOk } from "../../lib/output";
import type { TabListResponse } from "../../types";

export const tabListCommand = defineCommand({
	meta: {
		name: "list",
		description: "List managed tabs",
	},
	async run() {
		const result = await sendCommand<TabListResponse>("tab-list");

		jsonOk({
			action: "tab-list",
			tabs: result.tabs,
			activeTabId: result.activeTabId,
		});
	},
});
