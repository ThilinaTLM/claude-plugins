// Runs in the page's MAIN world to capture actual page console output and errors.
// Relays captured entries to the content script (ISOLATED world) via window.postMessage.
export {};

const WEBNAV_MSG = "__webnav__";

interface CapturedConsole {
	type: typeof WEBNAV_MSG;
	kind: "console";
	level: string;
	text: string;
	timestamp: string;
}

interface CapturedError {
	type: typeof WEBNAV_MSG;
	kind: "error";
	message: string;
	source: string;
	line: number;
	col: number;
	timestamp: string;
}

interface CapturedNetwork {
	type: typeof WEBNAV_MSG;
	kind: "network";
	method: string;
	url: string;
	status: number;
	statusText: string;
	requestType: string;
	duration: number;
	timestamp: string;
}

// Wrap console methods
const origLog = console.log;
const origWarn = console.warn;
const origError = console.error;
const origInfo = console.info;
const origDebug = console.debug;

function capture(level: string, args: unknown[]) {
	const text = args
		.map((a) => {
			try {
				return typeof a === "string" ? a : JSON.stringify(a);
			} catch {
				return String(a);
			}
		})
		.join(" ");

	const msg: CapturedConsole = {
		type: WEBNAV_MSG,
		kind: "console",
		level,
		text,
		timestamp: new Date().toISOString(),
	};
	window.postMessage(msg, "*");
}

console.log = (...args: unknown[]) => {
	capture("log", args);
	origLog.apply(console, args);
};
console.warn = (...args: unknown[]) => {
	capture("warn", args);
	origWarn.apply(console, args);
};
console.error = (...args: unknown[]) => {
	capture("error", args);
	origError.apply(console, args);
};
console.info = (...args: unknown[]) => {
	capture("info", args);
	origInfo.apply(console, args);
};
console.debug = (...args: unknown[]) => {
	capture("debug", args);
	origDebug.apply(console, args);
};

// Capture runtime errors
window.addEventListener("error", (event) => {
	const msg: CapturedError = {
		type: WEBNAV_MSG,
		kind: "error",
		message: event.message,
		source: event.filename || "",
		line: event.lineno || 0,
		col: event.colno || 0,
		timestamp: new Date().toISOString(),
	};
	window.postMessage(msg, "*");
});

// Capture unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
	const msg: CapturedError = {
		type: WEBNAV_MSG,
		kind: "error",
		message: String(event.reason),
		source: "",
		line: 0,
		col: 0,
		timestamp: new Date().toISOString(),
	};
	window.postMessage(msg, "*");
});

// Wrap fetch to capture network requests
const origFetch = window.fetch;
window.fetch = async function (...args: Parameters<typeof fetch>) {
	const start = Date.now();
	const req = new Request(...args);
	const method = req.method;
	const url = req.url;
	try {
		const response = await origFetch.apply(this, args);
		const msg: CapturedNetwork = {
			type: WEBNAV_MSG,
			kind: "network",
			method,
			url,
			status: response.status,
			statusText: response.statusText,
			requestType: "fetch",
			duration: Date.now() - start,
			timestamp: new Date().toISOString(),
		};
		window.postMessage(msg, "*");
		return response;
	} catch (err) {
		const msg: CapturedNetwork = {
			type: WEBNAV_MSG,
			kind: "network",
			method,
			url,
			status: 0,
			statusText: err instanceof Error ? err.message : "Network error",
			requestType: "fetch",
			duration: Date.now() - start,
			timestamp: new Date().toISOString(),
		};
		window.postMessage(msg, "*");
		throw err;
	}
};

// Wrap XMLHttpRequest to capture network requests
const origXHROpen = XMLHttpRequest.prototype.open;
const origXHRSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function (
	method: string,
	url: string | URL,
	...rest: unknown[]
) {
	(this as XMLHttpRequest & { _wnMethod: string; _wnUrl: string })._wnMethod =
		method;
	(this as XMLHttpRequest & { _wnUrl: string })._wnUrl = String(url);
	return origXHROpen.apply(this, [method, url, ...rest] as Parameters<
		typeof origXHROpen
	>);
};

XMLHttpRequest.prototype.send = function (
	...args: Parameters<typeof origXHRSend>
) {
	const start = Date.now();
	const xhr = this as XMLHttpRequest & { _wnMethod: string; _wnUrl: string };
	xhr.addEventListener("loadend", () => {
		const msg: CapturedNetwork = {
			type: WEBNAV_MSG,
			kind: "network",
			method: xhr._wnMethod || "GET",
			url: xhr._wnUrl || "",
			status: xhr.status,
			statusText: xhr.statusText || "",
			requestType: "xhr",
			duration: Date.now() - start,
			timestamp: new Date().toISOString(),
		};
		window.postMessage(msg, "*");
	});
	return origXHRSend.apply(this, args);
};
