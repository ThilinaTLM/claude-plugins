// Runs in ISOLATED world. Receives captured console/error entries from the
// MAIN world script (content-main.ts) via window.postMessage, and responds
// to extension queries via chrome.runtime.onMessage.
export {};

interface ConsoleEntry {
	level: string;
	text: string;
	timestamp: string;
}

interface ErrorEntry {
	message: string;
	source: string;
	line: number;
	col: number;
	timestamp: string;
}

interface NetworkEntry {
	method: string;
	url: string;
	status: number;
	statusText: string;
	type: string;
	duration: number;
	timestamp: string;
}

const WEBNAV_MSG = "__webnav__";
const MAX_ENTRIES = 100;
const MAX_NETWORK_ENTRIES = 200;
const consoleLogs: ConsoleEntry[] = [];
const errorLogs: ErrorEntry[] = [];
const networkLogs: NetworkEntry[] = [];

// Receive captured entries from the MAIN world script
window.addEventListener("message", (event) => {
	if (event.source !== window) return;
	const data = event.data;
	if (!data || data.type !== WEBNAV_MSG) return;

	if (data.kind === "console") {
		consoleLogs.push({
			level: data.level,
			text: data.text,
			timestamp: data.timestamp,
		});
		if (consoleLogs.length > MAX_ENTRIES) consoleLogs.shift();
	} else if (data.kind === "error") {
		errorLogs.push({
			message: data.message,
			source: data.source,
			line: data.line,
			col: data.col,
			timestamp: data.timestamp,
		});
		if (errorLogs.length > MAX_ENTRIES) errorLogs.shift();
	} else if (data.kind === "network") {
		networkLogs.push({
			method: data.method,
			url: data.url,
			status: data.status,
			statusText: data.statusText,
			type: data.requestType,
			duration: data.duration,
			timestamp: data.timestamp,
		});
		if (networkLogs.length > MAX_NETWORK_ENTRIES) networkLogs.shift();
	}
});

// Respond to messages from the extension
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
	if (message.type === "getConsole") {
		const result = [...consoleLogs];
		if (message.clear) consoleLogs.length = 0;
		sendResponse({ logs: result });
		return true;
	}
	if (message.type === "getErrors") {
		const result = [...errorLogs];
		if (message.clear) errorLogs.length = 0;
		sendResponse({ errors: result });
		return true;
	}
	if (message.type === "getNetwork") {
		const result = [...networkLogs];
		if (message.clear) networkLogs.length = 0;
		sendResponse({ requests: result });
		return true;
	}
	return false;
});
