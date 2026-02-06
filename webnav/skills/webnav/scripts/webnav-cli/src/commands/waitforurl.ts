import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonError, jsonOk } from "../lib/output";

export const waitforurlCommand = defineCommand({
	meta: {
		name: "waitforurl",
		description: "Wait for the URL to match a glob pattern",
	},
	args: {
		pattern: {
			type: "string",
			alias: "p",
			description: "URL glob pattern (e.g. *://example.com/*)",
			required: true,
		},
		timeout: {
			type: "string",
			alias: "t",
			description: "Timeout in milliseconds (default: 30000)",
		},
	},
	async run({ args }) {
		const pattern = args.pattern as string;
		const timeout = args.timeout
			? Number.parseInt(args.timeout as string, 10)
			: 30000;

		if (!pattern) {
			jsonError("Pattern is required", "INVALID_ARGS");
		}

		const result = await sendCommand<{
			matched: boolean;
			url: string;
			pattern: string;
		}>("waitforurl", { pattern, timeout }, { timeout: timeout + 5000 });

		jsonOk({ action: "waitforurl", ...result });
	},
});
