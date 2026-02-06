import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonError, jsonOk } from "../lib/output";

export const gettextCommand = defineCommand({
	meta: {
		name: "gettext",
		description: "Get text content of an element",
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

		const result = await sendCommand<{ text: string }>("query", {
			type: "gettext",
			text,
			selector,
		});

		jsonOk({ action: "gettext", ...result });
	},
});
