---
name: hook-debugging
description: Diagnoses Claude Code hooks that don't fire, fire at the wrong time, or misbehave. Use when the user says a hook isn't running, isn't blocking, has no effect, errors on every tool call, or behaves differently on Windows vs macOS/Linux.
---

# Hook debugging

Work from the cheapest check to the most expensive. Stop as soon as you find the cause.

## 1. Find where the hook is configured
Hooks live under a `hooks` key in one of these files (all that exist are merged):
- `~/.claude/settings.json` (user)
- `.claude/settings.json` (project, shared)
- `.claude/settings.local.json` (project, personal)
- a plugin's `hooks/hooks.json`

Read each. Check for: invalid JSON, the hook sitting under the wrong key, a duplicate definition in another scope, and edits made after the session started (hooks are snapshotted at startup, so ask the user to restart or run `/hooks` to review).

## 2. Check the event and matcher
- The event name must match exactly and is case-sensitive (`PreToolUse`, `PostToolUse`, `UserPromptSubmit`, `Stop`, `SessionStart`, ...).
- `matcher` applies only to tool events. It matches the tool name (`Bash`, `Edit|Write`, `mcp__server__tool`) and is case-sensitive. An empty or missing matcher matches everything.
- `UserPromptSubmit` and `Stop` take no matcher.
- If the hook should fire for a tool, confirm the tool name is what Claude actually calls (MCP tools are `mcp__<server>__<tool>`).

## 3. Run the command by hand
Pipe a realistic payload into the exact command string. Hook input arrives as JSON on stdin, for example:

```
echo '{"tool_name":"Bash","tool_input":{"command":"ls"}}' | <hook command>
```

Check: exit code, stdout, stderr, and run time. Common failures:
- script not executable, or relative path resolved from the wrong working directory (use absolute paths or `$CLAUDE_PROJECT_DIR`)
- missing interpreter (`jq`, `python`, `node`) on PATH
- CRLF line endings in a shell script
- the script reads stdin in a way that hangs when no input arrives
- the hook exceeds its timeout and is killed

## 4. Check exit-code semantics
- `0`: success. stdout is shown or added as context for some events (`UserPromptSubmit`, `SessionStart`).
- `2`: blocking error. stderr is fed back to Claude, and for `PreToolUse` the tool call is blocked.
- any other non-zero: non-blocking error, shown to the user only. A "blocking" hook that exits `1` will not block.
- JSON on stdout (for example a `decision` or `hookSpecificOutput` field) is an alternative to exit codes. Verify the field names against the current hooks docs rather than from memory.

## 5. Check platform quirks
- Windows: commands run through a shell that may not be bash. `$VAR`, `&&`, single quotes, and `.sh` scripts can behave differently. Prefer a `.ps1`/`.cmd` or `node`/`python` entry point, and quote paths with spaces.
- macOS/Linux: confirm the shebang and the executable bit.

## 6. Get live evidence
If steps 1-5 find nothing, add a first line to the hook that appends the event name and stdin to a temp file. If the file never appears, the hook isn't being invoked (back to steps 1-2). If it appears, the problem is inside the script. Running Claude Code with `--debug` also logs hook matching and execution.

## Output
Report: the root cause, the evidence for it, the exact fix (file and lines), and how to confirm the fix works. Remove any debugging lines you added.
