/**
 * Save JSON data to a timestamped file.
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Save JSON data to a timestamped file on disk.
 * @returns The absolute file path where the JSON was saved.
 */
export function saveJson(data: unknown, prefix: string, dir?: string): string {
	const outputDir = dir || tmpdir();
	if (!existsSync(outputDir)) {
		mkdirSync(outputDir, { recursive: true });
	}

	const timestamp = new Date()
		.toISOString()
		.replace(/[:-]/g, "")
		.replace("T", "_")
		.slice(0, 15);
	const filename = `${prefix}_${timestamp}.json`;
	const filepath = join(outputDir, filename);

	writeFileSync(filepath, JSON.stringify(data, null, 2));

	return filepath;
}

/**
 * Estimate token count for JSON data (~4 chars per token).
 */
export function estimateTokens(data: unknown): number {
	return Math.ceil(JSON.stringify(data).length / 4);
}
