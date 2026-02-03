import { defineCommand } from "citty";
import { sendCommand } from "../../lib/client";
import { jsonError, jsonOk } from "../../lib/output";
import type { GroupRemoveResponse } from "../../types";

export const groupRemoveCommand = defineCommand({
	meta: {
		name: "remove",
		description: "Remove a tab from the webnav group (keeps it open)",
	},
	args: {
		tabId: {
			type: "positional",
			description: "Tab ID to remove from group",
			required: true,
		},
	},
	async run({ args }) {
		const tabId = Number(args.tabId);
		if (Number.isNaN(tabId)) {
			jsonError("tabId must be a number", "INVALID_ARGS");
		}

		const result = await sendCommand<GroupRemoveResponse>("group-remove", {
			tabId,
		});

		jsonOk({
			action: "group-remove",
			tabId: result.tabId,
			url: result.url,
			title: result.title,
			removed: result.removed,
		});
	},
});
