import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineCommand } from "citty";
import { parseCommonArgs } from "../lib/args";
import { calculateProgressFromCounts } from "../lib/progress";
import { getAvailableSpecs, lookupSpec, outputSpecNotFoundError } from "../lib/spec-lookup";
import { countCheckboxes, getNextTask, parseTasksFile } from "../lib/spec-parser";
import type { Phase, Task } from "../types";
import { info } from "../ui/output";

interface PhaseInfo {
  current: number;
  total: number;
  name: string;
}

function getCurrentPhase(phases: Phase[], currentTask: Task | null): PhaseInfo | null {
  if (phases.length === 0) return null;

  // If we have a current task, use its phase
  if (currentTask) {
    const phase = phases.find((p) => p.number === currentTask.phase);
    return phase
      ? { current: phase.number, total: phases.length, name: phase.name }
      : { current: currentTask.phase, total: phases.length, name: "Unknown" };
  }

  // All complete - return last phase
  const lastPhase = phases[phases.length - 1];
  return { current: lastPhase.number, total: phases.length, name: lastPhase.name };
}

function getNextTaskAfterCurrent(phases: Phase[], currentTask: Task | null): Task | null {
  if (!currentTask) return null;

  let foundCurrent = false;
  for (const phase of phases) {
    for (const task of phase.tasks) {
      if (foundCurrent) {
        const hasIncomplete = task.subtasks.some((s) => !s.completed);
        if (hasIncomplete) return task;
      }
      if (task.id === currentTask.id) {
        foundCurrent = true;
      }
    }
  }
  return null;
}

export const summaryCommand = defineCommand({
  meta: {
    name: "summary",
    description: "Compact spec overview for LLM context priming",
  },
  args: {
    feature: {
      type: "positional",
      description: "Spec name to summarize",
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
      description: "Single line output",
    },
  },
  async run({ args }) {
    const commonArgs = parseCommonArgs(args);
    const { plain: usePlain, quiet } = commonArgs;

    // If no spec specified, list available specs
    if (!args.feature) {
      const specs = getAvailableSpecs(commonArgs.root);

      if (!usePlain) {
        console.log(JSON.stringify({ availableSpecs: specs }));
        return;
      }

      console.log("Usage: spec summary {spec-name}");
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
    const lookup = lookupSpec(spec, commonArgs.root);

    if (!lookup.found) {
      outputSpecNotFoundError(lookup.errorData, usePlain);
    }

    const { specDir } = lookup;

    // Build summary data
    const data: {
      feature: string;
      phase: PhaseInfo | null;
      progress: { percent: number; done: number; total: number } | null;
      currentTask: { id: string; title: string } | null;
      files: string[];
      nextTask: { id: string; title: string } | null;
      allComplete: boolean;
    } = {
      feature: spec,
      phase: null,
      progress: null,
      currentTask: null,
      files: [],
      nextTask: null,
      allComplete: false,
    };

    // Parse tasks.yaml
    const tasksPath = resolve(specDir, "tasks.yaml");
    if (existsSync(tasksPath)) {
      const tasksContent = readFileSync(tasksPath, "utf-8");
      const { total, done } = countCheckboxes(tasksContent);

      if (total > 0) {
        const progress = calculateProgressFromCounts(total, done);
        data.progress = { percent: progress.percent, done: progress.done, total: progress.total };
      }

      const phases = parseTasksFile(tasksPath);
      const currentTask = getNextTask(phases);

      if (currentTask) {
        data.currentTask = { id: currentTask.id, title: currentTask.title };
        data.files = currentTask.files;
        data.phase = getCurrentPhase(phases, currentTask);

        // Get the next task after current
        const nextTask = getNextTaskAfterCurrent(phases, currentTask);
        if (nextTask) {
          data.nextTask = { id: nextTask.id, title: nextTask.title };
        }
      } else {
        data.allComplete = true;
        data.phase = getCurrentPhase(phases, null);
      }
    }

    // Output - JSON is default
    if (!usePlain && !quiet) {
      console.log(JSON.stringify(data, null, 2));
      return;
    }

    // Quiet mode - single line
    if (quiet) {
      const parts: string[] = [spec];

      if (data.phase) {
        parts.push(`Phase ${data.phase.current}/${data.phase.total}`);
      }

      if (data.progress) {
        parts.push(`${data.progress.percent}%`);
      }

      if (data.currentTask) {
        parts.push(`Current: ${data.currentTask.id}`);
      } else if (data.allComplete) {
        parts.push("Complete");
      }

      if (!usePlain) {
        // JSON quiet mode
        console.log(
          JSON.stringify({
            feature: spec,
            phase: data.phase?.current,
            percent: data.progress?.percent ?? 0,
            currentTaskId: data.currentTask?.id ?? null,
            allComplete: data.allComplete,
          }),
        );
      } else {
        console.log(parts.join(" | "));
      }
      return;
    }

    // Plain output - single informative line
    const parts: string[] = [spec];

    if (data.phase) {
      parts.push(`Phase ${data.phase.current}/${data.phase.total}: ${data.phase.name}`);
    }

    if (data.progress) {
      parts.push(`${data.progress.percent}% (${data.progress.done}/${data.progress.total})`);
    }

    if (data.currentTask) {
      parts.push(`Current: ${data.currentTask.id} ${data.currentTask.title}`);
    } else if (data.allComplete) {
      parts.push("All tasks complete");
    }

    if (data.nextTask) {
      parts.push(`Next: ${data.nextTask.id} ${data.nextTask.title}`);
    }

    console.log(parts.join(" | "));

    if (data.files.length > 0) {
      console.log(`Files: ${data.files.join(", ")}`);
    }
  },
});
