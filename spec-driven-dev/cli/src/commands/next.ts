import { defineCommand } from "citty";
import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { parseTasksFile, getNextTask } from "../lib/spec-parser";
import { getActiveDir } from "../lib/project-root";
import { error, info } from "../ui/output";

export const nextCommand = defineCommand({
  meta: {
    name: "next",
    description: "Show only the next task (minimal output for AI tools)",
  },
  args: {
    feature: {
      type: "positional",
      description: "Spec name",
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
    const { activeDir, specsDir, projectRoot, autoDetected } = getActiveDir(args.root as string | undefined);

    // Check if specs directory exists first
    const specsExists = existsSync(specsDir);

    // If no spec specified, list available specs
    if (!args.feature) {
      const specs = existsSync(activeDir)
        ? readdirSync(activeDir, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name)
        : [];

      if (!usePlain) {
        console.log(JSON.stringify({ availableSpecs: specs, specsDir, projectRoot, autoDetected }));
      } else {
        console.log("Usage: spec next {spec-name}");
        console.log("Available:", specs.join(", ") || "(none)");
      }
      return;
    }

    const spec = args.feature as string;
    const specDir = resolve(activeDir, spec);

    if (!existsSync(specDir)) {
      // Get available specs for better error message
      const availableSpecs = existsSync(activeDir)
        ? readdirSync(activeDir, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name)
        : [];

      const errorData = {
        error: `Spec '${spec}' not found`,
        searchedPath: specDir,
        specsFound: specsExists,
        availableSpecs,
        cwd: process.cwd(),
        projectRoot,
        autoDetected,
        suggestions: specsExists
          ? [`Available specs: ${availableSpecs.join(", ") || "(none)"}`]
          : [
              "Run from project root containing specs/ directory",
              `Use --root flag: spec --root /path/to/project next ${spec}`,
              "Initialize specs: spec init",
            ],
      };

      if (!usePlain) {
        console.log(JSON.stringify(errorData, null, 2));
      } else {
        error(`Spec '${spec}' not found`);
        info(`Searched in: ${specDir}`);
        if (!specsExists) {
          info(`No specs/ directory found at: ${specsDir}`);
          console.log();
          info("Suggestions:");
          info("  - Run from project root containing specs/ directory");
          info(`  - Use --root flag: spec --root /path/to/project next ${spec}`);
          info("  - Initialize specs: spec init");
        }
      }
      process.exit(1);
    }

    const tasksPath = resolve(specDir, "tasks.yaml");
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
        console.log(JSON.stringify({ task: null, allComplete: true, archiveSuggestion: `spec archive ${spec}` }));
      } else {
        console.log("All tasks complete!");
        console.log(`Suggestion: spec archive ${spec}`);
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
