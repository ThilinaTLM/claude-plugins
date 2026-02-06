import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonOk } from "../lib/output";
import { saveJson } from "../lib/save-json";

const FILE_THRESHOLD = 50;

export const snapshotCommand = defineCommand({
	meta: {
		name: "snapshot",
		description: "Get accessibility tree snapshot of the page",
	},
	args: {
		all: {
			type: "boolean",
			alias: "a",
			description: "Include all elements, not just interactive",
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
		dir: {
			type: "string",
			description: "Output directory for large results (default: system temp)",
		},
	},
	async run({ args }) {
		const payload: Record<string, unknown> = {};
		payload.interactive = !args.all;
		if (args.selector) payload.selector = args.selector;
		if (args["max-depth"])
			payload.maxDepth = Number.parseInt(args["max-depth"] as string, 10);
		if (args.compact) payload.compact = true;

		const result = await sendCommand<{
			tree: unknown;
			nodeCount: number;
			compact?: boolean;
		}>("snapshot", payload);

		const output: Record<string, unknown> = {
			action: "snapshot",
			nodeCount: result.nodeCount,
		};

		if (result.compact !== undefined) output.compact = result.compact;

		if (result.nodeCount > FILE_THRESHOLD) {
			output.file = saveJson(result.tree, "snapshot", args.dir as string);
		} else {
			output.tree = result.tree;
		}

		jsonOk(output);
	},
});
