// Error codes
export type ErrorCode =
	| "NOT_CONNECTED"
	| "CONNECTION_FAILED"
	| "TIMEOUT"
	| "EXTENSION_ERROR"
	| "INVALID_ARGS"
	| "ELEMENT_NOT_FOUND"
	| "SETUP_FAILED"
	| "NATIVE_HOST_ERROR";

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
	hint?: string;
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
	bounds: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
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
