import { defineCommand } from "citty";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseTasksFile, getNextTask, countCheckboxes } from "../lib/spec-parser";
import { calculateProgressFromCounts } from "../lib/progress";
import { getActiveDir } from "../lib/project-root";
import { printHeader, printDivider, info, warn, error } from "../ui/output";

export const resumeCommand = defineCommand({
  meta: {
    name: "resume",
    description: "Show progress and next task for a feature",
  },
  args: {
    feature: {
      type: "positional",
      description: "Spec name to resume",
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
        console.log(JSON.stringify({
          availableSpecs: specs,
          specsDir,
          projectRoot,
          autoDetected,
        }));
        return;
      }

      console.log("Usage: spec resume {spec-name}");
      console.log();
      console.log("Available specs:");
      if (specs.length === 0) {
        info("(none)");
      } else {
        for (const s of specs) {
          info(`  ${s}`);
        }
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
              "Run from project root containing .specs/ directory",
              `Use --root flag: spec --root /path/to/project resume ${spec}`,
              "Initialize specs: spec init",
            ],
      };

      if (!usePlain) {
        console.log(JSON.stringify(errorData, null, 2));
      } else {
        error(`Spec '${spec}' not found`);
        info(`Searched in: ${specDir}`);
        if (!specsExists) {
          info(`No .specs/ directory found at: ${specsDir}`);
          console.log();
          info("Suggestions:");
          info("  - Run from project root containing .specs/ directory");
          info(`  - Use --root flag: spec --root /path/to/project resume ${spec}`);
          info("  - Initialize specs: spec init");
        } else {
          console.log();
          console.log("Available specs:");
          for (const s of availableSpecs) {
            info(`  ${s}`);
          }
        }
      }
      process.exit(1);
    }

    // Build data structure
    const data: {
      spec: string;
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
      allComplete: boolean;
      archiveSuggestion?: string;
    } = {
      spec,
      progress: null,
      nextTask: null,
      checkpoint: null,
      specFiles: [],
      allComplete: false,
    };

    // Get checkpoint
    const checkpointPath = resolve(specDir, "checkpoint.md");
    if (existsSync(checkpointPath)) {
      const content = readFileSync(checkpointPath, "utf-8");
      const dateMatch = content.match(/\d{4}-\d{2}-\d{2}/);
      data.checkpoint = {
        content,
        date: dateMatch ? dateMatch[0] : null,
      };
    }

    // Parse tasks.yaml for progress
    const tasksPath = resolve(specDir, "tasks.yaml");
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
      } else {
        data.allComplete = true;
        data.archiveSuggestion = `spec archive ${spec}`;
      }
    }

    // List spec files
    data.specFiles = readdirSync(specDir).filter(
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
        const quietData: {
          nextTask: { id: string; title: string; files: string[] } | null;
          allComplete: boolean;
          archiveSuggestion?: string;
        } = {
          nextTask: data.nextTask ? { id: data.nextTask.id, title: data.nextTask.title, files: data.nextTask.files } : null,
          allComplete: data.allComplete,
        };
        if (data.allComplete) {
          quietData.archiveSuggestion = data.archiveSuggestion;
        }
        console.log(JSON.stringify(quietData));
      } else {
        if (data.nextTask) {
          console.log(`${data.nextTask.id}: ${data.nextTask.title}`);
          if (data.nextTask.files.length > 0) {
            console.log(`Files: ${data.nextTask.files.join(", ")}`);
          }
        } else {
          console.log("All tasks complete");
          console.log(`Suggestion: ${data.archiveSuggestion}`);
        }
      }
      return;
    }

    // Human-readable output (--plain flag)
    printHeader(`RESUME: ${spec}`);

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
      info(`Suggestion: ${data.archiveSuggestion}`);
    }

    printDivider("SPEC FILES");
    for (const f of data.specFiles) {
      info(`${f}`);
    }

    console.log();
    console.log("═".repeat(60));
    if (data.allComplete) {
      console.log(`Ready to archive: ${data.archiveSuggestion}`);
    } else {
      console.log("To continue: Read tasks.yaml and implement the next task");
    }
    console.log("═".repeat(60));
  },
});
