import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonOk } from "../lib/output";
import { estimateTokens, saveJson } from "../lib/save-json";

const FILE_THRESHOLD = 10;

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
		dir: {
			type: "string",
			alias: "d",
			description: "Output directory for large results (default: system temp)",
		},
	},
	async run({ args }) {
		const result = await sendCommand<{
			errors: unknown[];
			count: number;
		}>("errors", { clear: args.clear });

		const output: Record<string, unknown> = {
			action: "errors",
			count: result.count,
		};

		if (result.count > FILE_THRESHOLD) {
			output.file = saveJson(result.errors, "errors", args.dir as string);
			output.tokens = estimateTokens(result.errors);
			output.hint =
				"For large files use `webnav util json-search <file> [pattern]` to search; small files can be read directly";
		} else {
			output.errors = result.errors;
		}

		jsonOk(output);
	},
});
