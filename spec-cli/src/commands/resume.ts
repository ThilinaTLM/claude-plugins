import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { defineCommand } from "citty";
import { type ContextLevel, parseContextArgs } from "../lib/args";
import { parseCheckpoint } from "../lib/checkpoint-parser";
import { calculateDiff, parseSinceArg } from "../lib/diff";
import { calculateProgressFromCounts } from "../lib/progress";
import { getActiveDir } from "../lib/project-root";
import { getAvailableSpecs, lookupSpec, outputSpecNotFoundError } from "../lib/spec-lookup";
import { countCheckboxes, getNextTask, parseTasksFile } from "../lib/spec-parser";
import { info, printDivider, printHeader, warn } from "../ui/output";

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
    context: {
      type: "string",
      alias: "c",
      description: "Context level: min (task only), standard (default), full (with all phases)",
    },
    since: {
      type: "string",
      description: "Show diff since date (YYYY-MM-DD) or 'last' for most recent checkpoint",
    },
  },
  async run({ args }) {
    const contextArgs = parseContextArgs(args);
    const { plain: usePlain, quiet, context, since } = contextArgs;
    const { specsDir, projectRoot, autoDetected } = getActiveDir(contextArgs.root);

    // If no spec specified, list available specs
    if (!args.feature) {
      const specs = getAvailableSpecs(contextArgs.root);

      if (!usePlain) {
        console.log(
          JSON.stringify({
            availableSpecs: specs,
            specsDir,
            projectRoot,
            autoDetected,
          }),
        );
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
    const lookup = lookupSpec(spec, contextArgs.root);

    if (!lookup.found) {
      outputSpecNotFoundError(lookup.errorData, usePlain);
    }

    const { specDir } = lookup;

    // Parse tasks first for all modes
    const tasksPath = resolve(specDir, "tasks.yaml");
    let phases: ReturnType<typeof parseTasksFile> = [];
    let progress: { done: number; total: number; remaining: number; percent: number } | null = null;

    if (existsSync(tasksPath)) {
      const tasksContent = readFileSync(tasksPath, "utf-8");
      const { total, done } = countCheckboxes(tasksContent);
      if (total > 0) {
        progress = calculateProgressFromCounts(total, done);
      }
      phases = parseTasksFile(tasksPath);
    }

    const nextTask = getNextTask(phases);
    const allComplete = !nextTask;

    // Handle --since (diff mode)
    if (since) {
      const sinceDate = parseSinceArg(since, specDir);
      if (!sinceDate) {
        const errorData = {
          error: "Invalid --since value",
          provided: since,
          expected: "YYYY-MM-DD or 'last'",
        };
        if (!usePlain) {
          console.log(JSON.stringify(errorData, null, 2));
        } else {
          console.error(`Invalid --since value: ${since}. Expected YYYY-MM-DD or 'last'`);
        }
        process.exit(1);
      }

      const diff = calculateDiff(phases, specDir, sinceDate, progress);

      if (!usePlain) {
        console.log(JSON.stringify({ spec, ...diff }, null, 2));
      } else {
        printHeader(`CHANGES SINCE: ${sinceDate}`);
        if (diff.completed.length > 0) {
          info(`Completed: ${diff.completed.join(", ")}`);
        }
        if (diff.inProgress.length > 0) {
          info(`In progress: ${diff.inProgress.join(", ")}`);
        }
        if (diff.progressDelta) {
          info(
            `Progress: ${diff.progressDelta.from}% → ${diff.progressDelta.to}% (${diff.progressDelta.delta})`,
          );
        }
        if (diff.filesModified.length > 0) {
          info(`Files: ${diff.filesModified.join(", ")}`);
        }
      }
      return;
    }

    // Build data structure based on context level
    type TaskData = {
      id: string;
      title: string;
      files: string[];
      depends: string[];
      subtasks: { text: string; completed: boolean; type: string }[];
      notes?: string;
    };

    const data: {
      spec: string;
      context: ContextLevel;
      progress: typeof progress;
      nextTask: TaskData | null;
      checkpoint: {
        date: string | null;
        summary: string | null;
        accomplished: string[];
        blockers: string[];
        nextSteps: string[];
      } | null;
      phases?: { number: number; name: string; taskCount: number }[];
      specFiles: string[];
      allComplete: boolean;
      archiveSuggestion?: string;
    } = {
      spec,
      context,
      progress,
      nextTask: null,
      checkpoint: null,
      specFiles: [],
      allComplete,
    };

    // Get checkpoint (structured parsing)
    const checkpointPath = resolve(specDir, "checkpoint.md");
    if (existsSync(checkpointPath) && context !== "min") {
      const content = readFileSync(checkpointPath, "utf-8");
      const parsed = parseCheckpoint(content);
      data.checkpoint = {
        date: parsed.date,
        summary: parsed.summary,
        accomplished: parsed.accomplished,
        blockers: parsed.blockers,
        nextSteps: parsed.nextSteps,
      };
    }

    // Add next task
    if (nextTask) {
      data.nextTask = {
        id: nextTask.id,
        title: nextTask.title,
        files: nextTask.files,
        depends: context === "min" ? [] : nextTask.depends,
        subtasks:
          context === "min"
            ? []
            : nextTask.subtasks.map((s) => ({
                text: s.text,
                completed: s.completed,
                type: s.type,
              })),
      };
      if (context === "full" && nextTask.notes) {
        data.nextTask.notes = nextTask.notes;
      }
    } else {
      data.archiveSuggestion = `spec archive ${spec}`;
    }

    // Add phases for full context
    if (context === "full") {
      data.phases = phases.map((p) => ({
        number: p.number,
        name: p.name,
        taskCount: p.tasks.length,
      }));
    }

    // List spec files (except for min context)
    if (context !== "min") {
      data.specFiles = readdirSync(specDir).filter((f) => f.endsWith(".md") || f.endsWith(".yaml"));
    }

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
          nextTask: data.nextTask
            ? { id: data.nextTask.id, title: data.nextTask.title, files: data.nextTask.files }
            : null,
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
      if (data.checkpoint.summary) {
        info(data.checkpoint.summary);
      }
      if (data.checkpoint.accomplished.length > 0) {
        console.log("  Accomplished:");
        for (const item of data.checkpoint.accomplished) {
          console.log(`    ✓ ${item}`);
        }
      }
      if (data.checkpoint.blockers.length > 0) {
        console.log("  Blockers:");
        for (const item of data.checkpoint.blockers) {
          console.log(`    ⚠ ${item}`);
        }
      }
    }

    printDivider("PROGRESS");
    if (data.progress) {
      info(
        `Tasks: ${data.progress.done}/${data.progress.total} complete (${data.progress.percent}%)`,
      );
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
      if (data.nextTask.subtasks.length > 0) {
        console.log();
        console.log("  Subtasks:");
        for (const subtask of data.nextTask.subtasks) {
          const check = subtask.completed ? "[x]" : "[ ]";
          const typeTag = subtask.type !== "impl" ? ` [${subtask.type}]` : "";
          console.log(`    - ${check} ${subtask.text}${typeTag}`);
        }
      }
    } else {
      info("All tasks complete!");
      info(`Suggestion: ${data.archiveSuggestion}`);
    }

    if (data.specFiles.length > 0) {
      printDivider("SPEC FILES");
      for (const f of data.specFiles) {
        info(`${f}`);
      }
    }

    if (context === "full" && data.phases) {
      printDivider("ALL PHASES");
      for (const phase of data.phases) {
        console.log(`  Phase ${phase.number}: ${phase.name} (${phase.taskCount} tasks)`);
      }
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
