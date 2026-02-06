import { clickElement } from "../injected/click";
import { getInteractiveElements } from "../injected/elements";
import { fillInput } from "../injected/fill";
import { sendKey } from "../injected/key";
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
): Promise<Record<string, unknown>> {
	const results = (await chrome.scripting.executeScript({
		target: { tabId },
		func: func as () => void,
		args,
	} as chrome.scripting.ScriptInjection)) as unknown as ScriptResult[];

	const result = results[0]?.result;
	if (result?.error) {
		throw new Error(result.error as string);
	}
	return result || {};
}

export async function handleClick(
	payload: CommandPayload,
): Promise<Record<string, unknown>> {
	const { text, selector, index } = payload;
	const tab = await getActiveTab();
	return await inject(tab.id!, clickElement, [{ text, selector, index }]);
}

export async function handleType(
	payload: CommandPayload,
): Promise<Record<string, unknown>> {
	const { text } = payload;
	if (!text) {
		throw new Error("Text is required");
	}
	const tab = await getActiveTab();
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
	return await inject(tab.id!, sendKey, [key]);
}

export async function handleFill(
	payload: CommandPayload,
): Promise<Record<string, unknown>> {
	const { label, value } = payload;
	if (!label || value === undefined) {
		throw new Error("Label and value are required");
	}
	const tab = await getActiveTab();
	return await inject(tab.id!, fillInput, [label, value]);
}

export async function handleWaitFor(
	payload: CommandPayload,
): Promise<Record<string, unknown>> {
	const { text, selector, timeout = 10000 } = payload;
	const tab = await getActiveTab();
	return await inject(tab.id!, waitForElement, [{ text, selector, timeout }]);
}

export async function handleElements(
	_payload: CommandPayload,
): Promise<Record<string, unknown>> {
	const tab = await getActiveTab();
	return await inject(tab.id!, getInteractiveElements);
}
