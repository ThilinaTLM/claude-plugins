import { defineCommand } from "citty";
import { sendCommand } from "../../lib/client";
import { jsonError, jsonOk } from "../../lib/output";
import type { GroupCloseResponse } from "../../types";

export const groupCloseCommand = defineCommand({
	meta: {
		name: "close",
		description: "Close a tab in the webnav group",
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

		const result = await sendCommand<GroupCloseResponse>("group-close", {
			tabId,
		});

		jsonOk({
			action: "group-close",
			tabId: result.tabId,
			url: result.url,
			title: result.title,
			closed: result.closed,
		});
	},
});
