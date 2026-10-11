---
name: extension-audit
description: Audits Claude Code extensions in a repo (skills, subagents, commands, hooks, plugins) against a checklist and produces a prioritized findings report. Use when the user asks to audit, lint, check, or review the extensions in a repo, or before publishing or releasing them.
---

# Extension audit

Read-only. Report findings; do not edit files unless the user asks afterward.

## Scope
Find every extension from the repo layout:
- `skills/*/SKILL.md`
- `subagents/*.md`
- `commands/*.md`
- `plugins/*/` (look for `.claude-plugin/plugin.json`)
- `mods/*/`
- hook definitions in any `settings.json` or `hooks/hooks.json`

Also read the repo's `CLAUDE.md` for local conventions and treat them as requirements.

## Checks

**All extensions**
- Has the required structure and frontmatter for its type; no invented fields.
- Name is kebab-case and matches its folder or filename.
- Does one job. Flag anything that should be split.
- Has a README where the repo requires one.
- No hard-coded absolute paths, usernames, or secrets.

**Descriptions** (skills and subagents; this is the only text Claude uses to decide whether to load them)
- States what it does AND when to use it.
- Contains concrete trigger situations or phrases, not vague wording like "helps with code".
- Doesn't overlap so heavily with another extension that both would trigger.

**Tool access** (subagents and commands)
- `tools` is present and minimal. Flag unrestricted access, and `Write`/`Edit`/`Bash` on something described as read-only or reviewing.
- Model choice is sensible for the job, or omitted deliberately.

**Body quality**
- Direct, actionable instructions with a defined output format.
- Deterministic or repeated work lives in scripts, not prose.
- Bulky reference material is split into linked files rather than inlined.
- No contradictions between the description and the body.

**Hooks**
- Event names and matchers are valid and case-correct.
- Blocking intent matches the exit code used (only exit 2 blocks).
- Commands work on every platform the repo claims to support.

**Plugins**
- Manifest is valid JSON with a `name`, and listed components exist.
- Component directories sit at the plugin root, not inside `.claude-plugin/`.
- Paths inside the plugin use `${CLAUDE_PLUGIN_ROOT}` rather than absolute paths.

## Output
Start with a one-line summary (counts by severity). Then list findings grouped by severity:

- **High**: broken or will not load, or unsafe (secrets, destructive tool access).
- **Medium**: unreliable triggering, over-broad tools, missing required docs.
- **Low**: style, naming, minor redundancy.

Each finding: `file:line`, what is wrong, why it matters, and the specific fix. End with extensions that passed cleanly, so the user knows they were checked. If nothing is wrong, say so plainly.
