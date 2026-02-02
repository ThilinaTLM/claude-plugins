#!/usr/bin/env bun
import { defineCommand, runMain } from "citty";
import pkg from "../package.json";
import { clickCommand } from "./commands/click";
import { elementsCommand } from "./commands/elements";
import { fillCommand } from "./commands/fill";
import { gotoCommand } from "./commands/goto";
import { infoCommand } from "./commands/info";
import { keyCommand } from "./commands/key";
import { screenshotCommand } from "./commands/screenshot";
import { setupCommand } from "./commands/setup";
import { statusCommand } from "./commands/status";
import { tabsCommand } from "./commands/tabs";
import { typeCommand } from "./commands/type";
import { waitForCommand } from "./commands/wait-for";

const main = defineCommand({
	meta: {
		name: "webnav",
		version: pkg.version,
		description: "Browser automation via Chrome extension",
	},
	subCommands: {
		// Setup
		setup: setupCommand,

		// Status and info
		status: statusCommand,
		info: infoCommand,
		tabs: tabsCommand,

		// Navigation
		goto: gotoCommand,
		navigate: gotoCommand,
		nav: gotoCommand,

		// Screenshot
		screenshot: screenshotCommand,
		ss: screenshotCommand,
		screen: screenshotCommand,

		// Interaction
		click: clickCommand,
		tap: clickCommand,
		type: typeCommand,
		input: typeCommand,
		key: keyCommand,
		fill: fillCommand,

		// Wait
		"wait-for": waitForCommand,
		waitfor: waitForCommand,
		await: waitForCommand,

		// Elements
		elements: elementsCommand,
		els: elementsCommand,
	},
});

runMain(main);
