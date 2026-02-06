import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonError, jsonOk } from "../lib/output";
import { saveScreenshot } from "../lib/screenshot";

const VALID_KEYS = [
	"enter",
	"tab",
	"escape",
	"backspace",
	"delete",
	"arrowup",
	"arrowdown",
	"arrowleft",
	"arrowright",
	"space",
];

export const keyCommand = defineCommand({
	meta: {
		name: "key",
		description: "Send a keyboard event",
	},
	args: {
		key: {
			type: "positional",
			description: `Key to send (${VALID_KEYS.join(", ")})`,
			required: true,
		},
		ref: {
			type: "string",
			alias: "r",
			description: "Element ref from snapshot to focus first (e.g. @e5)",
		},
		screenshot: {
			type: "boolean",
			description: "Capture screenshot after key event",
			default: false,
		},
		dir: {
			type: "string",
			alias: "d",
			description: "Screenshot output directory (default: system temp)",
		},
	},
	async run({ args }) {
		const key = (args.key as string).toLowerCase();
		const ref = args.ref as string | undefined;

		if (!key) {
			jsonError("Key is required", "INVALID_ARGS");
		}

		if (!VALID_KEYS.includes(key)) {
			jsonError(
				`Invalid key: ${key}`,
				"INVALID_ARGS",
				`Valid keys: ${VALID_KEYS.join(", ")}`,
			);
		}

		const result = await sendCommand<{
			sent: boolean;
			key: string;
			image?: string;
		}>("key", { key, ref, screenshot: args.screenshot || undefined });

		const output: Record<string, unknown> = {
			action: "key",
			sent: result.sent,
			key: result.key,
		};

		if (result.image) {
			output.screenshot = saveScreenshot(result.image, args.dir as string);
		}

		jsonOk(output);
	},
});
