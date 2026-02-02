import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonError, jsonOk } from "../lib/output";

export const waitForCommand = defineCommand({
	meta: {
		name: "wait-for",
		description: "Wait for an element to appear",
	},
	args: {
		text: {
			type: "string",
			alias: "t",
			description: "Text content to wait for",
		},
		selector: {
			type: "string",
			alias: "s",
			description: "CSS selector to wait for",
		},
		timeout: {
			type: "string",
			description: "Timeout in milliseconds (default: 10000)",
		},
	},
	async run({ args }) {
		const text = args.text as string | undefined;
		const selector = args.selector as string | undefined;
		const timeout = args.timeout
			? Number.parseInt(args.timeout as string, 10)
			: 10000;

		if (!text && !selector) {
			jsonError(
				"Either --text or --selector is required",
				"INVALID_ARGS",
				"Use -t for text matching or -s for CSS selector",
			);
		}

		const result = await sendCommand<{ found: boolean }>(
			"wait-for",
			{ text, selector, timeout },
			{ timeout: timeout + 5000 }, // Add buffer to CLI timeout
		);

		jsonOk({
			action: "wait-for",
			...result,
		});
	},
});
