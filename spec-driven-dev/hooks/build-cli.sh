#!/bin/bash
set -euo pipefail

CLI_DIR="${CLAUDE_PLUGIN_ROOT}/cli"
SPEC_BIN="${CLI_DIR}/dist/spec"

# Check if binary already exists
if [ -f "$SPEC_BIN" ]; then
  exit 0
fi

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
  echo '{"systemMessage": "Warning: Bun not installed. spec-driven-dev CLI unavailable. Install Bun: https://bun.sh"}' >&2
  exit 0  # Don't block session, just warn
fi

# Build CLI
cd "$CLI_DIR"
bun install --frozen-lockfile 2>/dev/null || bun install
bun run build

echo '{"systemMessage": "spec-driven-dev CLI built successfully"}'
