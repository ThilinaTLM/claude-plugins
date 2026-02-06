import { defineCommand } from "citty";
import { sendCommand } from "../../lib/client";
import { jsonError, jsonOk } from "../../lib/output";
import type { TabCloseResponse } from "../../types";

export const tabCloseCommand = defineCommand({
	meta: {
		name: "close",
		description: "Close a tab",
	},
	args: {
		tabId: {
			type: "positional",
			description: "Tab ID to close",
			required: true,
		},
	},
	async run({ args }) {
		const tabId = Number(args.tabId);
		if (Number.isNaN(tabId)) {
			jsonError("tabId must be a number", "INVALID_ARGS");
		}

		const result = await sendCommand<TabCloseResponse>("tab-close", {
			tabId,
		});

		jsonOk({
			action: "tab-close",
			tabId: result.tabId,
			url: result.url,
			title: result.title,
			closed: result.closed,
		});
	},
});
