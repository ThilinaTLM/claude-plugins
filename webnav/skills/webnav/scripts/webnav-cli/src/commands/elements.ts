import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonOk } from "../lib/output";
import type { ElementInfo } from "../types";

export const elementsCommand = defineCommand({
	meta: {
		name: "elements",
		description: "List interactive elements on the page",
	},
	async run() {
		const result = await sendCommand<{ elements: ElementInfo[] }>("elements");

		jsonOk({
			action: "elements",
			count: result.elements.length,
			elements: result.elements,
		});
	},
});
