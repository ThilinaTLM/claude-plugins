import type { HistoryEntry } from "./types";

// Constants
export const NATIVE_HOST_NAME = "com.tlmtech.webnav";
export const WEBNAV_GROUP_NAME = "webnav";
export const WEBNAV_GROUP_COLOR = "cyan" as const;
export const MAX_HISTORY_SIZE = 200;

// Global state
export let nativePort: chrome.runtime.Port | null = null;
export const pendingRequests = new Map<
	string,
	{ reject: (err: Error) => void }
>();
export let isConnected = false;

export let webnavGroupId: number | null = null;
export let activeWebnavTabId: number | null = null;
export let commandHistory: HistoryEntry[] = [];

// State setters (needed because modules get a copy of the binding)
export function setNativePort(port: chrome.runtime.Port | null) {
	nativePort = port;
}

export function setIsConnected(value: boolean) {
	isConnected = value;
}

export function setWebnavGroupId(id: number | null) {
	webnavGroupId = id;
}

export function setActiveWebnavTabId(id: number | null) {
	activeWebnavTabId = id;
}

export function setCommandHistory(history: HistoryEntry[]) {
	commandHistory = history;
}

// Session storage persistence
export async function persistState() {
	try {
		await chrome.storage.session.set({
			webnavGroupId,
			activeWebnavTabId,
			commandHistory,
		});
	} catch (err) {
		console.warn("[WebNav] Failed to persist state:", err);
	}
}

export async function restoreState() {
	try {
		const stored = await chrome.storage.session.get([
			"webnavGroupId",
			"activeWebnavTabId",
			"commandHistory",
		]);

		commandHistory = stored.commandHistory || [];

		// Validate group still exists
		if (stored.webnavGroupId != null) {
			try {
				const group = await chrome.tabGroups.get(stored.webnavGroupId);
				if (group) {
					webnavGroupId = stored.webnavGroupId;
				}
			} catch {
				webnavGroupId = null;
			}
		}

		// Validate tab still exists and belongs to group
		if (stored.activeWebnavTabId != null && webnavGroupId != null) {
			try {
				const tab = await chrome.tabs.get(stored.activeWebnavTabId);
				if (tab && tab.groupId === webnavGroupId) {
					activeWebnavTabId = stored.activeWebnavTabId;
				} else {
					activeWebnavTabId = null;
				}
			} catch {
				activeWebnavTabId = null;
			}
		}

		console.log("[WebNav] State restored:", {
			webnavGroupId,
			activeWebnavTabId,
			historySize: commandHistory.length,
		});
	} catch (err) {
		console.warn("[WebNav] Failed to restore state:", err);
	}
}
