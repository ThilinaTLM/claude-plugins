import { existsSync } from "node:fs";
import { resolve, dirname, parse } from "node:path";

/**
 * Walk up directories to find a project root containing specs/ directory.
 * @param startDir - Starting directory (defaults to process.cwd())
 * @returns Project root path or null if not found
 */
export function findProjectRoot(startDir?: string): string | null {
  let current = resolve(startDir || process.cwd());

  while (true) {
    const specsPath = resolve(current, "specs");
    if (existsSync(specsPath)) {
      return current;
    }

    const parent = dirname(current);
    // Reached filesystem root
    if (parent === current) {
      return null;
    }
    current = parent;
  }
}

/**
 * Get the specs directory path, using explicit root or auto-detection.
 * @param explicitRoot - Explicit project root from --root flag
 * @returns Object with specsDir path and projectRoot (or null if not found)
 */
export function getSpecsDir(explicitRoot?: string): {
  specsDir: string;
  projectRoot: string | null;
  autoDetected: boolean;
} {
  if (explicitRoot) {
    return {
      specsDir: resolve(explicitRoot, "specs"),
      projectRoot: explicitRoot,
      autoDetected: false,
    };
  }

  const projectRoot = findProjectRoot();
  if (projectRoot) {
    return {
      specsDir: resolve(projectRoot, "specs"),
      projectRoot,
      autoDetected: true,
    };
  }

  // Fallback to cwd - will likely fail but provides better error context
  return {
    specsDir: resolve(process.cwd(), "specs"),
    projectRoot: null,
    autoDetected: false,
  };
}

/**
 * Get the active specs directory path (replaces features/changes).
 * @param explicitRoot - Explicit project root from --root flag
 * @returns Object with activeDir path and context
 */
export function getActiveDir(explicitRoot?: string): {
  activeDir: string;
  specsDir: string;
  projectRoot: string | null;
  autoDetected: boolean;
} {
  const { specsDir, projectRoot, autoDetected } = getSpecsDir(explicitRoot);
  return {
    activeDir: resolve(specsDir, "active"),
    specsDir,
    projectRoot,
    autoDetected,
  };
}

/**
 * Get the archived specs directory path.
 * @param explicitRoot - Explicit project root from --root flag
 * @returns Object with archivedDir path and context
 */
export function getArchivedDir(explicitRoot?: string): {
  archivedDir: string;
  specsDir: string;
  projectRoot: string | null;
  autoDetected: boolean;
} {
  const { specsDir, projectRoot, autoDetected } = getSpecsDir(explicitRoot);
  return {
    archivedDir: resolve(specsDir, "archived"),
    specsDir,
    projectRoot,
    autoDetected,
  };
}
