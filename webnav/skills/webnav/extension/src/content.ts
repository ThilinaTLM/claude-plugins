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

const MAX_ENTRIES = 100;
const consoleLogs: ConsoleEntry[] = [];
const errorLogs: ErrorEntry[] = [];

// Intercept console methods
const origLog = console.log;
const origWarn = console.warn;
const origError = console.error;
const origInfo = console.info;

function captureConsole(level: string, args: unknown[]) {
	const text = args
		.map((a) => {
			try {
				return typeof a === "string" ? a : JSON.stringify(a);
			} catch {
				return String(a);
			}
		})
		.join(" ");

	consoleLogs.push({ level, text, timestamp: new Date().toISOString() });
	if (consoleLogs.length > MAX_ENTRIES) consoleLogs.shift();
}

console.log = (...args: unknown[]) => {
	captureConsole("log", args);
	origLog.apply(console, args);
};
console.warn = (...args: unknown[]) => {
	captureConsole("warn", args);
	origWarn.apply(console, args);
};
console.error = (...args: unknown[]) => {
	captureConsole("error", args);
	origError.apply(console, args);
};
console.info = (...args: unknown[]) => {
	captureConsole("info", args);
	origInfo.apply(console, args);
};

// Capture errors
window.addEventListener("error", (event) => {
	errorLogs.push({
		message: event.message,
		source: event.filename || "",
		line: event.lineno || 0,
		col: event.colno || 0,
		timestamp: new Date().toISOString(),
	});
	if (errorLogs.length > MAX_ENTRIES) errorLogs.shift();
});

window.addEventListener("unhandledrejection", (event) => {
	errorLogs.push({
		message: String(event.reason),
		source: "",
		line: 0,
		col: 0,
		timestamp: new Date().toISOString(),
	});
	if (errorLogs.length > MAX_ENTRIES) errorLogs.shift();
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
	return false;
});
