import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonOk } from "../lib/output";

export const forwardCommand = defineCommand({
	meta: {
		name: "forward",
		description: "Navigate forward in browser history",
	},
	async run() {
		const result = await sendCommand<{ url: string; title: string }>("forward");

		jsonOk({
			action: "forward",
			url: result.url,
			title: result.title,
		});
	},
});
