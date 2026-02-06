import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonOk } from "../lib/output";

export const waitforloadCommand = defineCommand({
	meta: {
		name: "waitforload",
		description: "Wait for the page to finish loading",
	},
	args: {
		timeout: {
			type: "string",
			alias: "t",
			description: "Timeout in milliseconds (default: 30000)",
		},
	},
	async run({ args }) {
		const timeout = args.timeout
			? Number.parseInt(args.timeout as string, 10)
			: 30000;

		const result = await sendCommand<{
			loaded: boolean;
			url: string;
			title: string;
		}>("waitforload", { timeout }, { timeout: timeout + 5000 });

		jsonOk({ action: "waitforload", ...result });
	},
});
