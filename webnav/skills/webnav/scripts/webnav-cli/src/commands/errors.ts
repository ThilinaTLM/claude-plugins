import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonOk } from "../lib/output";
import { saveJson } from "../lib/save-json";

const FILE_THRESHOLD = 50;

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
			output.hint =
				"Use `webnav util json-search <file> [pattern]` to search this file";
		} else {
			output.errors = result.errors;
		}

		jsonOk(output);
	},
});
