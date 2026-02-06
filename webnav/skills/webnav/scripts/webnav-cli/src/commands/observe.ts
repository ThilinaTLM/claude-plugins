import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonOk } from "../lib/output";
import { saveScreenshot } from "../lib/screenshot";

export const observeCommand = defineCommand({
	meta: {
		name: "observe",
		description:
			"Get page state: screenshot + interactive elements + optional snapshot",
	},
	args: {
		"no-screenshot": {
			type: "boolean",
			description: "Skip screenshot capture",
			default: false,
		},
		snapshot: {
			type: "boolean",
			description: "Include accessibility tree snapshot",
			default: false,
		},
		compact: {
			type: "boolean",
			alias: "c",
			description: "Compact text format for snapshot",
			default: false,
		},
		dir: {
			type: "string",
			alias: "d",
			description: "Screenshot output directory (default: system temp)",
		},
	},
	async run({ args }) {
		const result = await sendCommand<{
			url: string;
			title: string;
			image?: string;
			elements: unknown[];
			count: number;
			tree?: unknown;
			nodeCount?: number;
		}>("observe", {
			noScreenshot: args["no-screenshot"] || undefined,
			snapshot: args.snapshot || undefined,
			compact: args.compact || undefined,
		});

		const output: Record<string, unknown> = {
			action: "observe",
			url: result.url,
			title: result.title,
		};

		if (result.image) {
			output.screenshot = saveScreenshot(result.image, args.dir as string);
		}

		output.elements = result.elements;
		output.count = result.count;

		if (result.tree !== undefined) {
			output.tree = result.tree;
			output.nodeCount = result.nodeCount;
		}

		jsonOk(output);
	},
});
