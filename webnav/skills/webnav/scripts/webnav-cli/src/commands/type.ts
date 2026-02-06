import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonError, jsonOk } from "../lib/output";
import { saveScreenshot } from "../lib/screenshot";

export const typeCommand = defineCommand({
	meta: {
		name: "type",
		description: "Type text into the focused element",
	},
	args: {
		text: {
			type: "positional",
			description: "Text to type",
			required: true,
		},
		ref: {
			type: "string",
			alias: "r",
			description: "Element ref from snapshot to focus first (e.g. @e5)",
		},
		screenshot: {
			type: "boolean",
			description: "Capture screenshot after typing",
			default: false,
		},
		dir: {
			type: "string",
			alias: "d",
			description: "Screenshot output directory (default: system temp)",
		},
	},
	async run({ args }) {
		const text = args.text as string;
		const ref = args.ref as string | undefined;

		if (!text) {
			jsonError("Text is required", "INVALID_ARGS");
		}

		const result = await sendCommand<{
			typed: boolean;
			value: string;
			image?: string;
		}>("type", { text, ref, screenshot: args.screenshot || undefined });

		const output: Record<string, unknown> = {
			action: "type",
			typed: result.typed,
			value: result.value,
		};

		if (result.image) {
			output.screenshot = saveScreenshot(result.image, args.dir as string);
		}

		jsonOk(output);
	},
});
