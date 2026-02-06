import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonError, jsonOk } from "../lib/output";
import { saveScreenshot } from "../lib/screenshot";

interface ActionItem {
	action: string;
	[key: string]: unknown;
}

// Parse a positional action string into an ActionItem.
// Format: 'action arg1 arg2 -flag value'
function parseActionString(input: string): ActionItem {
	const parts: string[] = [];
	let current = "";
	let inQuote = false;
	let quoteChar = "";

	for (const char of input) {
		if (!inQuote && (char === '"' || char === "'")) {
			inQuote = true;
			quoteChar = char;
		} else if (inQuote && char === quoteChar) {
			inQuote = false;
		} else if (!inQuote && char === " ") {
			if (current) parts.push(current);
			current = "";
		} else {
			current += char;
		}
	}
	if (current) parts.push(current);

	if (parts.length === 0) {
		return { action: "info" };
	}

	const actionName = parts[0];
	const item: ActionItem = { action: actionName };

	const FLAG_MAP: Record<string, string> = {
		"-t": "text",
		"-s": "selector",
		"-r": "ref",
		"-i": "index",
		"-x": "exact",
		"-p": "pattern",
		"-v": "optionValue",
		"-o": "optionText",
		"-n": "name",
		"-k": "key",
	};

	const positionals: string[] = [];
	for (let i = 1; i < parts.length; i++) {
		const part = parts[i];
		if (part.startsWith("-") && FLAG_MAP[part] && parts[i + 1]) {
			const val = parts[i + 1];
			item[FLAG_MAP[part]] = val === "true" ? true : val;
			i++;
		} else if (!part.startsWith("-")) {
			positionals.push(part);
		}
	}

	if (actionName === "goto" && positionals[0]) {
		item.url = positionals[0];
	} else if (actionName === "fill" && positionals.length >= 2) {
		item.label = positionals[0];
		item.value = positionals[1];
	} else if (actionName === "type" && positionals[0]) {
		item.text = positionals[0];
	} else if (actionName === "key" && positionals[0]) {
		item.key = positionals[0];
	} else if (
		(actionName === "waitforurl" || actionName === "waitforload") &&
		positionals[0]
	) {
		item.pattern = positionals[0];
	}

	return item;
}

export const actCommand = defineCommand({
	meta: {
		name: "act",
		description: "Run multiple actions sequentially in a single round trip",
	},
	args: {
		json: {
			type: "string",
			description:
				'JSON array of actions, e.g. \'[{"action":"goto","url":"https://example.com"}]\'',
		},
		timeout: {
			type: "string",
			description: "Socket timeout in ms (default: 60000)",
		},
		dir: {
			type: "string",
			alias: "d",
			description: "Screenshot output directory (default: system temp)",
		},
		_: {
			type: "positional",
			description:
				"Positional action strings, e.g. 'goto \"https://example.com\"' 'screenshot'",
			required: false,
		},
	},
	async run({ args }) {
		let actions: ActionItem[];

		if (args.json) {
			try {
				actions = JSON.parse(args.json as string);
			} catch {
				jsonError("Invalid JSON for --json flag", "INVALID_ARGS");
				return;
			}
			if (!Array.isArray(actions) || actions.length === 0) {
				jsonError("--json must be a non-empty array", "INVALID_ARGS");
				return;
			}
		} else {
			const positionals = args._ as string[];
			if (!positionals || positionals.length === 0) {
				jsonError(
					"Provide actions via --json or as positional arguments",
					"INVALID_ARGS",
				);
				return;
			}
			actions = positionals.map(parseActionString);
		}

		const timeout = args.timeout
			? Number.parseInt(args.timeout as string, 10)
			: 60000;

		const result = await sendCommand<{
			results: Array<Record<string, unknown>>;
			completed: number;
			total: number;
		}>("batch-act", { actions }, { timeout });

		// Save any screenshots in results
		const dir = args.dir as string | undefined;
		for (const r of result.results) {
			if (r.image && typeof r.image === "string") {
				r.screenshot = saveScreenshot(r.image, dir);
				r.image = undefined;
			}
		}

		jsonOk({
			action: "act",
			...result,
		});
	},
});
