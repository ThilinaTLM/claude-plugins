#!/usr/bin/env bun
import { defineCommand, runMain } from "citty";
import pkg from "../package.json";
import { clickCommand } from "./commands/click";
import { daemonCommand } from "./commands/daemon";
import { elementsCommand } from "./commands/elements";
import { fillCommand } from "./commands/fill";
import { gotoCommand } from "./commands/goto";
import { groupCommand } from "./commands/group";
import { historyCommand } from "./commands/history";
import { infoCommand } from "./commands/info";
import { keyCommand } from "./commands/key";
import { screenshotCommand } from "./commands/screenshot";
import { setupCommand } from "./commands/setup";
import { statusCommand } from "./commands/status";
import { typeCommand } from "./commands/type";
import { waitForCommand } from "./commands/wait-for";

const main = defineCommand({
	meta: {
		name: "webnav",
		version: pkg.version,
		description: "Browser automation via Chromium-based browser extension",
	},
	subCommands: {
		// Setup and daemon
		setup: setupCommand,
		daemon: daemonCommand,

		// Status and info
		status: statusCommand,
		info: infoCommand,
		history: historyCommand,

		// Tab group management
		group: groupCommand,

		// Navigation
		goto: gotoCommand,

		// Screenshot
		screenshot: screenshotCommand,

		// Interaction
		click: clickCommand,
		type: typeCommand,
		key: keyCommand,
		fill: fillCommand,

		// Wait
		"wait-for": waitForCommand,

		// Elements
		elements: elementsCommand,
	},
});

runMain(main);
