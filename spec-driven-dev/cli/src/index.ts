#!/usr/bin/env bun
import { defineCommand, runMain } from "citty";
import { initCommand } from "./commands/init";
import { statusCommand } from "./commands/status";
import { resumeCommand } from "./commands/resume";
import { validateCommand } from "./commands/validate";
import { compactCommand } from "./commands/compact";
import { nextCommand } from "./commands/next";
import { markCommand } from "./commands/mark";

const main = defineCommand({
  meta: {
    name: "spec",
    version: "1.0.0",
    description: "Spec-driven development CLI for managing specifications",
  },
  args: {
    root: {
      type: "string",
      alias: "r",
      description: "Project root directory (default: auto-detect by walking up to find specs/)",
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
    validate: validateCommand,
    compact: compactCommand,
    next: nextCommand,
    mark: markCommand,
  },
});

runMain(main);
