import { defineCommand } from "citty";
import { sendCommand } from "../../lib/client";
import { jsonOk } from "../../lib/output";
import type { GroupAddResponse } from "../../types";

export const groupAddCommand = defineCommand({
	meta: {
		name: "add",
		description: "Add a tab to the webnav group",
	},
	args: {
		tabId: {
			type: "positional",
			description: "Tab ID to add (default: browser active tab)",
			required: false,
		},
	},
	async run({ args }) {
		const payload: Record<string, unknown> = {};
		if (args.tabId) {
			payload.tabId = Number(args.tabId);
		}

		const result = await sendCommand<GroupAddResponse>("group-add", payload);

		jsonOk({
			action: "group-add",
			tabId: result.tabId,
			url: result.url,
			title: result.title,
			groupId: result.groupId,
		});
	},
});
