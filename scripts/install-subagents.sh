#!/usr/bin/env bash
# Copies subagents from this repo into the user-level Claude Code agents folder.
# Usage: ./scripts/install-subagents.sh   (macOS / Linux)
set -euo pipefail

source_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../subagents" && pwd)"
dest_dir="$HOME/.claude/agents"

mkdir -p "$dest_dir"

count=0
for file in "$source_dir"/*.md; do
  [ -e "$file" ] || continue
  cp -f "$file" "$dest_dir/"
  echo "Installed $(basename "$file")"
  count=$((count + 1))
done

echo "Copied $count subagent(s) to $dest_dir"
echo "Restart Claude Code, then run /agents to confirm."
