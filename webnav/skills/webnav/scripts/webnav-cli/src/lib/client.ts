/**
 * Unix socket client for communicating with the native host.
 */

import { existsSync } from "node:fs";
import { type Socket, connect } from "node:net";
import { homedir } from "node:os";
import { join } from "node:path";
import { jsonError } from "./output";

const SOCKET_PATH = join(homedir(), ".webnav", "webnav.sock");
const DEFAULT_TIMEOUT = 30000;

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

	// Check if socket exists
	if (!existsSync(SOCKET_PATH)) {
		jsonError(
			"WebNav not connected. Make sure the Chrome extension is installed and running.",
			"NOT_CONNECTED",
			"Load the extension in Chrome (chrome://extensions) and ensure it connects to the native host.",
		);
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
					"Make sure the Chrome extension is running and connected.",
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
					"The extension did not respond in time.",
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

/**
 * Check if the native host socket exists.
 */
export function isSocketAvailable(): boolean {
	return existsSync(SOCKET_PATH);
}

/**
 * Get the socket path.
 */
export function getSocketPath(): string {
	return SOCKET_PATH;
}
