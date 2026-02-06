import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonError, jsonOk } from "../lib/output";

export const getattributeCommand = defineCommand({
	meta: {
		name: "getattribute",
		description: "Get an attribute value from an element",
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
		name: {
			type: "string",
			alias: "n",
			description: "Attribute name to retrieve",
			required: true,
		},
	},
	async run({ args }) {
		const text = args.text as string | undefined;
		const selector = args.selector as string | undefined;
		const name = args.name as string;

		if (!text && !selector) {
			jsonError(
				"Either --text or --selector is required",
				"INVALID_ARGS",
				"Use -t for text matching or -s for CSS selector",
			);
		}

		const result = await sendCommand<{
			name: string;
			value: string | null;
			exists: boolean;
		}>("query", { type: "getattribute", text, selector, name });

		jsonOk({ action: "getattribute", ...result });
	},
});
