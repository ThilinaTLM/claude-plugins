import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonOk } from "../lib/output";
import type { HistoryResponse } from "../types";

export const historyCommand = defineCommand({
	meta: {
		name: "history",
		description: "View command history",
	},
	args: {
		limit: {
			type: "string",
			alias: "n",
			description: "Number of entries to show (default: 50)",
		},
		offset: {
			type: "string",
			description: "Skip N most recent entries (default: 0)",
		},
	},
	async run({ args }) {
		const payload: Record<string, unknown> = {};
		if (args.limit) {
			payload.limit = Number(args.limit);
		}
		if (args.offset) {
			payload.offset = Number(args.offset);
		}

		const result = await sendCommand<HistoryResponse>("history", payload);

		jsonOk({
			action: "history",
			entries: result.entries,
			total: result.total,
			limit: result.limit,
			offset: result.offset,
		});
	},
});
