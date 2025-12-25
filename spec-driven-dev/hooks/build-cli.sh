#!/bin/bash
set -euo pipefail

CLI_DIR="${CLAUDE_PLUGIN_ROOT}/cli"
SPEC_BIN="${CLI_DIR}/dist/spec"
SRC_DIR="${CLI_DIR}/src"

# Check if rebuild is needed
needs_rebuild() {
  # Rebuild if binary doesn't exist
  [ ! -f "$SPEC_BIN" ] && return 0

  # Rebuild if any source file is newer than binary
  if [ -d "$SRC_DIR" ]; then
    newest_src=$(find "$SRC_DIR" -name "*.ts" -newer "$SPEC_BIN" 2>/dev/null | head -1)
    [ -n "$newest_src" ] && return 0
  fi

  # Also check build.ts
  [ "${CLI_DIR}/build.ts" -nt "$SPEC_BIN" ] && return 0

  return 1
}

if ! needs_rebuild; then
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

echo '{"systemMessage": "spec-driven-dev CLI rebuilt with latest changes"}'
