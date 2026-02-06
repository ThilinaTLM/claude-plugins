import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonOk } from "../lib/output";

export const backCommand = defineCommand({
	meta: {
		name: "back",
		description: "Navigate back in browser history",
	},
	async run() {
		const result = await sendCommand<{ url: string; title: string }>("back");

		jsonOk({
			action: "back",
			url: result.url,
			title: result.title,
		});
	},
});
