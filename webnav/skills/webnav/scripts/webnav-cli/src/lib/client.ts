/**
 * Unix socket client for communicating with the native host.
 */

import { type Socket, connect } from "node:net";
import {
	getConnectionErrorHint,
	getConnectionFailedHint,
	getSocketPath,
	getTimeoutHint,
	socketExists,
} from "./errors";
import { jsonError } from "./output";

const SOCKET_PATH = getSocketPath();
const DEFAULT_TIMEOUT = 30000;

export { getSocketPath, socketExists as isSocketAvailable };

export interface ClientOptions {
	timeout?: number;
}

/**
 * Send a command to the extension via the native host and wait for response.
 */
export async function sendCommand<T = Record<string, unknown>>(
	action: string,
	payload: Record<string, unknown> = {},
	options: ClientOptions = {},
): Promise<T> {
	const timeout = options.timeout ?? DEFAULT_TIMEOUT;

	// Check if socket exists and detect error state
	if (!socketExists()) {
		const { code, hint } = getConnectionErrorHint();
		const message =
			code === "SETUP_REQUIRED"
				? "WebNav has not been set up"
				: "WebNav not connected";
		jsonError(message, code, hint);
	}

	return new Promise((resolve, reject) => {
		const id = crypto.randomUUID();
		let socket: Socket;
		let buffer = "";
		let timeoutHandle: ReturnType<typeof setTimeout>;

		const cleanup = () => {
			clearTimeout(timeoutHandle);
			socket?.destroy();
		};

		try {
			socket = connect(SOCKET_PATH);

			socket.on("connect", () => {
				const message = `${JSON.stringify({ id, action, payload })}\n`;
				socket.write(message);
			});

			socket.on("data", (data) => {
				buffer += data.toString();
				const lines = buffer.split("\n");
				buffer = lines.pop() || "";

				for (const line of lines) {
					if (!line.trim()) continue;

					try {
						const response = JSON.parse(line);

						// Check if this is our response
						if (response.id === id) {
							cleanup();

							if (response.ok) {
								resolve(response.data as T);
							} else {
								jsonError(
									response.error || "Unknown error from extension",
									"EXTENSION_ERROR",
								);
							}
						}
					} catch (e) {
						// Ignore parse errors for partial messages
					}
				}
			});

			socket.on("error", (err) => {
				cleanup();
				jsonError(
					`Connection failed: ${err.message}`,
					"CONNECTION_FAILED",
					getConnectionFailedHint(),
				);
			});

			socket.on("close", () => {
				cleanup();
				// If we haven't resolved yet, it means connection closed unexpectedly
			});

			timeoutHandle = setTimeout(() => {
				cleanup();
				jsonError(
					`Command timed out after ${timeout}ms`,
					"TIMEOUT",
					getTimeoutHint(timeout),
				);
			}, timeout);
		} catch (err) {
			jsonError(
				`Failed to connect: ${err instanceof Error ? err.message : String(err)}`,
				"CONNECTION_FAILED",
			);
		}
	});
}
