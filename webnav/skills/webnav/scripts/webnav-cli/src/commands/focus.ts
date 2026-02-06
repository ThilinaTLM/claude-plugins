import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonError, jsonOk } from "../lib/output";

export const focusCommand = defineCommand({
	meta: {
		name: "focus",
		description: "Focus an element",
	},
	args: {
		text: {
			type: "string",
			alias: "t",
			description: "Text content to find element",
		},
		selector: {
			type: "string",
			alias: "s",
			description: "CSS selector to find element",
		},
	},
	async run({ args }) {
		const text = args.text as string | undefined;
		const selector = args.selector as string | undefined;

		if (!text && !selector) {
			jsonError(
				"Either --text or --selector is required",
				"INVALID_ARGS",
				"Use -t for text matching or -s for CSS selector",
			);
		}

		const result = await sendCommand<{ focused: boolean; tag: string }>(
			"focus",
			{ text, selector },
		);

		jsonOk({ action: "focus", ...result });
	},
});
