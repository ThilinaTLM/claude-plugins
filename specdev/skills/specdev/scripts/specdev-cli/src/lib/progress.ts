import type { Phase, TaskProgress } from "../types";

/**
 * Calculate progress from parsed phases
 */
export function calculateProgress(phases: Phase[]): TaskProgress {
  let total = 0;
  let done = 0;

  for (const phase of phases) {
    for (const task of phase.tasks) {
      for (const subtask of task.subtasks) {
        total++;
        if (subtask.completed) {
          done++;
        }
      }
    }
  }

  return {
    total,
    done,
    remaining: total - done,
    percent: total > 0 ? Math.round((done / total) * 100) : 0,
  };
}

/**
 * Calculate progress from raw checkbox counts
 */
export function calculateProgressFromCounts(total: number, done: number): TaskProgress {
  return {
    total,
    done,
    remaining: total - done,
    percent: total > 0 ? Math.round((done / total) * 100) : 0,
  };
}
