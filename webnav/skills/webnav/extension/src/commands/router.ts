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
	handleClick,
	handleElements,
	handleFill,
	handleKey,
	handleType,
	handleWaitFor,
} from "./interaction";
import {
	handleGoto,
	handleInfo,
	handleScreenshot,
	handleStatus,
} from "./navigation";

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
