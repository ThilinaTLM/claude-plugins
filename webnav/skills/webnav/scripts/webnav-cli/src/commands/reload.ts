import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonOk } from "../lib/output";

export const reloadCommand = defineCommand({
	meta: {
		name: "reload",
		description: "Reload the current page",
	},
	async run() {
		const result = await sendCommand<{ url: string; title: string }>("reload");

		jsonOk({
			action: "reload",
			url: result.url,
			title: result.title,
		});
	},
});
