import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonError, jsonOk } from "../lib/output";

export const dialogCommand = defineCommand({
	meta: {
		name: "dialog",
		description: "Configure auto-handling of alert/confirm/prompt dialogs",
	},
	args: {
		action: {
			type: "string",
			alias: "a",
			description: "How to handle dialogs: accept or dismiss",
			required: true,
		},
		text: {
			type: "string",
			alias: "t",
			description: "Text to provide for prompt dialogs",
		},
	},
	async run({ args }) {
		const dialogAction = args.action as string;
		const text = args.text as string | undefined;

		if (dialogAction !== "accept" && dialogAction !== "dismiss") {
			jsonError(
				"Action must be 'accept' or 'dismiss'",
				"INVALID_ARGS",
				"Use -a accept or -a dismiss",
			);
		}

		const result = await sendCommand<{
			configured: boolean;
			action: string;
			text: string | null;
		}>("dialog", { dialogAction, text });

		jsonOk({ action: "dialog", ...result });
	},
});
