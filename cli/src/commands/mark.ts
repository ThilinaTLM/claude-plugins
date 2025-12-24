import { defineCommand } from "citty";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { success, error } from "../ui/output";

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
      description: "Feature name",
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
      required: false,
    },
    json: {
      type: "boolean",
      description: "Output as JSON",
      required: false,
    },
    quiet: {
      type: "boolean",
      alias: "q",
      description: "Minimal output",
      required: false,
    },
  },
  async run({ args }) {
    const feature = args.feature as string;
    const taskId = args.taskId as string;
    const subtaskIndex = args.subtask !== undefined ? parseInt(args.subtask as string, 10) : null;
    const useJson = args.json as boolean;
    const quiet = args.quiet as boolean;

    const featuresDir = resolve(process.cwd(), "specs/features");
    const featureDir = resolve(featuresDir, feature);
    const tasksPath = resolve(featureDir, "tasks.yaml");

    // Validate feature exists
    if (!existsSync(featureDir)) {
      if (useJson) {
        console.log(JSON.stringify({ error: `Feature '${feature}' not found` }));
      } else {
        error(`Feature '${feature}' not found`);
      }
      process.exit(1);
    }

    // Validate tasks.yaml exists
    if (!existsSync(tasksPath)) {
      if (useJson) {
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
      if (useJson) {
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
      if (useJson) {
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
        if (useJson) {
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

    // Output result
    const result = {
      taskId,
      markedCount,
      totalSubtasks: foundTask.subtasks.length,
      allComplete: foundTask.subtasks.every((s) => s.done),
    };

    if (useJson) {
      console.log(JSON.stringify(result, null, 2));
    } else if (quiet) {
      console.log(markedCount);
    } else {
      if (markedCount === 0) {
        console.log(`Task ${taskId}: Already complete`);
      } else {
        success(`Task ${taskId}: Marked ${markedCount} subtask(s) complete`);
      }
    }
  },
});
