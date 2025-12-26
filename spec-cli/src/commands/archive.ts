import { defineCommand } from "citty";
import { existsSync, readdirSync, renameSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { parseTasksFile, getNextTask } from "../lib/spec-parser";
import { getActiveDir, getArchivedDir } from "../lib/project-root";
import { success, error, info } from "../ui/output";

export const archiveCommand = defineCommand({
  meta: {
    name: "archive",
    description: "Archive a completed spec to .specs/archived/",
  },
  args: {
    spec: {
      type: "positional",
      description: "Spec name to archive",
      required: true,
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
      description: "Minimal output",
    },
    force: {
      type: "boolean",
      alias: "f",
      description: "Archive even if not 100% complete",
    },
  },
  async run({ args }) {
    const specName = args.spec as string;
    const usePlain = args.plain as boolean;
    const quiet = args.quiet as boolean;
    const force = args.force as boolean;

    const { activeDir, specsDir, projectRoot, autoDetected } = getActiveDir(args.root as string | undefined);
    const { archivedDir } = getArchivedDir(args.root as string | undefined);

    // Check if specs directory exists
    const specsExists = existsSync(specsDir);

    // Validate spec exists in active
    const specDir = resolve(activeDir, specName);
    if (!existsSync(specDir)) {
      // Get available specs for better error message
      const availableSpecs = existsSync(activeDir)
        ? readdirSync(activeDir, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name)
        : [];

      const errorData = {
        error: `Spec '${specName}' not found in active specs`,
        searchedPath: specDir,
        specsFound: specsExists,
        availableSpecs,
        cwd: process.cwd(),
        projectRoot,
        autoDetected,
        suggestions: specsExists
          ? [`Available specs: ${availableSpecs.join(", ") || "(none)"}`]
          : [
              "Run from project root containing .specs/ directory",
              `Use --root flag: spec --root /path/to/project archive ${specName}`,
              "Initialize specs: spec init",
            ],
      };

      if (!usePlain) {
        console.log(JSON.stringify(errorData, null, 2));
      } else {
        error(`Spec '${specName}' not found in active specs`);
        info(`Searched in: ${specDir}`);
        if (!specsExists) {
          info(`No .specs/ directory found at: ${specsDir}`);
          console.log();
          info("Suggestions:");
          info("  - Run from project root containing .specs/ directory");
          info(`  - Use --root flag: spec --root /path/to/project archive ${specName}`);
          info("  - Initialize specs: spec init");
        } else if (availableSpecs.length > 0) {
          console.log();
          console.log("Available specs:");
          for (const s of availableSpecs) {
            info(`  ${s}`);
          }
        }
      }
      process.exit(1);
    }

    // Check if spec is 100% complete (unless --force)
    const tasksPath = resolve(specDir, "tasks.yaml");
    if (!force && existsSync(tasksPath)) {
      const phases = parseTasksFile(tasksPath);
      const nextTask = getNextTask(phases);

      if (nextTask) {
        const errorData = {
          error: "Spec is not complete",
          spec: specName,
          nextTask: {
            id: nextTask.id,
            title: nextTask.title,
          },
          hint: "Use --force to archive anyway",
        };

        if (!usePlain) {
          console.log(JSON.stringify(errorData, null, 2));
        } else {
          error("Spec is not complete");
          info(`Next incomplete task: ${nextTask.id} - ${nextTask.title}`);
          console.log();
          info("Use --force to archive anyway");
        }
        process.exit(1);
      }
    }

    // Check if already archived
    const targetDir = resolve(archivedDir, specName);
    if (existsSync(targetDir)) {
      const errorData = {
        error: `Spec '${specName}' already exists in archived`,
        targetPath: targetDir,
      };

      if (!usePlain) {
        console.log(JSON.stringify(errorData, null, 2));
      } else {
        error(`Spec '${specName}' already exists in archived`);
        info(`Target path: ${targetDir}`);
      }
      process.exit(1);
    }

    // Create archived directory if it doesn't exist
    if (!existsSync(archivedDir)) {
      mkdirSync(archivedDir, { recursive: true });
    }

    // Move spec to archived
    renameSync(specDir, targetDir);

    // Output result
    const result = {
      archived: true,
      spec: specName,
      from: specDir,
      to: targetDir,
    };

    // JSON is default
    if (!usePlain && !quiet) {
      console.log(JSON.stringify(result, null, 2));
    } else if (quiet) {
      if (!usePlain) {
        console.log(JSON.stringify({ archived: true, spec: specName }));
      } else {
        console.log(specName);
      }
    } else {
      // Plain human-readable output
      success(`Archived '${specName}'`);
      info(`From: ${specDir}`);
      info(`To: ${targetDir}`);
    }
  },
});
