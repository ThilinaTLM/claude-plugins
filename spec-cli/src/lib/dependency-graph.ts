/**
 * Dependency graph analysis for tasks.
 * Provides critical path calculation and parallelization opportunities.
 */

import type { Phase, Task } from "../types";

export interface TaskNode {
  id: string;
  title: string;
  phase: number;
  completed: boolean;
  depends: string[];
  blockedBy: string[]; // Incomplete dependencies
}

export interface BlockedTask {
  task: string;
  title: string;
  blockedBy: string[];
  reason: "dependency" | "incomplete_subtasks";
}

export interface PhaseGate {
  phase: number;
  name: string;
  waitingOn: string[];
}

export interface DependencyAnalysis {
  criticalPath: string[];
  blocked: BlockedTask[];
  parallelizable: string[];
  phaseGates: PhaseGate[];
  totalTasks: number;
  completedTasks: number;
}

/**
 * Build a flat map of all tasks with completion status
 */
function buildTaskMap(phases: Phase[]): Map<string, TaskNode> {
  const map = new Map<string, TaskNode>();

  for (const phase of phases) {
    for (const task of phase.tasks) {
      const isComplete = task.subtasks.every((s) => s.completed);
      const incompleteDepends = task.depends.filter((depId) => {
        const depTask = findTaskById(phases, depId);
        return depTask && !depTask.subtasks.every((s) => s.completed);
      });

      map.set(task.id, {
        id: task.id,
        title: task.title,
        phase: task.phase,
        completed: isComplete,
        depends: task.depends,
        blockedBy: incompleteDepends,
      });
    }
  }

  return map;
}

/**
 * Find a task by ID across all phases
 */
function findTaskById(phases: Phase[], id: string): Task | null {
  for (const phase of phases) {
    const task = phase.tasks.find((t) => t.id === id);
    if (task) return task;
  }
  return null;
}

/**
 * Calculate the critical path - longest chain of dependent incomplete tasks
 */
function calculateCriticalPath(taskMap: Map<string, TaskNode>): string[] {
  const incompleteTasks = Array.from(taskMap.values()).filter((t) => !t.completed);

  if (incompleteTasks.length === 0) return [];

  // Find tasks with no incomplete dependencies (entry points)
  const entryPoints = incompleteTasks.filter((t) => t.blockedBy.length === 0);

  if (entryPoints.length === 0) {
    // Circular dependency or all blocked - return first incomplete
    return incompleteTasks.length > 0 ? [incompleteTasks[0].id] : [];
  }

  // DFS to find longest path
  let longestPath: string[] = [];

  function dfs(taskId: string, path: string[], visited: Set<string>): void {
    if (visited.has(taskId)) return;

    const task = taskMap.get(taskId);
    if (!task || task.completed) return;

    visited.add(taskId);
    const newPath = [...path, taskId];

    if (newPath.length > longestPath.length) {
      longestPath = newPath;
    }

    // Find tasks that depend on this one
    for (const [id, t] of taskMap.entries()) {
      if (t.depends.includes(taskId) && !t.completed) {
        dfs(id, newPath, visited);
      }
    }

    visited.delete(taskId);
  }

  for (const entry of entryPoints) {
    dfs(entry.id, [], new Set());
  }

  return longestPath;
}

/**
 * Find tasks that can be worked on in parallel (no incomplete dependencies)
 */
function findParallelizable(taskMap: Map<string, TaskNode>): string[] {
  return Array.from(taskMap.values())
    .filter((t) => !t.completed && t.blockedBy.length === 0)
    .map((t) => t.id);
}

/**
 * Find blocked tasks with reasons
 */
function findBlockedTasks(taskMap: Map<string, TaskNode>): BlockedTask[] {
  const blocked: BlockedTask[] = [];

  for (const task of taskMap.values()) {
    if (task.completed) continue;

    if (task.blockedBy.length > 0) {
      blocked.push({
        task: task.id,
        title: task.title,
        blockedBy: task.blockedBy,
        reason: "dependency",
      });
    }
  }

  return blocked;
}

/**
 * Find phase gates - phases waiting on tasks from previous phases
 */
function findPhaseGates(phases: Phase[], taskMap: Map<string, TaskNode>): PhaseGate[] {
  const gates: PhaseGate[] = [];

  for (let i = 1; i < phases.length; i++) {
    const currentPhase = phases[i];
    const previousPhaseNum = phases[i - 1].number;

    // Find incomplete tasks from previous phase that block current phase
    const waitingOn: string[] = [];
    for (const task of currentPhase.tasks) {
      const node = taskMap.get(task.id);
      if (node) {
        for (const depId of node.blockedBy) {
          const depTask = taskMap.get(depId);
          if (depTask && depTask.phase === previousPhaseNum && !waitingOn.includes(depId)) {
            waitingOn.push(depId);
          }
        }
      }
    }

    if (waitingOn.length > 0) {
      gates.push({
        phase: currentPhase.number,
        name: currentPhase.name,
        waitingOn,
      });
    }
  }

  return gates;
}

/**
 * Analyze task dependencies and return comprehensive analysis
 */
export function analyzeDependencies(phases: Phase[]): DependencyAnalysis {
  const taskMap = buildTaskMap(phases);

  let totalTasks = 0;
  let completedTasks = 0;
  for (const task of taskMap.values()) {
    totalTasks++;
    if (task.completed) completedTasks++;
  }

  return {
    criticalPath: calculateCriticalPath(taskMap),
    blocked: findBlockedTasks(taskMap),
    parallelizable: findParallelizable(taskMap),
    phaseGates: findPhaseGates(phases, taskMap),
    totalTasks,
    completedTasks,
  };
}
