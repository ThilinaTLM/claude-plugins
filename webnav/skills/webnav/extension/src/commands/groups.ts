import {
	activeWebnavTabId,
	commandHistory,
	persistState,
	setActiveWebnavTabId,
	webnavGroupId,
} from "../state";
import { addTabToGroup, autoSelectActiveTab, ensureWebnavGroup } from "../tabs";
import type { CommandPayload } from "../types";

export async function handleGroupTabs(
	_payload: CommandPayload,
): Promise<Record<string, unknown>> {
	await ensureWebnavGroup();

	if (webnavGroupId == null) {
		return { tabs: [], activeTabId: null };
	}

	const tabs = await chrome.tabs.query({ groupId: webnavGroupId });
	return {
		tabs: tabs.map((tab) => ({
			id: tab.id,
			url: tab.url,
			title: tab.title,
			active: tab.id === activeWebnavTabId,
			windowId: tab.windowId,
		})),
		activeTabId: activeWebnavTabId,
	};
}

export async function handleGroupSwitch(
	payload: CommandPayload,
): Promise<Record<string, unknown>> {
	const { tabId } = payload;
	if (tabId == null) {
		throw new Error("tabId is required");
	}

	await ensureWebnavGroup();

	// Verify tab exists and belongs to group
	const tab = await chrome.tabs.get(tabId);
	if (!tab) {
		throw new Error(`Tab ${tabId} not found`);
	}
	if (webnavGroupId != null && tab.groupId !== webnavGroupId) {
		throw new Error(`Tab ${tabId} is not in the webnav group`);
	}

	setActiveWebnavTabId(tabId);
	await chrome.tabs.update(tabId, { active: true });
	await persistState();

	return {
		activeTabId: tabId,
		url: tab.url,
		title: tab.title,
	};
}

export async function handleGroupAdd(
	payload: CommandPayload,
): Promise<Record<string, unknown>> {
	let { tabId } = payload;

	// If no tabId specified, use browser's currently active tab
	if (tabId == null) {
		const [browserTab] = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});
		if (!browserTab) {
			throw new Error("No active browser tab found");
		}
		tabId = browserTab.id!;
	}

	const tab = await chrome.tabs.get(tabId);
	if (!tab) {
		throw new Error(`Tab ${tabId} not found`);
	}

	await addTabToGroup(tabId);
	setActiveWebnavTabId(tabId);
	await persistState();

	return {
		tabId,
		url: tab.url,
		title: tab.title,
		groupId: webnavGroupId,
	};
}

export async function handleGroupRemove(
	payload: CommandPayload,
): Promise<Record<string, unknown>> {
	const { tabId } = payload;
	if (tabId == null) {
		throw new Error("tabId is required");
	}

	await ensureWebnavGroup();

	const tab = await chrome.tabs.get(tabId);
	if (!tab) {
		throw new Error(`Tab ${tabId} not found`);
	}
	if (webnavGroupId != null && tab.groupId !== webnavGroupId) {
		throw new Error(`Tab ${tabId} is not in the webnav group`);
	}

	// Ungroup the tab (keeps it open)
	await chrome.tabs.ungroup(tabId);

	// If it was the active tab, auto-select another
	if (tabId === activeWebnavTabId) {
		setActiveWebnavTabId(null);
		await autoSelectActiveTab();
	}

	await persistState();

	return {
		tabId,
		url: tab.url,
		title: tab.title,
		removed: true,
	};
}

export async function handleGroupClose(
	payload: CommandPayload,
): Promise<Record<string, unknown>> {
	const { tabId } = payload;
	if (tabId == null) {
		throw new Error("tabId is required");
	}

	await ensureWebnavGroup();

	const tab = await chrome.tabs.get(tabId);
	if (!tab) {
		throw new Error(`Tab ${tabId} not found`);
	}
	if (webnavGroupId != null && tab.groupId !== webnavGroupId) {
		throw new Error(`Tab ${tabId} is not in the webnav group`);
	}

	const closedUrl = tab.url;
	const closedTitle = tab.title;

	await chrome.tabs.remove(tabId);

	// onRemoved listener handles auto-select, but ensure state is clean
	if (tabId === activeWebnavTabId) {
		setActiveWebnavTabId(null);
		await autoSelectActiveTab();
	}

	await persistState();

	return {
		tabId,
		url: closedUrl,
		title: closedTitle,
		closed: true,
	};
}

export async function handleHistory(
	payload: CommandPayload,
): Promise<Record<string, unknown>> {
	const { limit = 50, offset = 0 } = payload;

	const total = commandHistory.length;
	// Slice from the end (newest last)
	const start = Math.max(0, total - offset - limit);
	const end = Math.max(0, total - offset);
	const entries = commandHistory.slice(start, end);

	return {
		entries,
		total,
		limit,
		offset,
	};
}
