import {
	MAX_HISTORY_SIZE,
	commandHistory,
	persistState,
	setCommandHistory,
} from "./state";
import type { CommandPayload, HistoryEntry } from "./types";

export function recordHistory(
	action: string,
	payload: CommandPayload,
	ok: boolean,
	result: Record<string, unknown> | null,
	startTime: number,
	error: string | null = null,
) {
	const entry: HistoryEntry = {
		action,
		payload: sanitizePayload(payload),
		ok,
		timestamp: new Date().toISOString(),
		durationMs: Date.now() - startTime,
	};

	if (ok && result) {
		entry.result = sanitizeResult(action, result);
	}
	if (error) {
		entry.error = error;
	}

	const updated = [...commandHistory, entry];
	if (updated.length > MAX_HISTORY_SIZE) {
		setCommandHistory(updated.slice(-MAX_HISTORY_SIZE));
	} else {
		setCommandHistory(updated);
	}

	persistState();
}

function sanitizePayload(payload: CommandPayload): Record<string, unknown> {
	if (!payload) return {};
	return { ...payload };
}

function sanitizeResult(
	_action: string,
	result: Record<string, unknown>,
): Record<string, unknown> {
	if (!result) return result;
	const sanitized = { ...result };

	// Omit large base64 screenshot data
	if (sanitized.image) {
		sanitized.image = undefined;
		sanitized.hasImage = true;
	}

	// Summarize large element arrays
	if (sanitized.elements && Array.isArray(sanitized.elements)) {
		const count = sanitized.elements.length;
		sanitized.elements = undefined;
		sanitized.elementCount = count;
	}

	// Omit large snapshot tree data
	if (sanitized.tree) {
		sanitized.tree = undefined;
		sanitized.hasTree = true;
	}

	// Summarize network request arrays
	if (sanitized.network && Array.isArray(sanitized.network)) {
		const count = sanitized.network.length;
		sanitized.network = undefined;
		sanitized.networkCount = count;
	}

	return sanitized;
}
