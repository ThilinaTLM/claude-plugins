import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonError, jsonOk } from "../lib/output";
import { saveScreenshot } from "../lib/screenshot";

export const fillCommand = defineCommand({
	meta: {
		name: "fill",
		description: "Find an input by label and fill with value",
	},
	args: {
		label: {
			type: "positional",
			description: "Label, placeholder, or name of the input field",
		},
		value: {
			type: "positional",
			description: "Value to fill",
			required: true,
		},
		ref: {
			type: "string",
			alias: "r",
			description: "Element ref from snapshot (e.g. @e5)",
		},
		screenshot: {
			type: "boolean",
			description: "Capture screenshot after fill",
			default: false,
		},
		dir: {
			type: "string",
			alias: "d",
			description: "Screenshot output directory (default: system temp)",
		},
	},
	async run({ args }) {
		const label = args.label as string | undefined;
		const value = args.value as string;
		const ref = args.ref as string | undefined;

		if (!label && !ref) {
			jsonError("Label or --ref is required", "INVALID_ARGS");
		}

		if (value === undefined) {
			jsonError("Value is required", "INVALID_ARGS");
		}

		const result = await sendCommand<{
			filled: boolean;
			label: string;
			value: string;
			image?: string;
		}>("fill", {
			label,
			value,
			ref,
			screenshot: args.screenshot || undefined,
		});

		const output: Record<string, unknown> = {
			action: "fill",
			filled: result.filled,
			label: result.label,
			value: result.value,
		};

		if (result.image) {
			output.screenshot = saveScreenshot(result.image, args.dir as string);
		}

		jsonOk(output);
	},
});
