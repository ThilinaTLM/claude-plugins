import { queryElement } from "../injected/query";
import { getActiveTab } from "../tabs";
import type { CommandPayload } from "../types";

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

export async function handleQuery(
	payload: CommandPayload,
): Promise<Record<string, unknown>> {
	const { type, selector, text, name } = payload;
	if (!type) {
		throw new Error("Query type is required");
	}
	const tab = await getActiveTab();
	return await inject(tab.id!, queryElement, [{ type, selector, text, name }]);
}
