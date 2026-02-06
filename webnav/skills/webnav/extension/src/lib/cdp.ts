const attached = new Set<number>();

export async function attachDebugger(tabId: number): Promise<void> {
	if (attached.has(tabId)) return;
	await chrome.debugger.attach({ tabId }, "1.3");
	attached.add(tabId);
}

export async function detachDebugger(tabId: number): Promise<void> {
	if (!attached.has(tabId)) return;
	await chrome.debugger.detach({ tabId });
	attached.delete(tabId);
}

export async function sendCdpCommand<T = unknown>(
	tabId: number,
	method: string,
	params?: Record<string, unknown>,
): Promise<T> {
	return (await chrome.debugger.sendCommand({ tabId }, method, params)) as T;
}
