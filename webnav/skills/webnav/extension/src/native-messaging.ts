import { executeCommand } from "./commands/router";
import { recordHistory } from "./history";
import {
	NATIVE_HOST_NAME,
	isConnected,
	nativePort,
	pendingRequests,
	setIsConnected,
	setNativePort,
} from "./state";
import type { NativeMessage, NativeResponse } from "./types";

export function connectToNativeHost() {
	if (nativePort) {
		return;
	}

	try {
		const port = chrome.runtime.connectNative(NATIVE_HOST_NAME);
		setNativePort(port);
		setIsConnected(true);
		console.log("[WebNav] Connected to native host");

		port.onMessage.addListener((message: NativeMessage) => {
			console.log("[WebNav] Received from native host:", message);
			handleNativeMessage(message);
		});

		port.onDisconnect.addListener(() => {
			const error =
				(chrome.runtime as unknown as { lastError?: { message?: string } })
					.lastError?.message || "Unknown error";
			console.log("[WebNav] Disconnected from native host:", error);
			setNativePort(null);
			setIsConnected(false);

			// Reject all pending requests
			for (const [_id, { reject }] of pendingRequests) {
				reject(new Error(`Native host disconnected: ${error}`));
			}
			pendingRequests.clear();

			// Try to reconnect after a delay
			setTimeout(connectToNativeHost, 5000);
		});
	} catch (err) {
		console.error("[WebNav] Failed to connect to native host:", err);
		setIsConnected(false);
	}
}

function handleNativeMessage(message: NativeMessage) {
	const { id, action, payload } = message;

	if (!id) {
		console.error("[WebNav] Message missing id:", message);
		return;
	}

	const startTime = Date.now();

	executeCommand(action, payload)
		.then((result) => {
			recordHistory(action, payload, true, result, startTime);
			sendResponse(id, true, result);
		})
		.catch((err: Error) => {
			recordHistory(action, payload, false, null, startTime, err.message);
			sendResponse(id, false, null, err.message);
		});
}

function sendResponse(
	id: string,
	ok: boolean,
	data: Record<string, unknown> | null,
	error: string | null = null,
) {
	const port = nativePort;
	if (!port) {
		console.error("[WebNav] Cannot send response - not connected");
		return;
	}

	const response: NativeResponse = { id, ok };
	if (ok) {
		response.data = data;
	} else {
		response.error = error ?? undefined;
	}

	console.log("[WebNav] Sending response:", response);
	port.postMessage(response);
}
