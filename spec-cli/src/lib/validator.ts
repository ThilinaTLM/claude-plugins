import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import {
  type PhaseYaml,
  type TasksYaml,
  type ValidationResult,
  addError,
  addInfo,
  addWarning,
  createValidationResult,
} from "../types";

/**
 * Validate spec.md structure
 */
export function validateSpecMd(path: string, result: ValidationResult): void {
  if (!existsSync(path)) {
    addError(result, "Missing required file: spec.md", path);
    return;
  }

  const content = readFileSync(path, "utf-8");

  // Check for required sections
  const requiredSections: [RegExp, string][] = [
    [/^#+\s*.*Purpose/im, "Purpose section"],
    [/^#+\s*.*User Stor/im, "User Stories section"],
    [/^#+\s*.*Requirement/im, "Requirements section"],
  ];

  for (const [pattern, name] of requiredSections) {
    if (!pattern.test(content)) {
      addWarning(result, `spec.md missing ${name}`, path);
    }
  }

  // Check for acceptance criteria
  if (!content.includes("Acceptance Criteria") && !content.includes("AC:")) {
    addWarning(result, "spec.md has no acceptance criteria", path);
  }

  // Check for SHALL/MUST requirements
  if (!/\b(SHALL|MUST)\b/.test(content)) {
    addWarning(result, "spec.md has no formal requirements (SHALL/MUST)", path);
  }

  // Check for Out of Scope
  if (!content.includes("Out of Scope") && !content.includes("OUT:")) {
    addInfo(result, "Consider adding 'Out of Scope' section", path);
  }

  const wordCount = content.split(/\s+/).length;
  addInfo(result, `spec.md: ${wordCount} words`, path);
}

/**
 * Validate tasks.yaml structure and return task IDs
 */
export function validateTasksYaml(path: string, result: ValidationResult): string[] {
  if (!existsSync(path)) {
    addWarning(result, "Missing tasks.yaml - needed for implementation", path);
    return [];
  }

  const content = readFileSync(path, "utf-8");
  const taskIds: string[] = [];

  let data: TasksYaml;
  try {
    data = parseYaml(content) as TasksYaml;
  } catch (e) {
    addError(result, `Invalid YAML syntax: ${(e as Error).message}`, path);
    return [];
  }

  if (!data || !data.phases || !Array.isArray(data.phases)) {
    addError(result, "tasks.yaml must have a 'phases' array", path);
    return [];
  }

  let totalSubtasks = 0;
  let doneSubtasks = 0;
  let hasFiles = false;

  for (let i = 0; i < data.phases.length; i++) {
    const phase = data.phases[i];

    if (phase.id === undefined) {
      addError(result, `Phase ${i + 1} missing 'id' field`, path);
    }

    if (!phase.name) {
      addWarning(result, `Phase ${phase.id || i + 1} missing 'name' field`, path);
    }

    if (!phase.tasks || !Array.isArray(phase.tasks)) {
      addWarning(result, `Phase ${phase.id || i + 1} has no tasks`, path);
      continue;
    }

    for (const task of phase.tasks) {
      if (!task.id) {
        addError(result, `Task in phase ${phase.id || i + 1} missing 'id' field`, path);
        continue;
      }

      taskIds.push(String(task.id));

      if (!task.title) {
        addWarning(result, `Task ${task.id} missing 'title' field`, path);
      }

      if (task.files && task.files.length > 0) {
        hasFiles = true;
      }

      if (task.subtasks && Array.isArray(task.subtasks)) {
        for (const subtask of task.subtasks) {
          totalSubtasks++;
          if (subtask.done) {
            doneSubtasks++;
          }
          if (!subtask.text) {
            addWarning(result, `Task ${task.id} has subtask without 'text' field`, path);
          }
        }
      }

      // Validate dependencies reference existing tasks
      if (task.depends && Array.isArray(task.depends)) {
        for (const dep of task.depends) {
          // We'll validate after collecting all task IDs
        }
      }
    }
  }

  if (taskIds.length === 0) {
    addError(result, "tasks.yaml has no valid tasks", path);
    return [];
  }

  addInfo(result, `tasks.yaml: ${taskIds.length} tasks found`, path);

  if (totalSubtasks === 0) {
    addWarning(result, "tasks.yaml has no subtasks for tracking", path);
  } else {
    const pct = Math.round((doneSubtasks / totalSubtasks) * 100);
    addInfo(result, `Progress: ${doneSubtasks}/${totalSubtasks} subtasks done (${pct}%)`, path);
  }

  if (!hasFiles) {
    addWarning(result, "tasks.yaml tasks should specify 'files' for context loading", path);
  }

  // Second pass: validate dependencies
  for (const phase of data.phases) {
    for (const task of phase.tasks || []) {
      if (task.depends && Array.isArray(task.depends)) {
        for (const dep of task.depends) {
          if (!taskIds.includes(String(dep))) {
            addError(result, `Task ${task.id} has invalid dependency: ${dep} not found`, path);
          }
        }
      }
    }
  }

  return taskIds;
}

/**
 * Validate plan.md structure
 */
export function validatePlanMd(path: string, result: ValidationResult): void {
  if (!existsSync(path)) {
    addInfo(result, "No plan.md - optional but recommended for complex features", path);
    return;
  }

  const content = readFileSync(path, "utf-8");

  // Check for recommended sections
  const recommendedSections: [RegExp, string][] = [
    [/^#+\s*.*Technical/im, "Technical Approach"],
    [/^#+\s*.*(Stack|Dependenc)/im, "Tech Stack/Dependencies"],
    [/^#+\s*.*Phase/im, "Implementation Phases"],
  ];

  for (const [pattern, name] of recommendedSections) {
    if (!pattern.test(content)) {
      addInfo(result, `plan.md could include: ${name}`, path);
    }
  }

  const wordCount = content.split(/\s+/).length;
  addInfo(result, `plan.md: ${wordCount} words`, path);
}

/**
 * Cross-file consistency checks
 */
export function validateConsistency(specDir: string, result: ValidationResult): void {
  const specPath = resolve(specDir, "spec.md");
  const tasksPath = resolve(specDir, "tasks.yaml");

  if (!existsSync(specPath) || !existsSync(tasksPath)) {
    return;
  }

  const specContent = readFileSync(specPath, "utf-8");

  // Extract user story IDs from spec
  const specStories = new Set(specContent.match(/US-(\d+)/g) || []);

  // For YAML, we'd need to check if tasks reference user stories
  // This is a simplified check - could be enhanced
  if (specStories.size > 0) {
    addInfo(result, `${specStories.size} user stories defined in spec.md`, specDir);
  }
}

/**
 * Validate a complete feature specification
 */
export function validateFeature(specDir: string): ValidationResult {
  const result = createValidationResult();

  if (!existsSync(specDir)) {
    addError(result, `Spec directory not found: ${specDir}`);
    return result;
  }

  if (!statSync(specDir).isDirectory()) {
    addError(result, `Not a directory: ${specDir}`);
    return result;
  }

  // Check required files
  validateSpecMd(resolve(specDir, "spec.md"), result);
  validateTasksYaml(resolve(specDir, "tasks.yaml"), result);
  validatePlanMd(resolve(specDir, "plan.md"), result);

  // Cross-file validation
  validateConsistency(specDir, result);

  // Check for optional files
  const optionalFiles = ["design.md", "checkpoint.md"];
  const existingOptional = optionalFiles.filter((f) => existsSync(resolve(specDir, f)));
  if (existingOptional.length > 0) {
    addInfo(result, `Additional files: ${existingOptional.join(", ")}`, specDir);
  }

  return result;
}
