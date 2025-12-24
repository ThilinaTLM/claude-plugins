// Task types
export interface Task {
  id: string; // e.g., "1.1", "2.3"
  title: string;
  phase: number;
  files: string[];
  depends: string[];
  subtasks: Subtask[];
  notes?: string;
  estimate?: string;
  flags: TaskFlags;
}

export interface Subtask {
  text: string;
  completed: boolean;
}

export interface TaskFlags {
  parallel: boolean;
  blocked: boolean;
}

export interface TaskProgress {
  total: number;
  done: number;
  remaining: number;
  percent: number;
}

export interface Phase {
  number: number;
  name: string;
  tasks: Task[];
}

// Validation types
export type ValidationSeverity = "error" | "warning" | "info";

export interface ValidationMessage {
  severity: ValidationSeverity;
  message: string;
  file?: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: ValidationMessage[];
  warnings: ValidationMessage[];
  info: ValidationMessage[];
}

export function createValidationResult(): ValidationResult {
  return {
    ok: true,
    errors: [],
    warnings: [],
    info: [],
  };
}

export function addError(result: ValidationResult, message: string, file?: string): void {
  result.ok = false;
  result.errors.push({ severity: "error", message, file });
}

export function addWarning(result: ValidationResult, message: string, file?: string): void {
  result.warnings.push({ severity: "warning", message, file });
}

export function addInfo(result: ValidationResult, message: string, file?: string): void {
  result.info.push({ severity: "info", message, file });
}

// Feature status types
export interface FeatureStatus {
  name: string;
  progress: TaskProgress | null;
  lastSession?: string;
}
