import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonError, jsonOk } from "../lib/output";
import { saveScreenshot } from "../lib/screenshot";

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
		screenshot: {
			type: "boolean",
			description: "Capture screenshot after select",
			default: false,
		},
		dir: {
			type: "string",
			alias: "d",
			description: "Screenshot output directory (default: system temp)",
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
			image?: string;
		}>("select", {
			selector,
			text,
			optionValue,
			optionText,
			screenshot: args.screenshot || undefined,
		});

		const output: Record<string, unknown> = {
			action: "select",
			selectedValue: result.selectedValue,
			selectedText: result.selectedText,
		};

		if (result.image) {
			output.screenshot = saveScreenshot(result.image, args.dir as string);
		}

		jsonOk(output);
	},
});
