import { defineCommand } from "citty";
import { searchJsonFile } from "../../lib/json-search";
import { jsonError, jsonOk } from "../../lib/output";

export const jsonSearchCommand = defineCommand({
	meta: {
		name: "json-search",
		description:
			"Search a JSON file produced by elements/snapshot/console/errors/observe",
	},
	args: {
		file: {
			type: "positional",
			description: "Path to JSON file",
			required: true,
		},
		pattern: {
			type: "positional",
			description: "Text to search for (case-insensitive substring)",
			required: false,
		},
		tag: {
			type: "string",
			alias: "t",
			description: "Filter by HTML tag",
		},
		role: {
			type: "string",
			alias: "r",
			description: "Filter by ARIA role",
		},
		ref: {
			type: "string",
			description: "Find specific ref (e.g. @e42)",
		},
		limit: {
			type: "string",
			alias: "n",
			description: "Max results (default: 50)",
		},
		offset: {
			type: "string",
			description: "Skip first N results",
		},
	},
	async run({ args }) {
		const filepath = args.file as string;
		const pattern = (args.pattern as string) || undefined;
		const tag = (args.tag as string) || undefined;
		const role = (args.role as string) || undefined;
		const ref = (args.ref as string) || undefined;
		const limit = args.limit ? Number.parseInt(args.limit as string, 10) : 50;
		const offset = args.offset ? Number.parseInt(args.offset as string, 10) : 0;

		try {
			const result = searchJsonFile(filepath, {
				pattern,
				tag,
				role,
				ref,
				limit,
				offset,
			});
			jsonOk(result);
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to search file";
			jsonError(message, "INVALID_ARGS");
		}
	},
});
