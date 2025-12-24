import { defineCommand } from "citty";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseTasksFile, getNextTask } from "../lib/spec-parser";
import { error } from "../ui/output";

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
    json: {
      type: "boolean",
      description: "Output as JSON",
      required: false,
    },
    filesOnly: {
      type: "boolean",
      description: "Output only file paths",
      required: false,
    },
    quiet: {
      type: "boolean",
      alias: "q",
      description: "Minimal output (task ID only)",
      required: false,
    },
  },
  async run({ args }) {
    const useJson = args.json as boolean;
    const filesOnly = args.filesOnly as boolean;
    const quiet = args.quiet as boolean;
    const featuresDir = resolve(process.cwd(), "specs/features");

    // If no feature specified, list available features
    if (!args.feature) {
      const features = existsSync(featuresDir)
        ? readdirSync(featuresDir, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name)
        : [];

      if (useJson) {
        console.log(JSON.stringify({ availableFeatures: features }));
      } else {
        console.log("Usage: spec next {feature-name}");
        console.log("Available:", features.join(", ") || "(none)");
      }
      return;
    }

    const feature = args.feature as string;
    const featureDir = resolve(featuresDir, feature);

    if (!existsSync(featureDir)) {
      if (useJson) {
        console.log(JSON.stringify({ error: `Feature '${feature}' not found` }));
      } else {
        error(`Feature '${feature}' not found`);
      }
      process.exit(1);
    }

    const tasksPath = resolve(featureDir, "tasks.yaml");
    if (!existsSync(tasksPath)) {
      if (useJson) {
        console.log(JSON.stringify({ error: "No tasks.yaml found", allComplete: false }));
      } else {
        error("No tasks.yaml found");
      }
      process.exit(1);
    }

    const phases = parseTasksFile(tasksPath);
    const nextTask = getNextTask(phases);

    if (!nextTask) {
      if (useJson) {
        console.log(JSON.stringify({ task: null, allComplete: true }));
      } else {
        console.log("All tasks complete!");
      }
      return;
    }

    // Files-only mode
    if (filesOnly) {
      for (const file of nextTask.files) {
        console.log(file);
      }
      return;
    }

    // Quiet mode - just task ID
    if (quiet) {
      console.log(nextTask.id);
      return;
    }

    // JSON mode
    if (useJson) {
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

    // Minimal human-readable output (no fancy headers)
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
