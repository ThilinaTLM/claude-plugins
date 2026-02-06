#!/usr/bin/env bun
import { defineCommand, runMain } from "citty";
import pkg from "../package.json";
import { backCommand } from "./commands/back";
import { boundingboxCommand } from "./commands/boundingbox";
import { checkCommand } from "./commands/check";
import { clearCommand } from "./commands/clear";
import { clickCommand } from "./commands/click";
import { consoleCommand } from "./commands/console";
import { daemonCommand } from "./commands/daemon";
import { dblclickCommand } from "./commands/dblclick";
import { dialogCommand } from "./commands/dialog";
import { elementsCommand } from "./commands/elements";
import { errorsCommand } from "./commands/errors";
import { evaluateCommand } from "./commands/evaluate";
import { fillCommand } from "./commands/fill";
import { focusCommand } from "./commands/focus";
import { forwardCommand } from "./commands/forward";
import { getattributeCommand } from "./commands/getattribute";
import { gettextCommand } from "./commands/gettext";
import { gotoCommand } from "./commands/goto";
import { groupCommand } from "./commands/group";
import { historyCommand } from "./commands/history";
import { hoverCommand } from "./commands/hover";
import { infoCommand } from "./commands/info";
import { inputvalueCommand } from "./commands/inputvalue";
import { ischeckedCommand } from "./commands/ischecked";
import { isenabledCommand } from "./commands/isenabled";
import { isvisibleCommand } from "./commands/isvisible";
import { keyCommand } from "./commands/key";
import { reloadCommand } from "./commands/reload";
import { screenshotCommand } from "./commands/screenshot";
import { scrollCommand } from "./commands/scroll";
import { scrollIntoViewCommand } from "./commands/scrollintoview";
import { selectCommand } from "./commands/select";
import { setupCommand } from "./commands/setup";
import { snapshotCommand } from "./commands/snapshot";
import { statusCommand } from "./commands/status";
import { typeCommand } from "./commands/type";
import { uncheckCommand } from "./commands/uncheck";
import { waitForCommand } from "./commands/wait-for";
import { waitforloadCommand } from "./commands/waitforload";
import { waitforurlCommand } from "./commands/waitforurl";

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
		back: backCommand,
		forward: forwardCommand,
		reload: reloadCommand,

		// Scroll
		scroll: scrollCommand,
		scrollintoview: scrollIntoViewCommand,

		// Screenshot
		screenshot: screenshotCommand,

		// Interaction
		click: clickCommand,
		dblclick: dblclickCommand,
		type: typeCommand,
		key: keyCommand,
		fill: fillCommand,
		clear: clearCommand,
		focus: focusCommand,
		hover: hoverCommand,
		select: selectCommand,
		check: checkCommand,
		uncheck: uncheckCommand,

		// Wait
		"wait-for": waitForCommand,
		waitforload: waitforloadCommand,
		waitforurl: waitforurlCommand,

		// Elements & Accessibility
		elements: elementsCommand,
		snapshot: snapshotCommand,

		// Queries
		gettext: gettextCommand,
		inputvalue: inputvalueCommand,
		getattribute: getattributeCommand,
		isvisible: isvisibleCommand,
		isenabled: isenabledCommand,
		ischecked: ischeckedCommand,
		boundingbox: boundingboxCommand,

		// Advanced
		evaluate: evaluateCommand,
		dialog: dialogCommand,
		console: consoleCommand,
		errors: errorsCommand,
	},
});

runMain(main);
