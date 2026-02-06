import { defineCommand } from "citty";
import { jsonSearchCommand } from "./json-search";

export const utilCommand = defineCommand({
	meta: {
		name: "util",
		description: "Local file utilities (no browser required)",
	},
	subCommands: {
		"json-search": jsonSearchCommand,
	},
});
