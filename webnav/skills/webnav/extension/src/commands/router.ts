import type { CommandPayload } from "../types";
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
	handleNetwork,
	handleObserve,
	handleReload,
	handleScreenshot,
	handleScroll,
	handleScrollIntoView,
	handleStatus,
	handleWaitForLoad,
	handleWaitForUrl,
} from "./navigation";
import { handleBatchQuery, handleQuery } from "./queries";
import {
	handleHistory,
	handleTabClose,
	handleTabList,
	handleTabNew,
	handleTabSwitch,
} from "./tab-commands";

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
		case "network":
			return await handleNetwork(payload);
		case "status":
			return await handleStatus(payload);
		case "observe":
			return await handleObserve(payload);
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
		case "batch-query":
			return await handleBatchQuery(payload);
		case "batch-act": {
			const { actions } = payload;
			if (!actions || !Array.isArray(actions) || actions.length === 0) {
				throw new Error("Actions array is required");
			}
			const results: Array<Record<string, unknown>> = [];
			for (const item of actions) {
				const { action: subAction, ...subPayload } = item as {
					action: string;
					[key: string]: unknown;
				};
				if (subAction === "batch-act" || subAction === "batch-query") {
					results.push({
						action: subAction,
						ok: false,
						error: "Nested batches not allowed",
					});
					break;
				}
				try {
					const result = await executeCommand(
						subAction,
						subPayload as CommandPayload,
					);
					results.push({ action: subAction, ok: true, ...result });
				} catch (err) {
					results.push({
						action: subAction,
						ok: false,
						error: err instanceof Error ? err.message : String(err),
					});
					break;
				}
			}
			return {
				results,
				completed: results.length,
				total: actions.length,
			};
		}
		case "tab-list":
			return await handleTabList(payload);
		case "tab-switch":
			return await handleTabSwitch(payload);
		case "tab-new":
			return await handleTabNew(payload);
		case "tab-close":
			return await handleTabClose(payload);
		case "history":
			return await handleHistory(payload);
		default:
			throw new Error(`Unknown action: ${action}`);
	}
}
