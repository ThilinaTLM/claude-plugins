/**
 * Browser registry — single source of truth for supported browsers.
 */

import { existsSync } from "node:fs";
import { homedir, platform } from "node:os";
import { join } from "node:path";

export type BrowserSlug = "chrome" | "brave" | "edge" | "chromium";

export const BROWSER_SLUGS: BrowserSlug[] = [
	"chrome",
	"brave",
	"edge",
	"chromium",
];

const MANIFEST_FILENAME = "com.tlmtech.webnav.json";

interface BrowserMeta {
	name: string;
	extensionsUrl: string;
	paths: {
		darwin: string[];
		linux: string[];
	};
}

export const BROWSERS: Record<BrowserSlug, BrowserMeta> = {
	chrome: {
		name: "Chrome",
		extensionsUrl: "chrome://extensions",
		paths: {
			darwin: ["Google", "Chrome"],
			linux: ["google-chrome"],
		},
	},
	brave: {
		name: "Brave",
		extensionsUrl: "brave://extensions",
		paths: {
			darwin: ["BraveSoftware", "Brave-Browser"],
			linux: ["BraveSoftware", "Brave-Browser"],
		},
	},
	edge: {
		name: "Edge",
		extensionsUrl: "edge://extensions",
		paths: {
			darwin: ["Microsoft Edge"],
			linux: ["microsoft-edge"],
		},
	},
	chromium: {
		name: "Chromium",
		extensionsUrl: "chrome://extensions",
		paths: {
			darwin: ["Chromium"],
			linux: ["chromium"],
		},
	},
};

/**
 * Resolve the NativeMessagingHosts directory for a given browser + platform.
 */
export function getNativeMessagingHostsDir(browser: BrowserSlug): string {
	const os = platform();
	const meta = BROWSERS[browser];

	if (os === "darwin") {
		return join(
			homedir(),
			"Library",
			"Application Support",
			...meta.paths.darwin,
			"NativeMessagingHosts",
		);
	}
	if (os === "linux") {
		return join(
			homedir(),
			".config",
			...meta.paths.linux,
			"NativeMessagingHosts",
		);
	}

	// win32 and others — caller must handle
	return "";
}

/**
 * Full manifest file path for a given browser.
 */
export function getManifestPathForBrowser(browser: BrowserSlug): string {
	const dir = getNativeMessagingHostsDir(browser);
	if (!dir) return "";
	return join(dir, MANIFEST_FILENAME);
}

/**
 * Validate and parse a string into a BrowserSlug, or return undefined.
 */
export function parseBrowserSlug(value: string): BrowserSlug | undefined {
	if (BROWSER_SLUGS.includes(value as BrowserSlug)) {
		return value as BrowserSlug;
	}
	return undefined;
}

/**
 * Return the list of browsers that currently have a manifest installed.
 */
export function getInstalledBrowsers(): BrowserSlug[] {
	return BROWSER_SLUGS.filter((slug) => {
		const p = getManifestPathForBrowser(slug);
		return p !== "" && existsSync(p);
	});
}
