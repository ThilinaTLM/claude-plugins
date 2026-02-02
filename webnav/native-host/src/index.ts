#!/usr/bin/env bun
/**
 * WebNav Native Host
 *
 * A minimal relay between the CLI (Unix socket) and Chrome extension (native messaging).
 * Chrome spawns this process when the extension connects via connectNative().
 *
 * Protocol:
 * - Native messaging uses 4-byte length-prefixed JSON on stdin/stdout
 * - Unix socket uses newline-delimited JSON
 */

import { unlinkSync, existsSync, mkdirSync } from "node:fs";
import { createServer, type Socket } from "node:net";
import { homedir } from "node:os";
import { join } from "node:path";

const SOCKET_DIR = join(homedir(), ".webnav");
const SOCKET_PATH = join(SOCKET_DIR, "webnav.sock");

// Ensure socket directory exists
if (!existsSync(SOCKET_DIR)) {
  mkdirSync(SOCKET_DIR, { recursive: true });
}

// Remove stale socket file
if (existsSync(SOCKET_PATH)) {
  unlinkSync(SOCKET_PATH);
}

// Track connected CLI clients
const clients: Set<Socket> = new Set();

// Buffer for reading native messages from stdin
let stdinBuffer = Buffer.alloc(0);

/**
 * Read native message from stdin (4-byte length prefix + JSON)
 */
function readNativeMessage(data: Buffer): Array<unknown> {
  stdinBuffer = Buffer.concat([stdinBuffer, data]);
  const messages: Array<unknown> = [];

  while (stdinBuffer.length >= 4) {
    const length = stdinBuffer.readUInt32LE(0);

    if (stdinBuffer.length < 4 + length) {
      break; // Wait for more data
    }

    const jsonData = stdinBuffer.subarray(4, 4 + length).toString("utf-8");
    stdinBuffer = stdinBuffer.subarray(4 + length);

    try {
      messages.push(JSON.parse(jsonData));
    } catch (e) {
      console.error("[native-host] Failed to parse message:", e);
    }
  }

  return messages;
}

/**
 * Write native message to stdout (4-byte length prefix + JSON)
 */
function writeNativeMessage(message: unknown): void {
  const json = JSON.stringify(message);
  const buffer = Buffer.alloc(4 + json.length);
  buffer.writeUInt32LE(json.length, 0);
  buffer.write(json, 4);
  process.stdout.write(buffer);
}

/**
 * Forward message from extension to all CLI clients
 */
function forwardToClients(message: unknown): void {
  const json = JSON.stringify(message) + "\n";
  for (const client of clients) {
    client.write(json);
  }
}

/**
 * Forward message from CLI client to extension
 */
function forwardToExtension(message: unknown): void {
  writeNativeMessage(message);
}

// Handle stdin from Chrome (native messaging)
process.stdin.on("data", (data: Buffer) => {
  const messages = readNativeMessage(data);
  for (const message of messages) {
    forwardToClients(message);
  }
});

process.stdin.on("end", () => {
  // Chrome closed the connection
  cleanup();
  process.exit(0);
});

// Create Unix socket server for CLI clients
const server = createServer((socket: Socket) => {
  clients.add(socket);

  let buffer = "";

  socket.on("data", (data: Buffer) => {
    buffer += data.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.trim()) {
        try {
          const message = JSON.parse(line);
          forwardToExtension(message);
        } catch (e) {
          console.error("[native-host] Failed to parse client message:", e);
        }
      }
    }
  });

  socket.on("close", () => {
    clients.delete(socket);
  });

  socket.on("error", (err) => {
    console.error("[native-host] Client socket error:", err);
    clients.delete(socket);
  });
});

server.listen(SOCKET_PATH, () => {
  // Signal ready by writing to stderr (Chrome ignores stderr)
  console.error(`[native-host] Listening on ${SOCKET_PATH}`);
});

server.on("error", (err) => {
  console.error("[native-host] Server error:", err);
  process.exit(1);
});

function cleanup(): void {
  for (const client of clients) {
    client.destroy();
  }
  clients.clear();
  server.close();
  if (existsSync(SOCKET_PATH)) {
    unlinkSync(SOCKET_PATH);
  }
}

// Handle process termination
process.on("SIGINT", () => {
  cleanup();
  process.exit(0);
});

process.on("SIGTERM", () => {
  cleanup();
  process.exit(0);
});
