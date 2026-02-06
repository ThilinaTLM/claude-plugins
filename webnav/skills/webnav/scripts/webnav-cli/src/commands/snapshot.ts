import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonOk } from "../lib/output";

export const snapshotCommand = defineCommand({
	meta: {
		name: "snapshot",
		description: "Get accessibility tree snapshot of the page",
	},
	args: {
		interactive: {
			type: "boolean",
			alias: "i",
			description: "Only show interactive elements",
			default: false,
		},
		selector: {
			type: "string",
			alias: "s",
			description: "CSS selector for subtree root",
		},
		"max-depth": {
			type: "string",
			alias: "d",
			description: "Maximum tree depth",
		},
		compact: {
			type: "boolean",
			alias: "c",
			description: "Return compact text format instead of tree",
			default: false,
		},
	},
	async run({ args }) {
		const payload: Record<string, unknown> = {};
		if (args.interactive) payload.interactive = true;
		if (args.selector) payload.selector = args.selector;
		if (args["max-depth"])
			payload.maxDepth = Number.parseInt(args["max-depth"] as string, 10);
		if (args.compact) payload.compact = true;

		const result = await sendCommand<{
			tree: unknown;
			nodeCount: number;
			compact?: boolean;
		}>("snapshot", payload);

		jsonOk({ action: "snapshot", ...result });
	},
});
