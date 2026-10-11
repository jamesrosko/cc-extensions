---
name: plugin-packaging
description: Packages Claude Code skills, subagents, commands, hooks, and MCP servers into an installable plugin, and validates the layout before publishing. Use when the user wants to create a plugin, bundle existing extensions into one, add a plugin manifest or marketplace file, or figure out why an installed plugin's components don't load.
---

# Plugin packaging

## Layout
Only the manifest goes inside `.claude-plugin/`. Components sit at the plugin root:

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json
├── skills/<name>/SKILL.md
├── agents/<name>.md
├── commands/<name>.md
├── hooks/hooks.json
├── .mcp.json
└── README.md
```

Note that subagents live in `agents/` inside a plugin. This differs from this repo's `subagents/` folder, so copy them across rather than moving them.

## Steps
1. **Inventory.** List the extensions the user wants bundled. If the plugin has no clear theme, suggest splitting it.
2. **Create the manifest** at `.claude-plugin/plugin.json`:
   ```json
   {
     "name": "kebab-case-name",
     "version": "0.1.0",
     "description": "One sentence on what the plugin gives the user.",
     "author": { "name": "..." }
   }
   ```
   `name` is the only required field. If you are unsure whether another field exists, check the current plugin docs rather than guessing.
3. **Copy components** into the root-level folders above. Keep each extension's own frontmatter intact.
4. **Fix paths.** Hook commands and MCP configs must reference bundled files through `${CLAUDE_PLUGIN_ROOT}`, never absolute paths, because the plugin is copied to a cache location on install.
5. **Hooks.** Put them in `hooks/hooks.json` using the same `hooks` structure as settings.json. Check commands work on every platform you claim to support.
6. **README.** Include what the plugin contains, install commands, and any prerequisites (binaries, env vars).
7. **Marketplace (optional).** To distribute from a repo, add `.claude-plugin/marketplace.json` at the repo root with a `name`, `owner`, and a `plugins` array whose entries point at each plugin's `source` path.

## Validate
- Every JSON file parses.
- Every component path the manifest or marketplace references exists.
- Nothing was left outside the plugin that a component depends on (plugins are self-contained after install).
- Run `claude plugin validate .` if that command exists in the user's version; otherwise test locally by adding the directory as a marketplace (`/plugin marketplace add <path>`), installing, and confirming each component appears.

## Common causes of "installed but nothing loads"
- Component folders placed inside `.claude-plugin/`.
- Invalid or missing `plugin.json`.
- Wrong folder name (`subagents/` instead of `agents/`).
- Relative or absolute paths in hooks instead of `${CLAUDE_PLUGIN_ROOT}`.
- Session not restarted after install or update.

## Output
Report the directory tree you created, the manifest contents, the validation steps you ran with their results, and the install command for the user.
