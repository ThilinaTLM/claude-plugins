/**
 * Type-safe argument extraction for citty commands.
 * Reduces repetitive type assertions across commands.
 */

/**
 * Context levels for output verbosity
 */
export type ContextLevel = "min" | "standard" | "full";

/**
 * Common arguments shared by most commands
 */
export interface CommonArgs {
  root?: string;
  plain: boolean;
  quiet: boolean;
}

/**
 * Extended arguments for commands with context levels
 */
export interface ContextArgs extends CommonArgs {
  context: ContextLevel;
  since?: string;
}

/**
 * Output context providing helpers for JSON/plain/quiet modes
 */
export interface OutputContext {
  usePlain: boolean;
  quiet: boolean;
  /** Output formatted JSON (default mode) */
  json: <T>(data: T) => void;
  /** Output compact JSON (quiet mode) */
  quietJson: <T>(data: T) => void;
  /** Output error and exit */
  exitWithError: (error: string, details?: Record<string, unknown>) => never;
}

/**
 * Extract common args from citty's loosely-typed args object
 */
export function parseCommonArgs(args: Record<string, unknown>): CommonArgs {
  return {
    root: args.root as string | undefined,
    plain: Boolean(args.plain),
    quiet: Boolean(args.quiet),
  };
}

/**
 * Extract context-aware args from citty's loosely-typed args object
 */
export function parseContextArgs(args: Record<string, unknown>): ContextArgs {
  const contextValue = args.context as string | undefined;
  let context: ContextLevel = "standard";

  if (contextValue === "min" || contextValue === "minimal") {
    context = "min";
  } else if (contextValue === "full") {
    context = "full";
  }

  return {
    root: args.root as string | undefined,
    plain: Boolean(args.plain),
    quiet: Boolean(args.quiet),
    context,
    since: args.since as string | undefined,
  };
}

/**
 * Create an output context from common args
 */
export function createOutputContext(args: CommonArgs): OutputContext {
  const { plain: usePlain, quiet } = args;

  return {
    usePlain,
    quiet,

    json: <T>(data: T) => {
      console.log(JSON.stringify(data, null, 2));
    },

    quietJson: <T>(data: T) => {
      console.log(JSON.stringify(data));
    },

    exitWithError: (error: string, details?: Record<string, unknown>): never => {
      const errorData = { error, ...details };
      if (!usePlain) {
        console.log(JSON.stringify(errorData, null, 2));
      } else {
        console.error(`Error: ${error}`);
        if (details) {
          for (const [key, value] of Object.entries(details)) {
            if (key !== "suggestions") {
              console.error(`  ${key}: ${value}`);
            }
          }
        }
      }
      process.exit(1);
    },
  };
}

/**
 * Determine output mode based on args
 */
export function getOutputMode(args: CommonArgs): "json" | "quiet-json" | "plain" | "quiet-plain" {
  if (args.quiet && args.plain) return "quiet-plain";
  if (args.quiet) return "quiet-json";
  if (args.plain) return "plain";
  return "json";
}
