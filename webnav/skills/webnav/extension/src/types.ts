export interface HistoryEntry {
	action: string;
	payload: Record<string, unknown>;
	ok: boolean;
	timestamp: string;
	durationMs: number;
	result?: Record<string, unknown>;
	error?: string;
}

export interface TabInfo {
	id: number;
	url: string;
	title: string;
	active: boolean;
	windowId: number;
}

export interface CommandPayload {
	// Navigation
	url?: string;
	newTab?: boolean;
	// Interaction
	text?: string;
	selector?: string;
	index?: number;
	key?: string;
	label?: string;
	value?: string;
	timeout?: number;
	// Scroll
	direction?: "up" | "down" | "left" | "right";
	x?: number;
	y?: number;
	amount?: number;
	// Select / Check
	optionValue?: string;
	optionText?: string;
	checked?: boolean;
	// Snapshot
	interactive?: boolean;
	maxDepth?: number;
	compact?: boolean;
	ref?: string;
	// Evaluate / Dialog
	expression?: string;
	dialogAction?: "accept" | "dismiss";
	// Console / Errors
	clear?: boolean;
	// Wait
	pattern?: string;
	// Screenshot
	fullPage?: boolean;
	// Query
	type?: string;
	name?: string;
	// Groups
	tabId?: number;
	// History
	limit?: number;
	offset?: number;
}

export interface NativeMessage {
	id: string;
	action: string;
	payload: CommandPayload;
}

export interface NativeResponse {
	id: string;
	ok: boolean;
	data?: unknown;
	error?: string;
}

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

export interface ClickResult {
	clicked?: boolean;
	tag?: string;
	text?: string;
	error?: string;
}

export interface TypeResult {
	typed?: boolean;
	value?: string;
	error?: string;
}

export interface KeyResult {
	sent?: boolean;
	key?: string;
	error?: string;
}

export interface FillResult {
	filled?: boolean;
	label?: string;
	value?: string;
	error?: string;
}

export interface WaitForResult {
	found?: boolean;
	error?: string;
}

export interface ElementsResult {
	elements: ElementInfo[];
	error?: string;
}
