import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonOk } from "../lib/output";
import { estimateTokens, saveJson } from "../lib/save-json";

const FILE_THRESHOLD = 10;

export const networkCommand = defineCommand({
	meta: {
		name: "network",
		description: "Get captured network requests (fetch and XHR)",
	},
	args: {
		clear: {
			type: "boolean",
			alias: "c",
			description: "Clear requests after reading",
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
			requests: unknown[];
			count: number;
		}>("network", { clear: args.clear });

		const output: Record<string, unknown> = {
			action: "network",
			count: result.count,
		};

		if (result.count > FILE_THRESHOLD) {
			output.file = saveJson(result.requests, "network", args.dir as string);
			output.tokens = estimateTokens(result.requests);
			output.hint =
				"For large files use `webnav util json-search <file> [pattern]` to search; small files can be read directly";
		} else {
			output.requests = result.requests;
		}

		jsonOk(output);
	},
});
