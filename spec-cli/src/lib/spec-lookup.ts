/**
 * Spec directory lookup utilities.
 * Reduces duplicated error handling across commands.
 */

import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { error, info } from "../ui/output";
import { getActiveDir } from "./project-root";

/**
 * Result when a spec is found
 */
export interface SpecFound {
  found: true;
  specDir: string;
  tasksPath: string;
  specsDir: string;
  projectRoot: string | null;
  autoDetected: boolean;
}

/**
 * Error data when spec is not found
 */
export interface SpecNotFoundError {
  error: string;
  searchedPath: string;
  specsFound: boolean;
  availableSpecs: string[];
  cwd: string;
  projectRoot: string | null;
  autoDetected: boolean;
  suggestions: string[];
}

/**
 * Result when a spec is not found
 */
export interface SpecNotFound {
  found: false;
  errorData: SpecNotFoundError;
  specsDir: string;
  projectRoot: string | null;
  autoDetected: boolean;
}

export type SpecLookupResult = SpecFound | SpecNotFound;

/**
 * Look up a spec directory by name.
 * Returns either the spec paths or structured error data.
 */
export function lookupSpec(specName: string, rootArg?: string): SpecLookupResult {
  const { activeDir, specsDir, projectRoot, autoDetected } = getActiveDir(rootArg);
  const specDir = resolve(activeDir, specName);
  const specsExists = existsSync(specsDir);

  if (existsSync(specDir)) {
    return {
      found: true,
      specDir,
      tasksPath: resolve(specDir, "tasks.yaml"),
      specsDir,
      projectRoot,
      autoDetected,
    };
  }

  const availableSpecs = existsSync(activeDir)
    ? readdirSync(activeDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
    : [];

  return {
    found: false,
    specsDir,
    projectRoot,
    autoDetected,
    errorData: {
      error: `Spec '${specName}' not found`,
      searchedPath: specDir,
      specsFound: specsExists,
      availableSpecs,
      cwd: process.cwd(),
      projectRoot,
      autoDetected,
      suggestions: specsExists
        ? [`Available specs: ${availableSpecs.join(", ") || "(none)"}`]
        : [
            "Run from project root containing .specs/ directory",
            `Use --root flag: spec --root /path/to/project {command} ${specName}`,
            "Initialize specs: spec init",
          ],
    },
  };
}

/**
 * Output spec-not-found error and exit.
 * Handles both JSON and plain output modes.
 */
export function outputSpecNotFoundError(errorData: SpecNotFoundError, usePlain: boolean): never {
  if (!usePlain) {
    console.log(JSON.stringify(errorData, null, 2));
  } else {
    error(errorData.error);
    info(`Searched in: ${errorData.searchedPath}`);
    if (!errorData.specsFound) {
      info("No .specs/ directory found");
      console.log();
      info("Suggestions:");
      for (const suggestion of errorData.suggestions) {
        info(`  - ${suggestion}`);
      }
    } else if (errorData.availableSpecs.length > 0) {
      console.log();
      console.log("Available specs:");
      for (const s of errorData.availableSpecs) {
        info(`  ${s}`);
      }
    }
  }
  process.exit(1);
}

/**
 * Get available specs in the active directory.
 * Useful for listing and validation.
 */
export function getAvailableSpecs(rootArg?: string): string[] {
  const { activeDir } = getActiveDir(rootArg);

  if (!existsSync(activeDir)) {
    return [];
  }

  return readdirSync(activeDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}
