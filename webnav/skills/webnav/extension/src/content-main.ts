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
