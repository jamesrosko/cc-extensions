#!/usr/bin/env bash
# Copies skills from this repo into the user-level Claude Code skills folder.
# Usage: ./scripts/install-skills.sh   (macOS / Linux)
set -euo pipefail

source_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../skills" && pwd)"
dest_dir="$HOME/.claude/skills"

mkdir -p "$dest_dir"

count=0
for dir in "$source_dir"/*/; do
  # A skill is a folder containing SKILL.md.
  [ -f "${dir}SKILL.md" ] || continue
  name="$(basename "$dir")"
  rm -rf "${dest_dir:?}/$name"
  cp -R "$dir" "$dest_dir/$name"
  echo "Installed $name"
  count=$((count + 1))
done

echo "Copied $count skill(s) to $dest_dir"
echo "Restart Claude Code to load them."
