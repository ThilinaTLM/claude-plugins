import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonError, jsonOk } from "../lib/output";

export const clickCommand = defineCommand({
	meta: {
		name: "click",
		description: "Click an element by text or selector",
	},
	args: {
		text: {
			type: "string",
			alias: "t",
			description: "Text content to find and click",
		},
		selector: {
			type: "string",
			alias: "s",
			description: "CSS selector to find and click",
		},
		index: {
			type: "string",
			alias: "i",
			description: "Index if multiple matches (default: 0)",
		},
	},
	async run({ args }) {
		const text = args.text as string | undefined;
		const selector = args.selector as string | undefined;
		const index = args.index ? Number.parseInt(args.index as string, 10) : 0;

		if (!text && !selector) {
			jsonError(
				"Either --text or --selector is required",
				"INVALID_ARGS",
				"Use -t for text matching or -s for CSS selector",
			);
		}

		const result = await sendCommand<{
			clicked: boolean;
			tag: string;
			text: string;
		}>("click", { text, selector, index });

		jsonOk({
			action: "click",
			...result,
		});
	},
});
