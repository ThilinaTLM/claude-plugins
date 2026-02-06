import { defineCommand } from "citty";
import { sendCommand } from "../../lib/client";
import { jsonOk } from "../../lib/output";
import type { TabNewResponse } from "../../types";

export const tabNewCommand = defineCommand({
	meta: {
		name: "new",
		description: "Open a new tab",
	},
	args: {
		url: {
			type: "positional",
			description: "URL to open (default: about:blank)",
			required: false,
		},
	},
	async run({ args }) {
		const payload: Record<string, unknown> = {};
		if (args.url) {
			const url = args.url as string;
			payload.url =
				url.startsWith("http://") || url.startsWith("https://")
					? url
					: `https://${url}`;
		}

		const result = await sendCommand<TabNewResponse>("tab-new", payload);

		jsonOk({
			action: "tab-new",
			tabId: result.tabId,
			url: result.url,
			title: result.title,
			activeTabId: result.activeTabId,
		});
	},
});
