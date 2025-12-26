#!/usr/bin/env bun
import { defineCommand, runMain } from "citty";
import pkg from "../package.json";
import { archiveCommand } from "./commands/archive";
import { compactCommand } from "./commands/compact";
import { initCommand } from "./commands/init";
import { markCommand } from "./commands/mark";
import { nextCommand } from "./commands/next";
import { pathCommand } from "./commands/path";
import { resumeCommand } from "./commands/resume";
import { statusCommand } from "./commands/status";
import { summaryCommand } from "./commands/summary";
import { validateCommand } from "./commands/validate";

const main = defineCommand({
  meta: {
    name: "spec",
    version: pkg.version,
    description: "Spec-driven development CLI for managing specifications",
  },
  args: {
    root: {
      type: "string",
      alias: "r",
      description: "Project root directory (default: auto-detect by walking up to find .specs/)",
    },
    plain: {
      type: "boolean",
      description: "Human-readable output instead of JSON (JSON is default)",
    },
  },
  subCommands: {
    init: initCommand,
    status: statusCommand,
    resume: resumeCommand,
    next: nextCommand,
    summary: summaryCommand,
    path: pathCommand,
    mark: markCommand,
    archive: archiveCommand,
    validate: validateCommand,
    compact: compactCommand,
  },
});

runMain(main);
