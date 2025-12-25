import { defineCommand } from "citty";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseTasksFile, getNextTask, countCheckboxes } from "../lib/spec-parser";
import { calculateProgressFromCounts } from "../lib/progress";
import { getFeaturesDir } from "../lib/project-root";
import { printHeader, printDivider, info, warn, error } from "../ui/output";

export const resumeCommand = defineCommand({
  meta: {
    name: "resume",
    description: "Show progress and next task for a feature",
  },
  args: {
    feature: {
      type: "positional",
      description: "Feature name to resume",
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
    quiet: {
      type: "boolean",
      alias: "q",
      description: "Minimal output (next task ID + files only)",
    },
  },
  async run({ args }) {
    const usePlain = args.plain as boolean;
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
        console.log(JSON.stringify({
          availableFeatures: features,
          specsDir,
          projectRoot,
          autoDetected,
        }));
        return;
      }

      console.log("Usage: spec resume {feature-name}");
      console.log();
      console.log("Available features:");
      if (features.length === 0) {
        info("(none)");
      } else {
        for (const f of features) {
          info(`  ${f}`);
        }
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
              `Use --root flag: spec --root /path/to/project resume ${feature}`,
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
          info(`  • Use --root flag: spec --root /path/to/project resume ${feature}`);
          info("  • Initialize specs: spec init");
        } else {
          console.log();
          console.log("Available features:");
          for (const f of availableFeatures) {
            info(`  ${f}`);
          }
        }
      }
      process.exit(1);
    }

    // Build data structure
    const data: {
      feature: string;
      progress: { done: number; total: number; remaining: number; percent: number } | null;
      nextTask: {
        id: string;
        title: string;
        files: string[];
        depends: string[];
        subtasks: { text: string; completed: boolean }[];
      } | null;
      checkpoint: { content: string; date: string | null } | null;
      specFiles: string[];
    } = {
      feature,
      progress: null,
      nextTask: null,
      checkpoint: null,
      specFiles: [],
    };

    // Get checkpoint
    const checkpointPath = resolve(featureDir, "checkpoint.md");
    if (existsSync(checkpointPath)) {
      const content = readFileSync(checkpointPath, "utf-8");
      const dateMatch = content.match(/\d{4}-\d{2}-\d{2}/);
      data.checkpoint = {
        content,
        date: dateMatch ? dateMatch[0] : null,
      };
    }

    // Parse tasks.yaml for progress
    const tasksPath = resolve(featureDir, "tasks.yaml");
    if (existsSync(tasksPath)) {
      const tasksContent = readFileSync(tasksPath, "utf-8");
      const { total, done } = countCheckboxes(tasksContent);
      if (total > 0) {
        const progress = calculateProgressFromCounts(total, done);
        data.progress = progress;
      }

      const phases = parseTasksFile(tasksPath);
      const nextTask = getNextTask(phases);
      if (nextTask) {
        data.nextTask = {
          id: nextTask.id,
          title: nextTask.title,
          files: nextTask.files,
          depends: nextTask.depends,
          subtasks: nextTask.subtasks,
        };
      }
    }

    // List spec files
    data.specFiles = readdirSync(featureDir).filter(
      (f) => f.endsWith(".md") || f.endsWith(".yaml")
    );

    // Output - JSON is default
    if (!usePlain && !quiet) {
      console.log(JSON.stringify(data, null, 2));
      return;
    }

    // Quiet mode - minimal output
    if (quiet) {
      if (!usePlain) {
        // JSON quiet mode
        console.log(JSON.stringify({
          nextTask: data.nextTask ? { id: data.nextTask.id, title: data.nextTask.title, files: data.nextTask.files } : null,
          allComplete: !data.nextTask,
        }));
      } else {
        if (data.nextTask) {
          console.log(`${data.nextTask.id}: ${data.nextTask.title}`);
          if (data.nextTask.files.length > 0) {
            console.log(`Files: ${data.nextTask.files.join(", ")}`);
          }
        } else {
          console.log("All tasks complete");
        }
      }
      return;
    }

    // Human-readable output (--plain flag)
    printHeader(`RESUME: ${feature}`);

    if (data.checkpoint) {
      printDivider("LAST SESSION");
      console.log(data.checkpoint.content);
    }

    printDivider("PROGRESS");
    if (data.progress) {
      info(`Tasks: ${data.progress.done}/${data.progress.total} complete (${data.progress.percent}%)`);
      info(`Remaining: ${data.progress.remaining} tasks`);
    } else {
      warn("No tasks found");
    }

    printDivider("NEXT TASK");
    if (data.nextTask) {
      console.log(`  ### ${data.nextTask.id} ${data.nextTask.title}`);
      if (data.nextTask.files.length > 0) {
        console.log(`  Files: ${data.nextTask.files.join(", ")}`);
      }
      if (data.nextTask.depends.length > 0) {
        console.log(`  Depends: ${data.nextTask.depends.join(", ")}`);
      }
      console.log();
      console.log("  Subtasks:");
      for (const subtask of data.nextTask.subtasks) {
        const check = subtask.completed ? "[x]" : "[ ]";
        console.log(`    - ${check} ${subtask.text}`);
      }
    } else {
      info("All tasks complete!");
    }

    printDivider("SPEC FILES");
    for (const f of data.specFiles) {
      info(`${f}`);
    }

    console.log();
    console.log("═".repeat(60));
    console.log("To continue: Read tasks.yaml and implement the next task");
    console.log("═".repeat(60));
  },
});
