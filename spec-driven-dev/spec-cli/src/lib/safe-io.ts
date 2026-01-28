/**
 * Safe I/O operations with Result types.
 * Provides graceful error handling for file operations.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";

/**
 * Result type for operations that can fail.
 */
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

/**
 * Read a file safely, returning a Result.
 */
export function readFileSafe(path: string): Result<string> {
  try {
    if (!existsSync(path)) {
      return { ok: false, error: new Error(`File not found: ${path}`) };
    }
    const content = readFileSync(path, "utf-8");
    return { ok: true, value: content };
  } catch (e) {
    return { ok: false, error: e as Error };
  }
}

/**
 * Parse YAML content safely, returning a Result.
 */
export function parseYamlSafe<T>(content: string): Result<T> {
  try {
    const data = parseYaml(content) as T;
    return { ok: true, value: data };
  } catch (e) {
    return { ok: false, error: e as Error };
  }
}

/**
 * Read and parse a YAML file safely.
 */
export function readYamlFileSafe<T>(path: string): Result<T> {
  const readResult = readFileSafe(path);
  if (!readResult.ok) {
    return readResult;
  }
  return parseYamlSafe<T>(readResult.value);
}

/**
 * Write a file safely, returning a Result.
 */
export function writeFileSafe(path: string, content: string): Result<void> {
  try {
    writeFileSync(path, content);
    return { ok: true, value: undefined };
  } catch (e) {
    return { ok: false, error: e as Error };
  }
}

/**
 * Check if a result is successful.
 * TypeScript type guard for narrowing Result<T, E>.
 */
export function isOk<T, E>(result: Result<T, E>): result is { ok: true; value: T } {
  return result.ok;
}

/**
 * Check if a result is an error.
 * TypeScript type guard for narrowing Result<T, E>.
 */
export function isError<T, E>(result: Result<T, E>): result is { ok: false; error: E } {
  return !result.ok;
}

/**
 * Unwrap a result, throwing if it's an error.
 */
export function unwrap<T>(result: Result<T>): T {
  if (result.ok) {
    return result.value;
  }
  throw result.error;
}

/**
 * Unwrap a result with a default value for errors.
 */
export function unwrapOr<T>(result: Result<T>, defaultValue: T): T {
  if (result.ok) {
    return result.value;
  }
  return defaultValue;
}
