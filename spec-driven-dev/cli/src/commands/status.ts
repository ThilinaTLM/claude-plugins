import { defineCommand } from "citty";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { countCheckboxes } from "../lib/spec-parser";
import { calculateProgressFromCounts } from "../lib/progress";
import { getSpecsDir } from "../lib/project-root";
import { printHeader, printDivider, info, error } from "../ui/output";
import type { FeatureStatus, TaskProgress } from "../types";

function getFeatureStatus(featureDir: string): FeatureStatus {
  const name = featureDir.split("/").pop() || "";
  const tasksPath = resolve(featureDir, "tasks.yaml");
  const checkpointPath = resolve(featureDir, "checkpoint.md");

  let progress: TaskProgress | null = null;
  let lastSession: string | undefined;

  if (existsSync(tasksPath)) {
    const content = readFileSync(tasksPath, "utf-8");
    const { total, done } = countCheckboxes(content);
    if (total > 0) {
      progress = calculateProgressFromCounts(total, done);
    }
  }

  if (existsSync(checkpointPath)) {
    const content = readFileSync(checkpointPath, "utf-8");
    const dateMatch = content.match(/\d{4}-\d{2}-\d{2}/);
    if (dateMatch) {
      lastSession = dateMatch[0];
    }
  }

  return { name, progress, lastSession };
}

function formatProgress(progress: TaskProgress | null): string {
  if (!progress) return "[no tasks]";
  return `[${progress.done}/${progress.total}] ${progress.percent}%`;
}

export const statusCommand = defineCommand({
  meta: {
    name: "status",
    description: "Show status of all spec-driven features",
  },
  args: {
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
      description: "Minimal output (feature names + progress only)",
    },
  },
  async run({ args }) {
    const usePlain = args.plain as boolean;
    const quiet = args.quiet as boolean;
    const { specsDir: specDir, projectRoot, autoDetected } = getSpecsDir(args.root as string | undefined);

    if (!existsSync(specDir)) {
      const errorData = {
        error: "No specs/ directory found",
        searchedPath: specDir,
        cwd: process.cwd(),
        projectRoot,
        autoDetected,
        suggestions: [
          "Run from project root containing specs/ directory",
          "Use --root flag: spec --root /path/to/project status",
          "Initialize specs: spec init",
        ],
      };
      if (!usePlain) {
        console.log(JSON.stringify(errorData, null, 2));
      } else {
        error("No specs/ directory found.");
        info(`Searched in: ${specDir}`);
        if (autoDetected && projectRoot) {
          info(`Auto-detected project root: ${projectRoot}`);
        }
        console.log();
        info("Suggestions:");
        info("  • Run from project root containing specs/ directory");
        info("  • Use --root flag: spec --root /path/to/project status");
        info("  • Initialize specs: spec init");
      }
      process.exit(1);
    }

    // Build data structure
    const data: {
      features: FeatureStatus[];
      changes: FeatureStatus[];
      archived: string[];
      project: { name: string; hasTechStack: boolean } | null;
    } = {
      features: [],
      changes: [],
      archived: [],
      project: null,
    };

    // Collect features
    const featuresDir = resolve(specDir, "features");
    if (existsSync(featuresDir)) {
      const features = readdirSync(featuresDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);
      for (const feature of features) {
        data.features.push(getFeatureStatus(resolve(featuresDir, feature)));
      }
    }

    // Collect changes
    const changesDir = resolve(specDir, "changes");
    if (existsSync(changesDir)) {
      const changes = readdirSync(changesDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);
      for (const change of changes) {
        data.changes.push(getFeatureStatus(resolve(changesDir, change)));
      }
    }

    // Collect archived
    const archiveDir = resolve(specDir, "archive");
    if (existsSync(archiveDir)) {
      data.archived = readdirSync(archiveDir);
    }

    // Collect project info
    const projectPath = resolve(specDir, "project.md");
    if (existsSync(projectPath)) {
      const content = readFileSync(projectPath, "utf-8");
      const nameMatch = content.match(/^# (.+)$/m);
      const projectName = nameMatch ? nameMatch[1].replace("Project: ", "") : "Unknown";
      data.project = {
        name: projectName,
        hasTechStack: content.includes("Tech Stack"),
      };
    }

    // Output - JSON is default
    if (!usePlain && !quiet) {
      console.log(JSON.stringify(data, null, 2));
      return;
    }

    // Quiet mode - minimal output (works in both plain and JSON mode)
    if (quiet) {
      if (!usePlain) {
        // JSON quiet mode
        console.log(JSON.stringify({ features: data.features.map(f => ({ name: f.name, percent: f.progress?.percent ?? 0 })) }));
      } else {
        for (const status of data.features) {
          const pct = status.progress ? `${status.progress.percent}%` : "0%";
          console.log(`${status.name} ${pct}`);
        }
      }
      return;
    }

    // Human-readable output (--plain flag)
    printHeader("SPEC-DRIVEN DEVELOPMENT STATUS");

    printDivider("ACTIVE FEATURES");
    if (data.features.length === 0) {
      info("(no active features)");
    } else {
      for (const status of data.features) {
        const progressStr = formatProgress(status.progress);
        const sessionStr = status.lastSession ? `(last: ${status.lastSession})` : "";
        console.log(`  ${status.name.padEnd(25)} ${progressStr} ${sessionStr}`);
      }
    }

    printDivider("PENDING CHANGES");
    if (data.changes.length === 0) {
      info("(no pending changes)");
    } else {
      for (const status of data.changes) {
        const progressStr = status.progress ? formatProgress(status.progress) : "[proposal only]";
        console.log(`  ${status.name.padEnd(25)} ${progressStr}`);
      }
    }

    printDivider("ARCHIVED");
    if (data.archived.length === 0) {
      info("(none)");
    } else {
      info(`${data.archived.length} completed changes`);
      const toShow = data.archived.slice(0, 5);
      for (const item of toShow) {
        info(`  - ${item}`);
      }
      if (data.archived.length > 5) {
        info(`  ... and ${data.archived.length - 5} more`);
      }
    }

    printDivider("PROJECT");
    if (data.project) {
      info(`Name: ${data.project.name}`);
      info(`Tech stack defined: ${data.project.hasTechStack ? "yes" : "no"}`);
    } else {
      info("No project.md found");
    }

    console.log();
    console.log("═".repeat(60));
    console.log("Commands:");
    console.log("  spec resume {feature}  - Resume work on a feature");
    console.log("  spec validate {path}   - Validate spec files");
    console.log("  spec compact {file}    - Generate token-optimized spec");
    console.log("═".repeat(60));
  },
});
