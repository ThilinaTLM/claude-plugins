import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonError, jsonOk } from "../lib/output";

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
	},
	async run({ args }) {
		const key = (args.key as string).toLowerCase();

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

		const result = await sendCommand<{ sent: boolean; key: string }>("key", {
			key,
		});

		jsonOk({
			action: "key",
			...result,
		});
	},
});
