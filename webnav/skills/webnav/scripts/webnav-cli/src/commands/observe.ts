import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonOk } from "../lib/output";
import { saveJson } from "../lib/save-json";
import { saveScreenshot } from "../lib/screenshot";

const FILE_THRESHOLD = 50;

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
			description:
				"Output directory for screenshots and large results (default: system temp)",
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

		const dir = args.dir as string;
		const output: Record<string, unknown> = {
			action: "observe",
			url: result.url,
			title: result.title,
		};

		if (result.image) {
			output.screenshot = saveScreenshot(result.image, dir);
		}

		output.count = result.count;
		if (result.count > FILE_THRESHOLD) {
			output.elementsFile = saveJson(result.elements, "elements", dir);
		} else {
			output.elements = result.elements;
		}

		if (result.tree !== undefined) {
			output.nodeCount = result.nodeCount;
			if ((result.nodeCount ?? 0) > FILE_THRESHOLD) {
				output.snapshotFile = saveJson(result.tree, "snapshot", dir);
			} else {
				output.tree = result.tree;
			}
		}

		jsonOk(output);
	},
});
