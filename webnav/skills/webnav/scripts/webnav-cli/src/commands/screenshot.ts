import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonOk } from "../lib/output";
import { saveScreenshot } from "../lib/screenshot";

export const screenshotCommand = defineCommand({
	meta: {
		name: "screenshot",
		description: "Capture screenshot of the current tab",
	},
	args: {
		dir: {
			type: "string",
			alias: "d",
			description: "Output directory (default: system temp)",
		},
		"full-page": {
			type: "boolean",
			alias: "f",
			description: "Capture full page (not just viewport)",
			default: false,
		},
		selector: {
			type: "string",
			alias: "s",
			description: "CSS selector of element to screenshot",
		},
	},
	async run({ args }) {
		const payload: Record<string, unknown> = {};
		if (args["full-page"]) payload.fullPage = true;
		if (args.selector) payload.selector = args.selector;

		const result = await sendCommand<{
			image: string;
			url: string;
			title: string;
		}>("screenshot", payload);

		const filepath = saveScreenshot(result.image, args.dir as string);

		jsonOk({
			action: "screenshot",
			screenshot: filepath,
			url: result.url,
			title: result.title,
		});
	},
});
