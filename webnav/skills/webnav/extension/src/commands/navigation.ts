import {
	activeWebnavTabId,
	persistState,
	setActiveWebnavTabId,
} from "../state";
import { commandHistory, webnavGroupId } from "../state";
import {
	addTabToGroup,
	ensureWebnavGroup,
	getActiveTab,
	getGroupTabCount,
	waitForTabLoad,
} from "../tabs";
import type { CommandPayload } from "../types";

export async function handleScreenshot(
	_payload: CommandPayload,
): Promise<Record<string, unknown>> {
	const tab = await getActiveTab();

	// Ensure the tab is active/visible so captureVisibleTab works
	await chrome.tabs.update(tab.id!, { active: true });
	// Brief delay to let the browser paint
	await new Promise((resolve) => setTimeout(resolve, 100));

	const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
		format: "png",
	});
	return {
		image: dataUrl,
		url: tab.url,
		title: tab.title,
	};
}

export async function handleGoto(
	payload: CommandPayload,
): Promise<Record<string, unknown>> {
	const { url, newTab } = payload;
	if (!url) {
		throw new Error("URL is required");
	}

	let tab: chrome.tabs.Tab;
	if (newTab) {
		// Create a new tab in the webnav group
		await ensureWebnavGroup();
		tab = await chrome.tabs.create({ url, active: true });
		await addTabToGroup(tab.id!);
		setActiveWebnavTabId(tab.id!);
		await persistState();
	} else {
		tab = await getActiveTab();
		await chrome.tabs.update(tab.id!, { url });
	}

	// Wait for page to load
	await waitForTabLoad(tab.id!);

	const updatedTab = await chrome.tabs.get(tab.id!);
	return {
		url: updatedTab.url,
		title: updatedTab.title,
	};
}

export async function handleInfo(
	_payload: CommandPayload,
): Promise<Record<string, unknown>> {
	const tab = await getActiveTab();
	return {
		id: tab.id,
		url: tab.url,
		title: tab.title,
		status: tab.status,
		active: tab.active,
		windowId: tab.windowId,
	};
}

export async function handleStatus(
	_payload: CommandPayload,
): Promise<Record<string, unknown>> {
	const tabCount = await getGroupTabCount();
	return {
		connected: true,
		version: chrome.runtime.getManifest().version,
		group: {
			groupId: webnavGroupId,
			activeTabId: activeWebnavTabId,
			tabCount,
		},
		historyCount: commandHistory.length,
	};
}
