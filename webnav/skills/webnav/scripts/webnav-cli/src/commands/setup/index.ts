import { defineCommand } from "citty";
import { installCommand } from "./install";
import { uninstallCommand } from "./uninstall";

export const setupCommand = defineCommand({
	meta: {
		name: "setup",
		description: "Manage native messaging host setup",
	},
	subCommands: {
		install: installCommand,
		uninstall: uninstallCommand,
	},
});
