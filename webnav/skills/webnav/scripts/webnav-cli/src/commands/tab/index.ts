import { defineCommand } from "citty";
import { tabCloseCommand } from "./close";
import { tabListCommand } from "./list";
import { tabNewCommand } from "./new";
import { tabSwitchCommand } from "./switch";

export const tabCommand = defineCommand({
	meta: {
		name: "tab",
		description: "Manage tabs",
	},
	subCommands: {
		new: tabNewCommand,
		list: tabListCommand,
		switch: tabSwitchCommand,
		close: tabCloseCommand,
	},
});
