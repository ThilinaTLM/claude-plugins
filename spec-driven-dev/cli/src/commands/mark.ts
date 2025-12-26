import { defineCommand } from "citty";
import { existsSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { getActiveDir } from "../lib/project-root";
import { success, error, info } from "../ui/output";

interface SubtaskYaml {
  text: string;
  done: boolean;
}

interface TaskYaml {
  id: string;
  title: string;
  files?: string[];
  depends?: string[];
  estimate?: string;
  notes?: string;
  parallel?: boolean;
  blocked?: boolean;
  subtasks: SubtaskYaml[];
}

interface PhaseYaml {
  id: number;
  name: string;
  checkpoint?: string;
  tasks: TaskYaml[];
}

interface TasksYaml {
  feature?: string;
  phases: PhaseYaml[];
}

export const markCommand = defineCommand({
  meta: {
    name: "mark",
    description: "Mark a task or subtask as complete",
  },
  args: {
    feature: {
      type: "positional",
      description: "Spec name",
      required: true,
    },
    taskId: {
      type: "positional",
      description: "Task ID (e.g., 2.1)",
      required: true,
    },
    subtask: {
      type: "string",
      description: "Subtask index (0-based). If not specified, marks all subtasks complete",
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
      description: "Minimal output",
    },
  },
  async run({ args }) {
    const spec = args.feature as string;
    const taskId = args.taskId as string;
    const subtaskIndex = args.subtask !== undefined ? parseInt(args.subtask as string, 10) : null;
    const usePlain = args.plain as boolean;
    const quiet = args.quiet as boolean;

    const { activeDir, specsDir, projectRoot, autoDetected } = getActiveDir(args.root as string | undefined);
    const specDir = resolve(activeDir, spec);
    const tasksPath = resolve(specDir, "tasks.yaml");

    // Check if specs directory exists first
    const specsExists = existsSync(specsDir);

    // Validate spec exists
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
              `Use --root flag: spec --root /path/to/project mark ${spec} ${taskId}`,
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
          info(`  - Use --root flag: spec --root /path/to/project mark ${spec} ${taskId}`);
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

    // Validate tasks.yaml exists
    if (!existsSync(tasksPath)) {
      if (!usePlain) {
        console.log(JSON.stringify({ error: "No tasks.yaml found" }));
      } else {
        error("No tasks.yaml found");
      }
      process.exit(1);
    }

    // Parse YAML
    const content = readFileSync(tasksPath, "utf-8");
    const data = parseYaml(content) as TasksYaml;

    if (!data || !data.phases) {
      if (!usePlain) {
        console.log(JSON.stringify({ error: "Invalid tasks.yaml structure" }));
      } else {
        error("Invalid tasks.yaml structure");
      }
      process.exit(1);
    }

    // Find the task
    let foundTask: TaskYaml | null = null;
    for (const phase of data.phases) {
      for (const task of phase.tasks || []) {
        if (String(task.id) === taskId) {
          foundTask = task;
          break;
        }
      }
      if (foundTask) break;
    }

    if (!foundTask) {
      if (!usePlain) {
        console.log(JSON.stringify({ error: `Task '${taskId}' not found` }));
      } else {
        error(`Task '${taskId}' not found`);
      }
      process.exit(1);
    }

    // Mark subtasks as done
    let markedCount = 0;
    if (subtaskIndex !== null) {
      // Mark specific subtask
      if (subtaskIndex < 0 || subtaskIndex >= foundTask.subtasks.length) {
        if (!usePlain) {
          console.log(
            JSON.stringify({
              error: `Subtask index ${subtaskIndex} out of range (0-${foundTask.subtasks.length - 1})`,
            })
          );
        } else {
          error(`Subtask index ${subtaskIndex} out of range (0-${foundTask.subtasks.length - 1})`);
        }
        process.exit(1);
      }
      if (!foundTask.subtasks[subtaskIndex].done) {
        foundTask.subtasks[subtaskIndex].done = true;
        markedCount = 1;
      }
    } else {
      // Mark all subtasks
      for (const subtask of foundTask.subtasks) {
        if (!subtask.done) {
          subtask.done = true;
          markedCount++;
        }
      }
    }

    // Write back to file
    const updatedContent = stringifyYaml(data, { lineWidth: 0 });
    writeFileSync(tasksPath, updatedContent);

    // Check if entire spec is complete (all subtasks in all tasks done)
    const specComplete = data.phases.every((phase: PhaseYaml) =>
      (phase.tasks || []).every((task: TaskYaml) =>
        task.subtasks.every((s: SubtaskYaml) => s.done)
      )
    );

    // Output result
    const result: {
      taskId: string;
      markedCount: number;
      totalSubtasks: number;
      allComplete: boolean;
      specComplete: boolean;
      archiveSuggestion?: string;
    } = {
      taskId,
      markedCount,
      totalSubtasks: foundTask.subtasks.length,
      allComplete: foundTask.subtasks.every((s) => s.done),
      specComplete,
    };
    if (specComplete) {
      result.archiveSuggestion = `spec archive ${spec}`;
    }

    // JSON is default
    if (!usePlain && !quiet) {
      console.log(JSON.stringify(result, null, 2));
    } else if (quiet) {
      if (!usePlain) {
        const quietResult: { markedCount: number; specComplete?: boolean; archiveSuggestion?: string } = { markedCount };
        if (specComplete) {
          quietResult.specComplete = true;
          quietResult.archiveSuggestion = result.archiveSuggestion;
        }
        console.log(JSON.stringify(quietResult));
      } else {
        console.log(markedCount);
        if (specComplete) {
          console.log(`Spec complete! Suggestion: spec archive ${spec}`);
        }
      }
    } else {
      // Plain human-readable output
      if (markedCount === 0) {
        console.log(`Task ${taskId}: Already complete`);
      } else {
        success(`Task ${taskId}: Marked ${markedCount} subtask(s) complete`);
      }
      if (specComplete) {
        console.log();
        success(`All tasks complete!`);
        info(`Suggestion: spec archive ${spec}`);
      }
    }
  },
});
