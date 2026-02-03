import { defineCommand } from "citty";
import { sendCommand } from "../../lib/client";
import { jsonOk } from "../../lib/output";
import type { GroupTabsResponse } from "../../types";

export const groupTabsCommand = defineCommand({
	meta: {
		name: "tabs",
		description: "List tabs in the webnav group",
	},
	async run() {
		const result = await sendCommand<GroupTabsResponse>("group-tabs");

		jsonOk({
			action: "group-tabs",
			tabs: result.tabs,
			activeTabId: result.activeTabId,
		});
	},
});
