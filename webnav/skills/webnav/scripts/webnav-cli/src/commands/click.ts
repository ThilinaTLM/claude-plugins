import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonError, jsonOk } from "../lib/output";
import { saveScreenshot } from "../lib/screenshot";

export const clickCommand = defineCommand({
	meta: {
		name: "click",
		description: "Click an element by text or selector",
	},
	args: {
		text: {
			type: "string",
			alias: "t",
			description: "Text content to find and click",
		},
		selector: {
			type: "string",
			alias: "s",
			description: "CSS selector to find and click",
		},
		index: {
			type: "string",
			alias: "i",
			description: "Index if multiple matches (default: 0)",
		},
		ref: {
			type: "string",
			alias: "r",
			description: "Element ref from snapshot (e.g. @e5)",
		},
		exact: {
			type: "boolean",
			alias: "x",
			description: "Exact text match instead of substring",
		},
		"wait-url": {
			type: "string",
			description: "After click, wait for URL to match glob pattern",
		},
		"wait-text": {
			type: "string",
			description: "After click, wait for text to appear",
		},
		"wait-selector": {
			type: "string",
			description: "After click, wait for element matching selector",
		},
		"wait-timeout": {
			type: "string",
			description: "Timeout for wait conditions in ms (default: 10000)",
		},
		screenshot: {
			type: "boolean",
			description: "Capture screenshot after click",
			default: false,
		},
		dir: {
			type: "string",
			alias: "d",
			description: "Screenshot output directory (default: system temp)",
		},
	},
	async run({ args }) {
		const text = args.text as string | undefined;
		const selector = args.selector as string | undefined;
		const ref = args.ref as string | undefined;
		const index = args.index ? Number.parseInt(args.index as string, 10) : 0;
		const exact = args.exact as boolean | undefined;
		const waitUrl = args["wait-url"] as string | undefined;
		const waitText = args["wait-text"] as string | undefined;
		const waitSelector = args["wait-selector"] as string | undefined;
		const waitTimeout = args["wait-timeout"]
			? Number.parseInt(args["wait-timeout"] as string, 10)
			: undefined;

		if (!text && !selector && !ref) {
			jsonError(
				"Either --text, --selector, or --ref is required",
				"INVALID_ARGS",
				"Use -t for text, -s for CSS selector, or -r for snapshot ref",
			);
		}

		const hasWait = !!(waitUrl || waitText || waitSelector);
		const effectiveWaitTimeout = waitTimeout ?? 10000;
		const socketTimeout = hasWait ? effectiveWaitTimeout + 5000 : undefined;

		const result = await sendCommand<{
			clicked: boolean;
			tag: string;
			text: string;
			image?: string;
			waited?: Record<string, unknown>;
		}>(
			"click",
			{
				text,
				selector,
				index,
				ref,
				exact,
				waitUrl,
				waitText,
				waitSelector,
				waitTimeout: hasWait ? effectiveWaitTimeout : undefined,
				screenshot: args.screenshot || undefined,
			},
			socketTimeout ? { timeout: socketTimeout } : {},
		);

		const output: Record<string, unknown> = {
			action: "click",
			clicked: result.clicked,
			tag: result.tag,
			text: result.text,
		};

		if (result.waited) {
			output.waited = result.waited;
		}

		if (result.image) {
			output.screenshot = saveScreenshot(result.image, args.dir as string);
		}

		jsonOk(output);
	},
});
