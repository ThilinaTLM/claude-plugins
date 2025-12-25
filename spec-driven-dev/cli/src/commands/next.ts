import { defineCommand } from "citty";
import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { parseTasksFile, getNextTask } from "../lib/spec-parser";
import { getFeaturesDir } from "../lib/project-root";
import { error, info } from "../ui/output";

export const nextCommand = defineCommand({
  meta: {
    name: "next",
    description: "Show only the next task (minimal output for AI tools)",
  },
  args: {
    feature: {
      type: "positional",
      description: "Feature name",
      required: false,
    },
    root: {
      type: "string",
      alias: "r",
      description: "Project root directory (default: auto-detect)",
    },
    plain: {
      type: "boolean",
      description: "Human-readable output instead of JSON",
    },
    filesOnly: {
      type: "boolean",
      description: "Output only file paths",
    },
    quiet: {
      type: "boolean",
      alias: "q",
      description: "Minimal output (task ID only)",
    },
  },
  async run({ args }) {
    const usePlain = args.plain as boolean;
    const filesOnly = args.filesOnly as boolean;
    const quiet = args.quiet as boolean;
    const { featuresDir, specsDir, projectRoot, autoDetected } = getFeaturesDir(args.root as string | undefined);

    // Check if specs directory exists first
    const specsExists = existsSync(specsDir);

    // If no feature specified, list available features
    if (!args.feature) {
      const features = existsSync(featuresDir)
        ? readdirSync(featuresDir, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name)
        : [];

      if (!usePlain) {
        console.log(JSON.stringify({ availableFeatures: features, specsDir, projectRoot, autoDetected }));
      } else {
        console.log("Usage: spec next {feature-name}");
        console.log("Available:", features.join(", ") || "(none)");
      }
      return;
    }

    const feature = args.feature as string;
    const featureDir = resolve(featuresDir, feature);

    if (!existsSync(featureDir)) {
      // Get available features for better error message
      const availableFeatures = existsSync(featuresDir)
        ? readdirSync(featuresDir, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name)
        : [];

      const errorData = {
        error: `Feature '${feature}' not found`,
        searchedPath: featureDir,
        specsFound: specsExists,
        availableFeatures,
        cwd: process.cwd(),
        projectRoot,
        autoDetected,
        suggestions: specsExists
          ? [`Available features: ${availableFeatures.join(", ") || "(none)"}`]
          : [
              "Run from project root containing specs/ directory",
              `Use --root flag: spec --root /path/to/project next ${feature}`,
              "Initialize specs: spec init",
            ],
      };

      if (!usePlain) {
        console.log(JSON.stringify(errorData, null, 2));
      } else {
        error(`Feature '${feature}' not found`);
        info(`Searched in: ${featureDir}`);
        if (!specsExists) {
          info(`No specs/ directory found at: ${specsDir}`);
          console.log();
          info("Suggestions:");
          info("  • Run from project root containing specs/ directory");
          info(`  • Use --root flag: spec --root /path/to/project next ${feature}`);
          info("  • Initialize specs: spec init");
        }
      }
      process.exit(1);
    }

    const tasksPath = resolve(featureDir, "tasks.yaml");
    if (!existsSync(tasksPath)) {
      if (!usePlain) {
        console.log(JSON.stringify({ error: "No tasks.yaml found", allComplete: false }));
      } else {
        error("No tasks.yaml found");
      }
      process.exit(1);
    }

    const phases = parseTasksFile(tasksPath);
    const nextTask = getNextTask(phases);

    if (!nextTask) {
      if (!usePlain) {
        console.log(JSON.stringify({ task: null, allComplete: true }));
      } else {
        console.log("All tasks complete!");
      }
      return;
    }

    // Files-only mode (plain text, works with both --plain and default)
    if (filesOnly) {
      if (!usePlain) {
        console.log(JSON.stringify({ files: nextTask.files }));
      } else {
        for (const file of nextTask.files) {
          console.log(file);
        }
      }
      return;
    }

    // Quiet mode - just task ID
    if (quiet) {
      if (!usePlain) {
        console.log(JSON.stringify({ taskId: nextTask.id }));
      } else {
        console.log(nextTask.id);
      }
      return;
    }

    // JSON mode (default)
    if (!usePlain) {
      console.log(
        JSON.stringify(
          {
            task: {
              id: nextTask.id,
              title: nextTask.title,
              files: nextTask.files,
              depends: nextTask.depends,
              subtasks: nextTask.subtasks,
            },
            allComplete: false,
          },
          null,
          2
        )
      );
      return;
    }

    // Plain human-readable output (--plain flag)
    console.log(`${nextTask.id}: ${nextTask.title}`);
    if (nextTask.files.length > 0) {
      console.log(`Files: ${nextTask.files.join(", ")}`);
    }
    if (nextTask.depends.length > 0) {
      console.log(`Depends: ${nextTask.depends.join(", ")}`);
    }
    console.log("Subtasks:");
    for (const subtask of nextTask.subtasks) {
      const check = subtask.completed ? "[x]" : "[ ]";
      console.log(`  ${check} ${subtask.text}`);
    }
  },
});
