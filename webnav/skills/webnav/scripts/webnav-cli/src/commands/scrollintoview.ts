import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonError, jsonOk } from "../lib/output";

export const scrollIntoViewCommand = defineCommand({
	meta: {
		name: "scrollintoview",
		description: "Scroll an element into view",
	},
	args: {
		text: {
			type: "string",
			alias: "t",
			description: "Text content to find and scroll to",
		},
		selector: {
			type: "string",
			alias: "s",
			description: "CSS selector to find and scroll to",
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

		const result = await sendCommand<{
			scrolledTo: boolean;
			tag: string;
			text: string;
			position: { top: number; left: number };
		}>("scrollintoview", { text, selector });

		jsonOk({
			action: "scrollintoview",
			...result,
		});
	},
});
