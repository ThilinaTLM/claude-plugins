import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonError, jsonOk } from "../lib/output";
import { saveScreenshot } from "../lib/screenshot";

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
			description: "Open in a new tab",
			default: false,
		},
		screenshot: {
			type: "boolean",
			description: "Capture screenshot after navigation",
			default: false,
		},
		dir: {
			type: "string",
			alias: "d",
			description: "Screenshot output directory (default: system temp)",
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
		if (args.screenshot) {
			payload.screenshot = true;
		}

		const result = await sendCommand<{
			url: string;
			title: string;
			image?: string;
		}>("goto", payload);

		const output: Record<string, unknown> = {
			action: "goto",
			url: result.url,
			title: result.title,
		};

		if (result.image) {
			output.screenshot = saveScreenshot(result.image, args.dir as string);
		}

		jsonOk(output);
	},
});
