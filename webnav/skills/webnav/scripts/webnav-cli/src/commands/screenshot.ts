import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineCommand } from "citty";
import { sendCommand } from "../lib/client";
import { jsonOk } from "../lib/output";

export const screenshotCommand = defineCommand({
	meta: {
		name: "screenshot",
		description: "Capture screenshot of the current tab",
	},
	args: {
		dir: {
			type: "string",
			alias: "d",
			description: "Output directory (default: system temp)",
		},
	},
	async run({ args }) {
		const result = await sendCommand<{
			image: string;
			url: string;
			title: string;
		}>("screenshot");

		const outputDir = (args.dir as string) || tmpdir();
		if (!existsSync(outputDir)) {
			mkdirSync(outputDir, { recursive: true });
		}

		// Generate filename with timestamp
		const timestamp = new Date()
			.toISOString()
			.replace(/[:-]/g, "")
			.replace("T", "_")
			.slice(0, 15);
		const filename = `screenshot_${timestamp}.png`;
		const filepath = join(outputDir, filename);

		// Decode base64 and save
		const base64Data = result.image.replace(/^data:image\/png;base64,/, "");
		const buffer = Buffer.from(base64Data, "base64");
		writeFileSync(filepath, buffer);

		jsonOk({
			action: "screenshot",
			screenshot: filepath,
			url: result.url,
			title: result.title,
		});
	},
});
