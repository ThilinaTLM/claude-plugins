import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonError, jsonOk } from "../lib/output";

export const dblclickCommand = defineCommand({
	meta: {
		name: "dblclick",
		description: "Double-click an element",
	},
	args: {
		text: {
			type: "string",
			alias: "t",
			description: "Text content to find and double-click",
		},
		selector: {
			type: "string",
			alias: "s",
			description: "CSS selector to find and double-click",
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
			dblclicked: boolean;
			tag: string;
			text: string;
		}>("dblclick", { text, selector, index });

		jsonOk({ action: "dblclick", ...result });
	},
});
