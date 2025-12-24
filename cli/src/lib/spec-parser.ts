import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import type { Task, Subtask, TaskFlags, Phase } from "../types";

/**
 * Raw YAML structure for tasks.yaml
 */
interface TasksYaml {
  feature?: string;
  phases: PhaseYaml[];
}

interface PhaseYaml {
  id: number;
  name: string;
  checkpoint?: string;
  tasks: TaskYaml[];
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

interface SubtaskYaml {
  text: string;
  done: boolean;
}

/**
 * Parse a tasks.yaml file and extract task information
 */
export function parseTasksFile(path: string): Phase[] {
  const content = readFileSync(path, "utf-8");
  return parseTasksContent(content);
}

/**
 * Parse YAML content and convert to Phase[] structure
 */
export function parseTasksContent(content: string): Phase[] {
  const data = parseYaml(content) as TasksYaml;

  if (!data || !data.phases) {
    return [];
  }

  return data.phases.map((phase) => ({
    number: phase.id,
    name: phase.name,
    tasks: (phase.tasks || []).map((task) => convertTask(task, phase.id)),
  }));
}

/**
 * Convert YAML task to Task type
 */
function convertTask(task: TaskYaml, phaseNumber: number): Task {
  const flags: TaskFlags = {
    parallel: task.parallel || false,
    blocked: task.blocked || false,
  };

  return {
    id: String(task.id),
    title: task.title,
    phase: phaseNumber,
    files: task.files || [],
    depends: task.depends || [],
    subtasks: (task.subtasks || []).map(
      (s): Subtask => ({
        text: s.text,
        completed: s.done,
      })
    ),
    estimate: task.estimate,
    notes: task.notes,
    flags,
  };
}

/**
 * Find the next incomplete task
 */
export function getNextTask(phases: Phase[]): Task | null {
  for (const phase of phases) {
    for (const task of phase.tasks) {
      const hasIncomplete = task.subtasks.some((s) => !s.completed);
      if (hasIncomplete) {
        return task;
      }
    }
  }
  return null;
}

/**
 * Count all subtasks in a tasks.yaml file content
 */
export function countCheckboxes(content: string): { total: number; done: number } {
  const data = parseYaml(content) as TasksYaml;

  if (!data || !data.phases) {
    return { total: 0, done: 0 };
  }

  let total = 0;
  let done = 0;

  for (const phase of data.phases) {
    for (const task of phase.tasks || []) {
      for (const subtask of task.subtasks || []) {
        total++;
        if (subtask.done) {
          done++;
        }
      }
    }
  }

  return { total, done };
}
