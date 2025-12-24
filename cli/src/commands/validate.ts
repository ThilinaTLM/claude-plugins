import { defineCommand } from "citty";
import { validateFeature } from "../lib/validator";
import { success, error, warn, note } from "../ui/output";

export const validateCommand = defineCommand({
  meta: {
    name: "validate",
    description: "Validate specification files for completeness",
  },
  args: {
    specDir: {
      type: "positional",
      description: "Path to spec directory (e.g., .spec/specs/my-feature/)",
      required: true,
    },
    json: {
      type: "boolean",
      description: "Output as JSON",
      required: false,
    },
    quiet: {
      type: "boolean",
      alias: "q",
      description: "Minimal output (pass/fail + error count only)",
      required: false,
    },
  },
  async run({ args }) {
    const specDir = args.specDir as string;
    const useJson = args.json as boolean;
    const quiet = args.quiet as boolean;

    const result = validateFeature(specDir);

    if (useJson) {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.ok ? 0 : 1);
    }

    // Quiet mode
    if (quiet) {
      if (result.ok) {
        console.log(`PASS ${result.warnings.length > 0 ? `(${result.warnings.length} warnings)` : ""}`);
      } else {
        console.log(`FAIL (${result.errors.length} errors)`);
      }
      process.exit(result.ok ? 0 : 1);
    }

    // Human-readable output
    console.log(`Validating: ${specDir}`);
    console.log("=".repeat(50));

    for (const msg of result.errors) {
      error(msg.message);
    }

    for (const msg of result.warnings) {
      warn(msg.message);
    }

    for (const msg of result.info) {
      note(msg.message);
    }

    console.log("=".repeat(50));

    if (result.ok) {
      success("Validation passed");
      if (result.warnings.length > 0) {
        console.log(`   (${result.warnings.length} warnings)`);
      }
      process.exit(0);
    } else {
      error(`Validation failed (${result.errors.length} errors)`);
      process.exit(1);
    }
  },
});
