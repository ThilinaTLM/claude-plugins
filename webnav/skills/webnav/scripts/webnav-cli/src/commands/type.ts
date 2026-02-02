import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonError, jsonOk } from "../lib/output";

export const typeCommand = defineCommand({
	meta: {
		name: "type",
		description: "Type text into the focused element",
	},
	args: {
		text: {
			type: "positional",
			description: "Text to type",
			required: true,
		},
	},
	async run({ args }) {
		const text = args.text as string;

		if (!text) {
			jsonError("Text is required", "INVALID_ARGS");
		}

		const result = await sendCommand<{ typed: boolean; value: string }>(
			"type",
			{ text },
		);

		jsonOk({
			action: "type",
			...result,
		});
	},
});
