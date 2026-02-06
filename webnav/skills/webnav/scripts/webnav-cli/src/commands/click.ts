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
		ref: {
			type: "string",
			alias: "r",
			description: "Element ref from snapshot (e.g. @e5)",
		},
		exact: {
			type: "boolean",
			alias: "x",
			description: "Exact text match instead of substring",
		},
	},
	async run({ args }) {
		const text = args.text as string | undefined;
		const selector = args.selector as string | undefined;
		const ref = args.ref as string | undefined;
		const index = args.index ? Number.parseInt(args.index as string, 10) : 0;
		const exact = args.exact as boolean | undefined;

		if (!text && !selector && !ref) {
			jsonError(
				"Either --text, --selector, or --ref is required",
				"INVALID_ARGS",
				"Use -t for text, -s for CSS selector, or -r for snapshot ref",
			);
		}

		const result = await sendCommand<{
			clicked: boolean;
			tag: string;
			text: string;
		}>("click", { text, selector, index, ref, exact });

		jsonOk({
			action: "click",
			...result,
		});
	},
});
