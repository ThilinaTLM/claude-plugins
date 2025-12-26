import { defineCommand } from "citty";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { compactSpec, estimateTokens } from "../lib/compactor";
import { success, error } from "../ui/output";

export const compactCommand = defineCommand({
  meta: {
    name: "compact",
    description: "Generate token-optimized version of a spec file",
  },
  args: {
    file: {
      type: "positional",
      description: "Spec file to compact (e.g., spec.md)",
      required: true,
    },
    output: {
      type: "string",
      alias: "o",
      description: "Output file (defaults to stdout)",
    },
    plain: {
      type: "boolean",
      description: "Human-readable output instead of JSON",
    },
  },
  async run({ args }) {
    const inputPath = args.file as string;
    const outputPath = args.output as string | undefined;
    const usePlain = args.plain as boolean;

    if (!existsSync(inputPath)) {
      if (!usePlain) {
        console.log(JSON.stringify({ error: `File not found: ${inputPath}` }));
      } else {
        error(`File not found: ${inputPath}`);
      }
      process.exit(1);
    }

    // Read input
    const content = readFileSync(inputPath, "utf-8");
    const originalTokens = estimateTokens(content);

    // Compact
    const compacted = compactSpec(content);
    const compactedTokens = estimateTokens(compacted);

    // Calculate reduction
    const reduction = ((originalTokens - compactedTokens) / originalTokens) * 100;

    // JSON output (default)
    if (!usePlain) {
      const result = {
        content: outputPath ? undefined : compacted,
        outputPath: outputPath || null,
        stats: {
          originalTokens,
          compactedTokens,
          reductionPercent: parseFloat(reduction.toFixed(1)),
        },
      };
      if (outputPath) {
        writeFileSync(outputPath, compacted);
      }
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    // Plain output
    if (outputPath) {
      writeFileSync(outputPath, compacted);
      success(`Compacted spec written to: ${outputPath}`);
    } else {
      console.log(compacted);
    }

    // Stats to stderr
    console.error();
    console.error("---");
    console.error(`Original: ~${originalTokens} tokens`);
    console.error(`Compacted: ~${compactedTokens} tokens`);
    console.error(`Reduction: ${reduction.toFixed(1)}%`);
  },
});
