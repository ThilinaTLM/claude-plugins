import type { CommandPayload } from "../types";
import {
	handleGroupAdd,
	handleGroupClose,
	handleGroupRemove,
	handleGroupSwitch,
	handleGroupTabs,
	handleHistory,
} from "./groups";
import {
	handleCheck,
	handleClear,
	handleClick,
	handleDblclick,
	handleDialog,
	handleElements,
	handleEvaluate,
	handleFill,
	handleFocus,
	handleHover,
	handleKey,
	handleSelect,
	handleSnapshot,
	handleType,
	handleWaitFor,
} from "./interaction";
import {
	handleBack,
	handleConsole,
	handleErrors,
	handleForward,
	handleGoto,
	handleInfo,
	handleReload,
	handleScreenshot,
	handleScroll,
	handleScrollIntoView,
	handleStatus,
	handleWaitForLoad,
	handleWaitForUrl,
} from "./navigation";
import { handleQuery } from "./queries";

export async function executeCommand(
	action: string,
	payload: CommandPayload = {},
): Promise<Record<string, unknown>> {
	switch (action) {
		case "screenshot":
			return await handleScreenshot(payload);
		case "goto":
			return await handleGoto(payload);
		case "info":
			return await handleInfo(payload);
		case "back":
			return await handleBack(payload);
		case "forward":
			return await handleForward(payload);
		case "reload":
			return await handleReload(payload);
		case "scroll":
			return await handleScroll(payload);
		case "scrollintoview":
			return await handleScrollIntoView(payload);
		case "waitforurl":
			return await handleWaitForUrl(payload);
		case "waitforload":
			return await handleWaitForLoad(payload);
		case "console":
			return await handleConsole(payload);
		case "errors":
			return await handleErrors(payload);
		case "status":
			return await handleStatus(payload);
		case "click":
			return await handleClick(payload);
		case "type":
			return await handleType(payload);
		case "key":
			return await handleKey(payload);
		case "fill":
			return await handleFill(payload);
		case "wait-for":
			return await handleWaitFor(payload);
		case "elements":
			return await handleElements(payload);
		case "clear":
			return await handleClear(payload);
		case "focus":
			return await handleFocus(payload);
		case "select":
			return await handleSelect(payload);
		case "check":
			return await handleCheck({ ...payload, checked: true });
		case "uncheck":
			return await handleCheck({ ...payload, checked: false });
		case "hover":
			return await handleHover(payload);
		case "dblclick":
			return await handleDblclick(payload);
		case "snapshot":
			return await handleSnapshot(payload);
		case "evaluate":
			return await handleEvaluate(payload);
		case "dialog":
			return await handleDialog(payload);
		case "query":
			return await handleQuery(payload);
		case "group-tabs":
			return await handleGroupTabs(payload);
		case "group-switch":
			return await handleGroupSwitch(payload);
		case "group-add":
			return await handleGroupAdd(payload);
		case "group-remove":
			return await handleGroupRemove(payload);
		case "group-close":
			return await handleGroupClose(payload);
		case "history":
			return await handleHistory(payload);
		default:
			throw new Error(`Unknown action: ${action}`);
	}
}
