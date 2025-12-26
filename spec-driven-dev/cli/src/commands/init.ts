import { defineCommand } from "citty";
import { existsSync, mkdirSync, writeFileSync, appendFileSync, readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { PROJECT_MD } from "../templates";
import { success, error, info } from "../ui/output";

export const initCommand = defineCommand({
  meta: {
    name: "init",
    description: "Initialize specs/ structure for a project",
  },
  args: {
    projectName: {
      type: "positional",
      description: "Project name (defaults to current directory name)",
      required: false,
    },
  },
  async run({ args }) {
    const projectName = (args.projectName as string) || basename(process.cwd());
    const specDir = resolve(process.cwd(), "specs");

    if (existsSync(specDir)) {
      error("specs/ directory already exists");
      process.exit(1);
    }

    // Create directory structure
    mkdirSync(resolve(specDir, "active"), { recursive: true });
    mkdirSync(resolve(specDir, "archived"), { recursive: true });

    // Write project.md with substitution
    const projectMd = PROJECT_MD.replace(/\{\{PROJECT_NAME\}\}/g, projectName);
    writeFileSync(resolve(specDir, "project.md"), projectMd);

    // Update .gitignore if it exists
    const gitignorePath = resolve(process.cwd(), ".gitignore");
    if (existsSync(gitignorePath)) {
      const gitignoreContent = readFileSync(gitignorePath, "utf-8");
      if (!gitignoreContent.includes("specs/archived")) {
        appendFileSync(
          gitignorePath,
          "\n# Archived specs (optional, can be large)\n# specs/archived/\n"
        );
      }
    }

    success(`Initialized spec-driven development for: ${projectName}`);
    console.log();
    info("Next steps:");
    info("  1. Edit specs/project.md with your project details");
    info("  2. Create your first spec: mkdir -p specs/active/{spec-name}");
    info("  3. Add spec.md using the template");
  },
});
