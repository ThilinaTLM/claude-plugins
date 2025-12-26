import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { defineCommand } from "citty";
import { calculateProgressFromCounts } from "../lib/progress";
import { getSpecsDir } from "../lib/project-root";
import { countCheckboxes } from "../lib/spec-parser";
import type { FeatureStatus, TaskProgress } from "../types";
import { error, info, printDivider, printHeader } from "../ui/output";

function getSpecStatus(specDir: string): FeatureStatus {
  const name = specDir.split("/").pop() || "";
  const tasksPath = resolve(specDir, "tasks.yaml");
  const checkpointPath = resolve(specDir, "checkpoint.md");

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
    const {
      specsDir: specDir,
      projectRoot,
      autoDetected,
    } = getSpecsDir(args.root as string | undefined);

    if (!existsSync(specDir)) {
      const errorData = {
        error: "No .specs/ directory found",
        searchedPath: specDir,
        cwd: process.cwd(),
        projectRoot,
        autoDetected,
        suggestions: [
          "Run from project root containing .specs/ directory",
          "Use --root flag: spec --root /path/to/project status",
          "Initialize specs: spec init",
        ],
      };
      if (!usePlain) {
        console.log(JSON.stringify(errorData, null, 2));
      } else {
        error("No .specs/ directory found.");
        info(`Searched in: ${specDir}`);
        if (autoDetected && projectRoot) {
          info(`Auto-detected project root: ${projectRoot}`);
        }
        console.log();
        info("Suggestions:");
        info("  • Run from project root containing .specs/ directory");
        info("  • Use --root flag: spec --root /path/to/project status");
        info("  • Initialize specs: spec init");
      }
      process.exit(1);
    }

    // Build data structure
    const data: {
      specs: FeatureStatus[];
      archived: string[];
      archiveSuggestions: string[];
      project: { name: string; hasTechStack: boolean } | null;
    } = {
      specs: [],
      archived: [],
      archiveSuggestions: [],
      project: null,
    };

    // Collect active specs
    const activeDir = resolve(specDir, "active");
    if (existsSync(activeDir)) {
      const specs = readdirSync(activeDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);
      for (const spec of specs) {
        const status = getSpecStatus(resolve(activeDir, spec));
        data.specs.push(status);
        // Track specs that are 100% complete for archive suggestions
        if (status.progress && status.progress.percent === 100) {
          data.archiveSuggestions.push(spec);
        }
      }
    }

    // Collect archived specs
    const archivedDir = resolve(specDir, "archived");
    if (existsSync(archivedDir)) {
      data.archived = readdirSync(archivedDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);
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
        console.log(
          JSON.stringify({
            specs: data.specs.map((s) => ({ name: s.name, percent: s.progress?.percent ?? 0 })),
          }),
        );
      } else {
        for (const status of data.specs) {
          const pct = status.progress ? `${status.progress.percent}%` : "0%";
          console.log(`${status.name} ${pct}`);
        }
      }
      return;
    }

    // Human-readable output (--plain flag)
    printHeader("SPEC-DRIVEN DEVELOPMENT STATUS");

    printDivider("ACTIVE SPECS");
    if (data.specs.length === 0) {
      info("(no active specs)");
    } else {
      for (const status of data.specs) {
        const progressStr = formatProgress(status.progress);
        const sessionStr = status.lastSession ? `(last: ${status.lastSession})` : "";
        const completeMarker = status.progress?.percent === 100 ? " [COMPLETE]" : "";
        console.log(`  ${status.name.padEnd(25)} ${progressStr}${completeMarker} ${sessionStr}`);
      }
    }

    printDivider("ARCHIVED");
    if (data.archived.length === 0) {
      info("(none)");
    } else {
      info(`${data.archived.length} archived spec(s)`);
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
    console.log("  spec resume {spec}     - Resume work on a spec");
    console.log("  spec validate {path}   - Validate spec files");
    console.log("  spec compact {file}    - Generate token-optimized spec");
    if (data.archiveSuggestions.length > 0) {
      console.log();
      console.log("Ready to archive:");
      for (const spec of data.archiveSuggestions) {
        console.log(`  spec archive ${spec}`);
      }
    }
    console.log("═".repeat(60));
  },
});
