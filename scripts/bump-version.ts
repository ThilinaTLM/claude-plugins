#!/usr/bin/env bun

/**
 * Interactive version bump script for all plugins in the marketplace.
 *
 * Usage:
 *   bun scripts/bump-version.ts              # Interactive mode
 *   bun scripts/bump-version.ts webnav patch  # Direct mode
 */

import { resolve, join } from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";

const ROOT = resolve(import.meta.dirname, "..");
const MARKETPLACE_PATH = join(ROOT, ".claude-plugin", "marketplace.json");

// Additional version files beyond the standard plugin.json and CLI package.json
const EXTRA_VERSION_FILES: Record<string, string[]> = {
  webnav: ["skills/webnav/extension/manifest.json"],
};

// --- Helpers ---

const rl = createInterface({ input: process.stdin, output: process.stdout });

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

function readJson(path: string): any {
  return JSON.parse(readFileSync(path, "utf-8"));
}

function writeJson(path: string, data: any): void {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
}

function bumpVersion(
  version: string,
  type: "patch" | "minor" | "major",
): string {
  const [major, minor, patch] = version.split(".").map(Number);
  switch (type) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
  }
}

function getVersionFiles(pluginName: string): string[] {
  const files = [
    join(ROOT, pluginName, ".claude-plugin", "plugin.json"),
    join(
      ROOT,
      pluginName,
      "skills",
      pluginName,
      "scripts",
      `${pluginName}-cli`,
      "package.json",
    ),
  ];

  for (const extra of EXTRA_VERSION_FILES[pluginName] ?? []) {
    files.push(join(ROOT, pluginName, extra));
  }

  return files.filter((f) => existsSync(f));
}

// --- Main ---

async function main() {
  const marketplace = readJson(MARKETPLACE_PATH);
  const plugins = marketplace.plugins as Array<{
    name: string;
    version: string;
  }>;

  let pluginName = process.argv[2];
  let bumpType = process.argv[3] as "patch" | "minor" | "major" | undefined;

  // Select plugin
  if (!pluginName) {
    console.log("\nAvailable plugins:\n");
    for (const [i, p] of plugins.entries()) {
      console.log(`  ${i + 1}) ${p.name} (v${p.version})`);
    }

    const choice = await ask(`\nSelect plugin [1-${plugins.length}]: `);
    const index = parseInt(choice) - 1;
    if (index < 0 || index >= plugins.length) {
      console.error("Invalid selection");
      process.exit(1);
    }
    pluginName = plugins[index].name;
  }

  const plugin = plugins.find((p) => p.name === pluginName);
  if (!plugin) {
    console.error(`Plugin "${pluginName}" not found in marketplace`);
    process.exit(1);
  }

  // Show current versions across all files
  const versionFiles = getVersionFiles(pluginName);
  const currentVersion = plugin.version;

  console.log(`\nPlugin: ${pluginName}`);
  console.log(`Current version: ${currentVersion}\n`);

  console.log("Files to update:");
  console.log(`  .claude-plugin/marketplace.json (${currentVersion})`);
  for (const file of versionFiles) {
    const rel = file.replace(ROOT + "/", "");
    const json = readJson(file);
    const mismatch = json.version !== currentVersion ? " [MISMATCH]" : "";
    console.log(`  ${rel} (${json.version})${mismatch}`);
  }

  // Select bump type
  if (!bumpType) {
    console.log(`\nBump type:`);
    console.log(`  1) patch  ->  ${bumpVersion(currentVersion, "patch")}`);
    console.log(`  2) minor  ->  ${bumpVersion(currentVersion, "minor")}`);
    console.log(`  3) major  ->  ${bumpVersion(currentVersion, "major")}`);

    const choice = await ask("\nSelect [1-3]: ");
    bumpType = (["patch", "minor", "major"] as const)[parseInt(choice) - 1];
    if (!bumpType) {
      console.error("Invalid selection");
      process.exit(1);
    }
  }

  if (!["patch", "minor", "major"].includes(bumpType)) {
    console.error(`Invalid bump type: "${bumpType}" (use patch, minor, or major)`);
    process.exit(1);
  }

  const newVersion = bumpVersion(currentVersion, bumpType);

  console.log(`\nBumping ${pluginName}: ${currentVersion} -> ${newVersion}\n`);

  // Update marketplace.json
  plugin.version = newVersion;
  writeJson(MARKETPLACE_PATH, marketplace);
  console.log("  Updated .claude-plugin/marketplace.json");

  // Update individual version files
  for (const file of versionFiles) {
    const json = readJson(file);
    const oldVersion = json.version;
    json.version = newVersion;
    writeJson(file, json);
    const rel = file.replace(ROOT + "/", "");
    console.log(`  Updated ${rel} (${oldVersion} -> ${newVersion})`);
  }

  console.log(`\nDone! ${pluginName} is now at v${newVersion}`);
  rl.close();
}

main().catch((err) => {
  console.error(err);
  rl.close();
  process.exit(1);
});
