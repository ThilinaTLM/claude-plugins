// Error codes
export type ErrorCode =
	| "SETUP_REQUIRED"
	| "NOT_CONNECTED"
	| "CONNECTION_FAILED"
	| "EXTENSION_DISCONNECTED"
	| "EXTENSION_OUTDATED"
	| "TIMEOUT"
	| "EXTENSION_ERROR"
	| "INVALID_ARGS"
	| "ELEMENT_NOT_FOUND"
	| "SETUP_FAILED"
	| "NATIVE_HOST_ERROR"
	| "GROUP_ERROR"
	| "TAB_NOT_IN_GROUP";

// Structured error hint for self-documenting errors
export interface ErrorHint {
	summary: string;
	steps?: string[];
	diagnostics?: string[];
	context?: string;
}

// Base response types
export interface SuccessResponse<T = Record<string, unknown>> {
	ok: true;
	action?: string;
	[key: string]: unknown;
}

export interface ErrorResponse {
	ok: false;
	error: string;
	code?: ErrorCode;
	hint?: ErrorHint;
}

export type Response<T = Record<string, unknown>> =
	| SuccessResponse<T>
	| ErrorResponse;

// Tab info
export interface TabInfo {
	id: number;
	url: string;
	title: string;
	active: boolean;
	windowId: number;
}

// Element info
export interface ElementInfo {
	tag: string;
	type: string;
	text: string;
	placeholder: string;
	ariaLabel: string;
	name: string;
	id: string;
	href: string;
	label: string;
	value: string;
	disabled: boolean;
	required: boolean;
	role: string;
	bounds: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
}

// Tab command responses
export interface TabListResponse {
	tabs: TabInfo[];
	activeTabId: number | null;
}

export interface TabSwitchResponse {
	activeTabId: number;
	url: string;
	title: string;
}

export interface TabNewResponse {
	tabId: number;
	url: string;
	title: string;
	activeTabId: number;
}

export interface TabCloseResponse {
	tabId: number;
	url: string;
	title: string;
	closed: boolean;
}

// History types
export interface HistoryEntry {
	action: string;
	payload: Record<string, unknown>;
	ok: boolean;
	timestamp: string;
	durationMs: number;
	result?: Record<string, unknown>;
	error?: string;
}

export interface HistoryResponse {
	entries: HistoryEntry[];
	total: number;
	limit: number;
	offset: number;
}

// Command message sent to extension
export interface CommandMessage {
	id: string;
	action: string;
	payload: Record<string, unknown>;
}

// Response from extension
export interface ExtensionResponse {
	id: string;
	ok: boolean;
	data?: Record<string, unknown>;
	error?: string;
}
