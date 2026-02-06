import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonOk } from "../lib/output";
import { saveJson } from "../lib/save-json";

const FILE_THRESHOLD = 50;

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
		dir: {
			type: "string",
			alias: "d",
			description: "Output directory for large results (default: system temp)",
		},
	},
	async run({ args }) {
		const result = await sendCommand<{
			logs: unknown[];
			count: number;
		}>("console", { clear: args.clear });

		const output: Record<string, unknown> = {
			action: "console",
			count: result.count,
		};

		if (result.count > FILE_THRESHOLD) {
			output.file = saveJson(result.logs, "console", args.dir as string);
		} else {
			output.logs = result.logs;
		}

		jsonOk(output);
	},
});
