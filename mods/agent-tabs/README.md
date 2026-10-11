# agent-tabs

A clickable tab row above the prompt, one tab per agent in the current Claude Code session.

- Tabs: `main` plus every subagent and teammate, each showing its name, model and a status dot (green running, yellow idle).
- Click a tab to open a pane with that agent's transcript. The selected tab is highlighted.
- The row is hidden while the session has no subagents or teammates.

## Limits

A mod runs inside one Claude Code process, so it only sees that session's agents. It cannot switch between separate `claude` processes in other terminals; use `/resume` or `claude -r <id>` for those.

An agent's model shows once it has taken its first turn step. The roster refreshes every 2 seconds.

## Install

```
/plugin marketplace add jamesrosko/cc-extensions
/plugin install agent-tabs@cc-extensions
```

Or install in one step: `/plugin install agent-tabs --marketplace jamesrosko/cc-extensions`

## Try it

```
claude --plugin-dir mods/agent-tabs
```
