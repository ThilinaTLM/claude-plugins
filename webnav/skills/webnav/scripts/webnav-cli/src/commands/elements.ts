import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonOk } from "../lib/output";
import { saveJson } from "../lib/save-json";
import type { ElementInfo } from "../types";

const FILE_THRESHOLD = 50;

export const elementsCommand = defineCommand({
	meta: {
		name: "elements",
		description: "List interactive elements on the page",
	},
	args: {
		dir: {
			type: "string",
			alias: "d",
			description: "Output directory for large results (default: system temp)",
		},
	},
	async run({ args }) {
		const result = await sendCommand<{ elements: ElementInfo[] }>("elements");

		const count = result.elements.length;
		const output: Record<string, unknown> = {
			action: "elements",
			count,
		};

		if (count > FILE_THRESHOLD) {
			output.file = saveJson(result.elements, "elements", args.dir as string);
			output.hint =
				"Use `webnav util json-search <file> [pattern]` to search this file";
		} else {
			output.elements = result.elements;
		}

		jsonOk(output);
	},
});
