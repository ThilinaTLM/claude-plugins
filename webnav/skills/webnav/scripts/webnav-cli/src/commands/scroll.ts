import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonOk } from "../lib/output";

export const scrollCommand = defineCommand({
	meta: {
		name: "scroll",
		description: "Scroll the page or an element",
	},
	args: {
		direction: {
			type: "string",
			alias: "d",
			description: "Direction to scroll: up, down, left, right",
		},
		x: {
			type: "string",
			description: "Absolute horizontal scroll position",
		},
		y: {
			type: "string",
			description: "Absolute vertical scroll position",
		},
		amount: {
			type: "string",
			alias: "a",
			description: "Scroll amount in pixels (default: viewport size)",
		},
		selector: {
			type: "string",
			alias: "s",
			description: "CSS selector of element to scroll",
		},
	},
	async run({ args }) {
		const payload: Record<string, unknown> = {};
		if (args.direction) payload.direction = args.direction;
		if (args.x) payload.x = Number.parseInt(args.x as string, 10);
		if (args.y) payload.y = Number.parseInt(args.y as string, 10);
		if (args.amount)
			payload.amount = Number.parseInt(args.amount as string, 10);
		if (args.selector) payload.selector = args.selector;

		const result = await sendCommand<{
			scrollX: number;
			scrollY: number;
		}>("scroll", payload);

		jsonOk({
			action: "scroll",
			...result,
		});
	},
});
