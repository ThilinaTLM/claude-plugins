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

export async function handleBatchQuery(
	payload: CommandPayload,
): Promise<Record<string, unknown>> {
	const { queries } = payload;
	if (!queries || !Array.isArray(queries) || queries.length === 0) {
		throw new Error("Queries array is required");
	}
	const tab = await getActiveTab();
	const results: Array<Record<string, unknown>> = [];
	for (const q of queries) {
		try {
			const result = await inject(tab.id!, queryElement, [q]);
			results.push({ type: q.type, ok: true, ...result });
		} catch (err) {
			results.push({
				type: q.type,
				ok: false,
				error: err instanceof Error ? err.message : String(err),
			});
		}
	}
	return { results, completed: results.length, total: queries.length };
}
