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
