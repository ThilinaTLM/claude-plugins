/**
 * Diff mode utilities for tracking changes since a checkpoint.
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Phase, Task } from "../types";

export interface DiffResult {
  since: string;
  hasBaseline: boolean;
  completed: string[]; // Task IDs completed since checkpoint
  inProgress: string[]; // Tasks currently in progress
  progressDelta: {
    from: number;
    to: number;
    delta: string;
  } | null;
  filesModified: string[]; // Files from completed tasks
}

/**
 * Parse the "since" argument into a date string.
 * Supports: "last" (most recent checkpoint), or ISO date "2024-12-25"
 */
export function parseSinceArg(sinceArg: string, specDir: string): string | null {
  if (sinceArg === "last" || sinceArg === "latest") {
    // Read checkpoint.md to find last date
    const checkpointPath = resolve(specDir, "checkpoint.md");
    if (existsSync(checkpointPath)) {
      const content = readFileSync(checkpointPath, "utf-8");
      const dateMatch = content.match(/\d{4}-\d{2}-\d{2}/);
      if (dateMatch) return dateMatch[0];
    }
    return null;
  }

  // Validate ISO date format
  if (/^\d{4}-\d{2}-\d{2}$/.test(sinceArg)) {
    return sinceArg;
  }

  return null;
}

/**
 * Extract completed task IDs from checkpoint content.
 * Looks for patterns like "Completed: 1.1, 1.2" or "- [x] Task 1.1"
 */
function extractCompletedFromCheckpoint(content: string): Set<string> {
  const completed = new Set<string>();

  // Match task IDs like 1.1, 2.3, etc.
  const taskIdPattern = /\b(\d+\.\d+)\b/g;

  // Look for completed sections
  const completedSection = content.match(/completed|done|finished/i);
  if (completedSection) {
    // Find all task IDs after "completed" marker
    const afterCompleted = content.slice(completedSection.index);
    const matches = afterCompleted.matchAll(taskIdPattern);
    for (const m of matches) {
      completed.add(m[1]);
    }
  }

  // Also look for checked items with task IDs
  const checkedLines = content.match(/\[x\].*?\b(\d+\.\d+)\b/gi) || [];
  for (const line of checkedLines) {
    const idMatch = line.match(/\b(\d+\.\d+)\b/);
    if (idMatch) completed.add(idMatch[1]);
  }

  return completed;
}

/**
 * Calculate diff between current state and a baseline checkpoint.
 */
export function calculateDiff(
  phases: Phase[],
  specDir: string,
  sinceDate: string,
  currentProgress: { done: number; total: number; percent: number } | null,
): DiffResult {
  const result: DiffResult = {
    since: sinceDate,
    hasBaseline: false,
    completed: [],
    inProgress: [],
    progressDelta: null,
    filesModified: [],
  };

  // Try to read checkpoint for baseline
  const checkpointPath = resolve(specDir, "checkpoint.md");
  let baselineCompleted = new Set<string>();
  let baselinePercent = 0;

  if (existsSync(checkpointPath)) {
    const content = readFileSync(checkpointPath, "utf-8");

    // Check if checkpoint contains our target date
    if (content.includes(sinceDate)) {
      result.hasBaseline = true;
      baselineCompleted = extractCompletedFromCheckpoint(content);

      // Try to extract baseline progress
      const progressMatch = content.match(/(\d+)%/);
      if (progressMatch) {
        baselinePercent = Number.parseInt(progressMatch[1], 10);
      }
    }
  }

  // Analyze current state
  const currentCompleted = new Set<string>();
  const currentInProgress: string[] = [];
  const filesFromCompleted: string[] = [];

  for (const phase of phases) {
    for (const task of phase.tasks) {
      const isComplete = task.subtasks.every((s) => s.completed);
      const hasProgress = task.subtasks.some((s) => s.completed);

      if (isComplete) {
        currentCompleted.add(task.id);
        // If not in baseline, it was completed since then
        if (!baselineCompleted.has(task.id)) {
          result.completed.push(task.id);
          filesFromCompleted.push(...task.files);
        }
      } else if (hasProgress) {
        currentInProgress.push(task.id);
      }
    }
  }

  result.inProgress = currentInProgress;
  result.filesModified = [...new Set(filesFromCompleted)]; // Dedupe

  // Calculate progress delta
  if (currentProgress && result.hasBaseline) {
    const delta = currentProgress.percent - baselinePercent;
    result.progressDelta = {
      from: baselinePercent,
      to: currentProgress.percent,
      delta: delta >= 0 ? `+${delta}%` : `${delta}%`,
    };
  }

  return result;
}
