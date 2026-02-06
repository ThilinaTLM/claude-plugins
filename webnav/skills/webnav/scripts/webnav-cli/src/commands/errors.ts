import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonOk } from "../lib/output";

export const errorsCommand = defineCommand({
	meta: {
		name: "errors",
		description: "Get captured JavaScript errors",
	},
	args: {
		clear: {
			type: "boolean",
			alias: "c",
			description: "Clear errors after reading",
			default: false,
		},
	},
	async run({ args }) {
		const result = await sendCommand<{
			errors: unknown[];
			count: number;
		}>("errors", { clear: args.clear });

		jsonOk({ action: "errors", ...result });
	},
});
