# cc-extensions

A collection of Claude Code extensions: plugins, mods, skills, and related tooling.

## Layout

| Directory  | Contents                                              |
| ---------- | ----------------------------------------------------- |
| `plugins/` | Claude Code plugins (each in its own subdirectory)    |
| `skills/`  | Standalone skills (each a folder containing `SKILL.md`) |
| `mods/`    | Mods that change Claude Code's interface or behavior  |
| `subagents/` | Subagent definitions (markdown files with frontmatter) |

## Adding an extension

1. Create a subdirectory under the matching folder, named after the extension.
2. Include a short `README.md` describing what it does and how to install it.
3. Commit and push.

## Installing

Skills can be copied (or symlinked) into `~/.claude/skills/` (personal) or `.claude/skills/` (per project).
Subagents can be copied into `~/.claude/agents/` (personal) or `.claude/agents/` (per project).
