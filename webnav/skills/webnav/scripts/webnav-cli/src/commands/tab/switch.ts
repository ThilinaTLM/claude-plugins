import { defineCommand } from "citty";
import { sendCommand } from "../../lib/client";
import { jsonError, jsonOk } from "../../lib/output";
import type { TabSwitchResponse } from "../../types";

export const tabSwitchCommand = defineCommand({
	meta: {
		name: "switch",
		description: "Switch active tab",
	},
	args: {
		tabId: {
			type: "positional",
			description: "Tab ID to switch to",
			required: true,
		},
	},
	async run({ args }) {
		const tabId = Number(args.tabId);
		if (Number.isNaN(tabId)) {
			jsonError("tabId must be a number", "INVALID_ARGS");
		}

		const result = await sendCommand<TabSwitchResponse>("tab-switch", {
			tabId,
		});

		jsonOk({
			action: "tab-switch",
			activeTabId: result.activeTabId,
			url: result.url,
			title: result.title,
		});
	},
});
