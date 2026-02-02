import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonError, jsonOk } from "../lib/output";

export const fillCommand = defineCommand({
	meta: {
		name: "fill",
		description: "Find an input by label and fill with value",
	},
	args: {
		label: {
			type: "positional",
			description: "Label, placeholder, or name of the input field",
			required: true,
		},
		value: {
			type: "positional",
			description: "Value to fill",
			required: true,
		},
	},
	async run({ args }) {
		const label = args.label as string;
		const value = args.value as string;

		if (!label) {
			jsonError("Label is required", "INVALID_ARGS");
		}

		if (value === undefined) {
			jsonError("Value is required", "INVALID_ARGS");
		}

		const result = await sendCommand<{
			filled: boolean;
			label: string;
			value: string;
		}>("fill", { label, value });

		jsonOk({
			action: "fill",
			...result,
		});
	},
});
