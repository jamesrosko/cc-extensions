# extension-audit

Read-only audit of the Claude Code extensions in a repo (skills, subagents, commands, hooks, plugins). Produces a severity-ranked findings report covering structure, description quality, tool access, and hook correctness.

## Install
Copy this folder to `~/.claude/skills/extension-audit/` (user) or `.claude/skills/extension-audit/` (project).

## Use
Ask "audit the extensions in this repo". It pairs well with the `extension-reviewer` subagent, which reviews a single extension after a change.
