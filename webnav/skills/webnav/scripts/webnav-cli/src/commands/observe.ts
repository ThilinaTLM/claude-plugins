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
			"Get page state: screenshot + accessibility tree snapshot (compact)",
	},
	args: {
		"no-screenshot": {
			type: "boolean",
			description: "Skip screenshot capture",
			default: false,
		},
		full: {
			type: "boolean",
			alias: "f",
			description: "Full JSON tree instead of compact text format",
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
			tree: unknown;
			nodeCount: number;
			compact?: boolean;
		}>("observe", {
			noScreenshot: args["no-screenshot"] || undefined,
			compact: args.full ? false : undefined,
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

		output.nodeCount = result.nodeCount;
		if (result.nodeCount > FILE_THRESHOLD) {
			output.snapshotFile = saveJson(result.tree, "snapshot", dir);
			output.hint =
				"Use `webnav util json-search <file> [pattern]` to search the snapshot file";
		} else {
			output.tree = result.tree;
		}

		jsonOk(output);
	},
});
