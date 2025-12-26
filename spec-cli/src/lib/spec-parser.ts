import { readFileSync } from "node:fs";
import type {
  Phase,
  PhaseYaml,
  Subtask,
  SubtaskType,
  Task,
  TaskFlags,
  TaskYaml,
  TasksYaml,
} from "../types";
import { parseYamlSafe } from "./safe-io";

/**
 * Infer subtask type from text patterns
 */
export function inferSubtaskType(text: string): SubtaskType {
  const lower = text.toLowerCase();

  // Test patterns
  if (/^(test|tests|testing|verify|validate|spec)[:.\s-]/i.test(text)) return "test";
  if (lower.includes("write test") || lower.includes("add test") || lower.includes("unit test"))
    return "test";

  // Doc patterns
  if (/^(doc|docs|document|documentation|readme)[:.\s-]/i.test(text)) return "doc";
  if (lower.includes("write doc") || lower.includes("add doc") || lower.includes("update readme"))
    return "doc";

  // Review patterns
  if (/^(review|code review|pr|pull request)[:.\s-]/i.test(text)) return "review";

  // Refactor patterns
  if (/^(refactor|cleanup|clean up|reorganize)[:.\s-]/i.test(text)) return "refactor";
  if (lower.includes("refactor") || lower.includes("clean up")) return "refactor";

  return "impl";
}

/**
 * Parse a tasks.yaml file and extract task information
 */
export function parseTasksFile(path: string): Phase[] {
  const content = readFileSync(path, "utf-8");
  return parseTasksContent(content);
}

/**
 * Parse YAML content and convert to Phase[] structure.
 * Returns empty array for invalid YAML (graceful degradation).
 */
export function parseTasksContent(content: string): Phase[] {
  const result = parseYamlSafe<TasksYaml>(content);

  if (!result.ok || !result.value || !result.value.phases) {
    return [];
  }

  const data = result.value;
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
        type: inferSubtaskType(s.text || ""),
      }),
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
 * Count all subtasks in a tasks.yaml file content.
 * Returns zeros for invalid YAML (graceful degradation).
 */
export function countCheckboxes(content: string): { total: number; done: number } {
  const result = parseYamlSafe<TasksYaml>(content);

  if (!result.ok || !result.value || !result.value.phases) {
    return { total: 0, done: 0 };
  }

  const data = result.value;
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
