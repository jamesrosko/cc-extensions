# cc-extensions

A collection of Claude Code extensions: plugins, mods, skills, and related tooling.

## Layout

| Directory  | Contents                                              |
| ---------- | ----------------------------------------------------- |
| `plugins/` | Claude Code plugins (each in its own subdirectory)    |
| `skills/`  | Standalone skills (each a folder containing `SKILL.md`) |
| `mods/`    | Mods that change Claude Code's interface or behavior  |
| `subagents/` | Subagent definitions (markdown files with frontmatter) |
| `commands/` | Slash commands (one markdown prompt file per command) |

## Adding an extension

1. Create a subdirectory under the matching folder, named after the extension.
2. Include a short `README.md` describing what it does and how to install it.
3. Commit and push.

## Installing

Skills can be copied (or symlinked) into `~/.claude/skills/` (personal) or `.claude/skills/` (per project).
To install all skills to your user folder, run `scripts/install-skills.ps1` (Windows) or `scripts/install-skills.sh` (macOS/Linux).
Subagents can be copied into `~/.claude/agents/` (personal) or `.claude/agents/` (per project).
To install all subagents to your user folder, run `scripts/install-subagents.ps1` (Windows) or `scripts/install-subagents.sh` (macOS/Linux).
Commands can be copied into `~/.claude/commands/` (personal) or `.claude/commands/` (per project).

### As a plugin marketplace

This repo is a Claude Code plugin marketplace (`.claude-plugin/marketplace.json`), so plugins and mods can be installed into your user-level Claude Code without cloning it:

```
/plugin marketplace add jamesrosko/cc-extensions
/plugin install status-bar@cc-extensions
```

- Use the same commands from a local clone with `/plugin marketplace add /path/to/cc-extensions`.
- Run `/plugin marketplace update cc-extensions` to pick up new versions, and restart the session after installing or updating.
- Browse what's available with `/plugin`.

Only extensions packaged as plugins (a folder with `.claude-plugin/plugin.json`) are listed. Standalone skills, subagents and commands still use the copy/install scripts above.

**Adding a plugin or mod to the marketplace:** give it a `.claude-plugin/plugin.json`, then add an entry to the `plugins` array in `.claude-plugin/marketplace.json`:

```json
{ "name": "my-mod", "source": "./mods/my-mod", "description": "One sentence on what it does." }
```

Run `claude plugin validate .` from the repo root before pushing.

### Mods (local)

Each mod under `mods/` is a plugin directory (it has a `.claude-plugin/plugin.json`), so you load it by pointing Claude Code at the folder with `--plugin-dir`:

```sh
# from the repo root
claude --plugin-dir mods/status-bar
```

Use an absolute path to load a mod from any other directory, and repeat the flag to load several:

```sh
claude --plugin-dir /path/to/cc-extensions/mods/status-bar --plugin-dir /path/to/cc-extensions/mods/other-mod
```

The mod is active for that session only. To load it every time, use a shell alias or wrapper, e.g. `alias claude='claude --plugin-dir /path/to/cc-extensions/mods/status-bar'` (PowerShell: define a `claude` function that forwards its arguments with `--plugin-dir`).
See each mod's own `README.md` for what it does and any settings to tweak.
