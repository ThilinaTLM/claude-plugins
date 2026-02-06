import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonError, jsonOk } from "../lib/output";

export const evaluateCommand = defineCommand({
	meta: {
		name: "evaluate",
		description: "Evaluate a JavaScript expression in the page context",
	},
	args: {
		expression: {
			type: "positional",
			description: "JavaScript expression to evaluate",
			required: true,
		},
	},
	async run({ args }) {
		const expression = args.expression as string;

		if (!expression) {
			jsonError("Expression is required", "INVALID_ARGS");
		}

		const result = await sendCommand<{
			result: unknown;
			type: string;
		}>("evaluate", { expression });

		jsonOk({ action: "evaluate", ...result });
	},
});
