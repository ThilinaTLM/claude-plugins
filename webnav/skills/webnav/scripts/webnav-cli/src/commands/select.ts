import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonError, jsonOk } from "../lib/output";

export const selectCommand = defineCommand({
	meta: {
		name: "select",
		description: "Select an option from a <select> element",
	},
	args: {
		selector: {
			type: "string",
			alias: "s",
			description: "CSS selector for the <select> element",
		},
		text: {
			type: "string",
			alias: "t",
			description: "Text content to find the <select> element",
		},
		value: {
			type: "string",
			alias: "v",
			description: "Option value to select",
		},
		"option-text": {
			type: "string",
			alias: "o",
			description: "Option text to select",
		},
	},
	async run({ args }) {
		const selector = args.selector as string | undefined;
		const text = args.text as string | undefined;
		const optionValue = args.value as string | undefined;
		const optionText = args["option-text"] as string | undefined;

		if (!selector && !text) {
			jsonError(
				"Either --selector or --text is required",
				"INVALID_ARGS",
				"Use -s for CSS selector or -t to find by text",
			);
		}

		if (!optionValue && !optionText) {
			jsonError(
				"Either --value or --option-text is required",
				"INVALID_ARGS",
				"Use -v for option value or -o for option text",
			);
		}

		const result = await sendCommand<{
			selectedValue: string;
			selectedText: string;
		}>("select", { selector, text, optionValue, optionText });

		jsonOk({ action: "select", ...result });
	},
});
