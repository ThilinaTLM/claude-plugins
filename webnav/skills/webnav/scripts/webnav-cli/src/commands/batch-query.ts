import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonError, jsonOk } from "../lib/output";

interface QueryItem {
	type: string;
	selector?: string;
	text?: string;
	name?: string;
}

/**
 * Parse a positional query string into a QueryItem.
 * Format: 'type -s "selector"' or 'type -t "text"' or 'type -n "name"'
 */
function parseQueryString(input: string): QueryItem {
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
		return { type: "gettext" };
	}

	const item: QueryItem = { type: parts[0] };
	for (let i = 1; i < parts.length; i++) {
		const flag = parts[i];
		const value = parts[i + 1];
		if (flag === "-s" && value) {
			item.selector = value;
			i++;
		} else if (flag === "-t" && value) {
			item.text = value;
			i++;
		} else if (flag === "-n" && value) {
			item.name = value;
			i++;
		}
	}

	return item;
}

export const batchQueryCommand = defineCommand({
	meta: {
		name: "query",
		description: "Run multiple queries in a single round trip",
	},
	args: {
		json: {
			type: "string",
			description:
				'JSON array of queries, e.g. \'[{"type":"gettext","selector":"h1"}]\'',
		},
		_: {
			type: "positional",
			description:
				"Positional query strings, e.g. 'gettext -s \"h1\"' 'isvisible -s \"#btn\"'",
			required: false,
		},
	},
	async run({ args }) {
		let queries: QueryItem[];

		if (args.json) {
			try {
				queries = JSON.parse(args.json as string);
			} catch {
				jsonError("Invalid JSON for --json flag", "INVALID_ARGS");
				return;
			}
			if (!Array.isArray(queries) || queries.length === 0) {
				jsonError("--json must be a non-empty array", "INVALID_ARGS");
				return;
			}
		} else {
			// Parse positional args
			const positionals = args._ as string[];
			if (!positionals || positionals.length === 0) {
				jsonError(
					"Provide queries via --json or as positional arguments",
					"INVALID_ARGS",
				);
				return;
			}
			queries = positionals.map(parseQueryString);
		}

		const result = await sendCommand<{
			results: Array<Record<string, unknown>>;
			completed: number;
			total: number;
		}>("batch-query", { queries });

		jsonOk({
			action: "query",
			...result,
		});
	},
});
