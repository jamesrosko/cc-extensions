# cc-extensions

Repository of Claude Code plugins, mods, and skills.

- `plugins/`, `skills/`, `mods/`: one subdirectory per extension, each with its own README.
- `subagents/`: one markdown file per subagent, with `name`, `description`, and optional `tools`/`model` frontmatter.
- Skills are folders containing a `SKILL.md` with `name` and `description` frontmatter.
- Keep each extension self-contained; don't share files across extensions.
