/**
 * Shared screenshot save utility.
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Save a base64-encoded screenshot image to disk.
 * @returns The absolute file path where the screenshot was saved.
 */
export function saveScreenshot(image: string, dir?: string): string {
	const outputDir = dir || tmpdir();
	if (!existsSync(outputDir)) {
		mkdirSync(outputDir, { recursive: true });
	}

	const timestamp = new Date()
		.toISOString()
		.replace(/[:-]/g, "")
		.replace("T", "_")
		.slice(0, 15);
	const filename = `screenshot_${timestamp}.png`;
	const filepath = join(outputDir, filename);

	const base64Data = image.replace(/^data:image\/png;base64,/, "");
	const buffer = Buffer.from(base64Data, "base64");
	writeFileSync(filepath, buffer);

	return filepath;
}
