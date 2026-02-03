import { defineCommand } from "citty";
import { groupAddCommand } from "./add";
import { groupCloseCommand } from "./close";
import { groupRemoveCommand } from "./remove";
import { groupSwitchCommand } from "./switch";
import { groupTabsCommand } from "./tabs";

export const groupCommand = defineCommand({
	meta: {
		name: "group",
		description: "Manage the webnav tab group",
	},
	subCommands: {
		tabs: groupTabsCommand,
		switch: groupSwitchCommand,
		add: groupAddCommand,
		remove: groupRemoveCommand,
		close: groupCloseCommand,
	},
});
