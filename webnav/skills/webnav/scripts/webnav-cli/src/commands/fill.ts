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
		}>("fill", { label, value, ref });

		jsonOk({
			action: "fill",
			...result,
		});
	},
});
