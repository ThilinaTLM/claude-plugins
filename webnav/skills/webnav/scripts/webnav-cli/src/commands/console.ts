import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonOk } from "../lib/output";
import { estimateTokens, saveJson } from "../lib/save-json";

const FILE_THRESHOLD = 10;

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
			output.tokens = estimateTokens(result.logs);
			output.hint =
				"For large files use `webnav util json-search <file> [pattern]` to search; small files can be read directly";
		} else {
			output.logs = result.logs;
		}

		jsonOk(output);
	},
});
