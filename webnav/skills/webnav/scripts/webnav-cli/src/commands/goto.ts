import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonError, jsonOk } from "../lib/output";

export const gotoCommand = defineCommand({
	meta: {
		name: "goto",
		description: "Navigate to a URL",
	},
	args: {
		url: {
			type: "positional",
			description: "URL to navigate to",
			required: true,
		},
		"new-tab": {
			type: "boolean",
			alias: "n",
			description: "Open in a new tab within the webnav group",
			default: false,
		},
	},
	async run({ args }) {
		const url = args.url as string;

		if (!url) {
			jsonError("URL is required", "INVALID_ARGS");
		}

		// Add https:// if no protocol specified
		const normalizedUrl =
			url.startsWith("http://") || url.startsWith("https://")
				? url
				: `https://${url}`;

		const payload: Record<string, unknown> = { url: normalizedUrl };
		if (args["new-tab"]) {
			payload.newTab = true;
		}

		const result = await sendCommand<{ url: string; title: string }>(
			"goto",
			payload,
		);

		jsonOk({
			action: "goto",
			url: result.url,
			title: result.title,
		});
	},
});
