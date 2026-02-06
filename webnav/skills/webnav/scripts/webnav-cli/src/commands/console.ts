import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonOk } from "../lib/output";

export const consoleCommand = defineCommand({
	meta: {
		name: "console",
		description: "Get captured console log messages",
	},
	args: {
		clear: {
			type: "boolean",
			alias: "c",
			description: "Clear logs after reading",
			default: false,
		},
	},
	async run({ args }) {
		const result = await sendCommand<{
			logs: unknown[];
			count: number;
		}>("console", { clear: args.clear });

		jsonOk({ action: "console", ...result });
	},
});
