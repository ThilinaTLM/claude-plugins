import { checkElement } from "../injected/check";
import { clearElement } from "../injected/clear";
import { clickElement } from "../injected/click";
import { dblclickElement } from "../injected/dblclick";
import { setupDialog } from "../injected/dialog";
import { getInteractiveElements } from "../injected/elements";
import { evaluateExpression } from "../injected/evaluate";
import { fillInput } from "../injected/fill";
import { focusElement } from "../injected/focus";
import { hoverElement } from "../injected/hover";
import { sendKey } from "../injected/key";
import { resolveRef } from "../injected/resolve-ref";
import { selectOption } from "../injected/select-option";
import { takeSnapshot } from "../injected/snapshot";
import { typeText } from "../injected/type";
import { waitForElement } from "../injected/wait-for";
import { getActiveTab } from "../tabs";
import type { CommandPayload } from "../types";

// chrome.scripting.executeScript types are overly strict for func+args usage.
// We cast to satisfy the type checker while preserving runtime correctness.
type ScriptResult = { result: Record<string, unknown> };

async function inject(
	tabId: number,
	func: (...args: never[]) => unknown,
	args: unknown[] = [],
	world?: "MAIN" | "ISOLATED",
): Promise<Record<string, unknown>> {
	const results = (await chrome.scripting.executeScript({
		target: { tabId },
		func: func as () => void,
		args,
		...(world && { world }),
	} as chrome.scripting.ScriptInjection)) as unknown as ScriptResult[];

	const result = results[0]?.result;
	if (result?.error) {
		throw new Error(result.error as string);
	}
	return result || {};
}

async function resolveRefToSelector(
	tabId: number,
	ref: string,
): Promise<string> {
	const result = await inject(tabId, resolveRef, [{ ref }]);
	return result.selector as string;
}

export async function handleClick(
	payload: CommandPayload,
): Promise<Record<string, unknown>> {
	let { text, selector, index, exact } = payload;
	const tab = await getActiveTab();
	if (payload.ref) {
		selector = await resolveRefToSelector(tab.id!, payload.ref);
		text = undefined;
	}
	return await inject(tab.id!, clickElement, [
		{ text, selector, index, exact },
	]);
}

export async function handleType(
	payload: CommandPayload,
): Promise<Record<string, unknown>> {
	const { text } = payload;
	if (!text) {
		throw new Error("Text is required");
	}
	const tab = await getActiveTab();
	if (payload.ref) {
		const sel = await resolveRefToSelector(tab.id!, payload.ref);
		await inject(tab.id!, focusElement, [{ selector: sel }]);
	}
	return await inject(tab.id!, typeText, [text]);
}

export async function handleKey(
	payload: CommandPayload,
): Promise<Record<string, unknown>> {
	const { key } = payload;
	if (!key) {
		throw new Error("Key is required");
	}
	const tab = await getActiveTab();
	if (payload.ref) {
		const sel = await resolveRefToSelector(tab.id!, payload.ref);
		await inject(tab.id!, focusElement, [{ selector: sel }]);
	}
	return await inject(tab.id!, sendKey, [key]);
}

export async function handleFill(
	payload: CommandPayload,
): Promise<Record<string, unknown>> {
	const tab = await getActiveTab();
	if (payload.ref) {
		const sel = await resolveRefToSelector(tab.id!, payload.ref);
		if (payload.value === undefined) {
			throw new Error("Value is required");
		}
		await inject(tab.id!, focusElement, [{ selector: sel }]);
		return await inject(tab.id!, typeText, [payload.value]);
	}
	const { label, value } = payload;
	if (!label || value === undefined) {
		throw new Error("Label and value are required");
	}
	return await inject(tab.id!, fillInput, [label, value]);
}

export async function handleWaitFor(
	payload: CommandPayload,
): Promise<Record<string, unknown>> {
	let { text, selector } = payload;
	const { timeout = 10000 } = payload;
	const tab = await getActiveTab();
	if (payload.ref) {
		selector = await resolveRefToSelector(tab.id!, payload.ref);
		text = undefined;
	}
	return await inject(tab.id!, waitForElement, [{ text, selector, timeout }]);
}

export async function handleElements(
	_payload: CommandPayload,
): Promise<Record<string, unknown>> {
	const tab = await getActiveTab();
	return await inject(tab.id!, getInteractiveElements);
}

export async function handleClear(
	payload: CommandPayload,
): Promise<Record<string, unknown>> {
	const { text, selector } = payload;
	const tab = await getActiveTab();
	return await inject(tab.id!, clearElement, [{ text, selector }]);
}

export async function handleFocus(
	payload: CommandPayload,
): Promise<Record<string, unknown>> {
	const { text, selector } = payload;
	const tab = await getActiveTab();
	return await inject(tab.id!, focusElement, [{ text, selector }]);
}

export async function handleSelect(
	payload: CommandPayload,
): Promise<Record<string, unknown>> {
	const { selector, text, optionValue, optionText } = payload;
	const tab = await getActiveTab();
	return await inject(tab.id!, selectOption, [
		{ selector, text, optionValue, optionText },
	]);
}

export async function handleCheck(
	payload: CommandPayload,
): Promise<Record<string, unknown>> {
	const { text, selector, checked = true } = payload;
	const tab = await getActiveTab();
	return await inject(tab.id!, checkElement, [{ text, selector, checked }]);
}

export async function handleHover(
	payload: CommandPayload,
): Promise<Record<string, unknown>> {
	const { text, selector } = payload;
	const tab = await getActiveTab();
	return await inject(tab.id!, hoverElement, [{ text, selector }]);
}

export async function handleDblclick(
	payload: CommandPayload,
): Promise<Record<string, unknown>> {
	const { text, selector, index, exact } = payload;
	const tab = await getActiveTab();
	return await inject(tab.id!, dblclickElement, [
		{ text, selector, index, exact },
	]);
}

export async function handleSnapshot(
	payload: CommandPayload,
): Promise<Record<string, unknown>> {
	const { interactive, selector, maxDepth, compact } = payload;
	const tab = await getActiveTab();
	return await inject(tab.id!, takeSnapshot, [
		{ interactive, selector, maxDepth, compact },
	]);
}

export async function handleEvaluate(
	payload: CommandPayload,
): Promise<Record<string, unknown>> {
	const { expression } = payload;
	if (!expression) {
		throw new Error("Expression is required");
	}
	const tab = await getActiveTab();
	return await inject(tab.id!, evaluateExpression, [{ expression }], "MAIN");
}

export async function handleDialog(
	payload: CommandPayload,
): Promise<Record<string, unknown>> {
	const { dialogAction, text } = payload;
	if (!dialogAction) {
		throw new Error("Dialog action (accept or dismiss) is required");
	}
	const tab = await getActiveTab();
	return await inject(tab.id!, setupDialog, [{ action: dialogAction, text }]);
}
