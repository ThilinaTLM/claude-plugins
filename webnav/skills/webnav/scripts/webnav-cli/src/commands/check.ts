import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonError, jsonOk } from "../lib/output";
import { saveScreenshot } from "../lib/screenshot";

export const checkCommand = defineCommand({
	meta: {
		name: "check",
		description: "Check a checkbox or radio button",
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
		screenshot: {
			type: "boolean",
			description: "Capture screenshot after check",
			default: false,
		},
		dir: {
			type: "string",
			alias: "d",
			description: "Screenshot output directory (default: system temp)",
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
			checked: boolean;
			changed: boolean;
			image?: string;
		}>("check", {
			text,
			selector,
			screenshot: args.screenshot || undefined,
		});

		const output: Record<string, unknown> = {
			action: "check",
			checked: result.checked,
			changed: result.changed,
		};

		if (result.image) {
			output.screenshot = saveScreenshot(result.image, args.dir as string);
		}

		jsonOk(output);
	},
});
