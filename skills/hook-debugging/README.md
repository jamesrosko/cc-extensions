# hook-debugging

Diagnoses Claude Code hooks that don't fire, don't block, or behave differently across platforms. It checks config location, event and matcher names, exit-code semantics, and Windows vs POSIX shell quirks, then reports the cause and the fix.

## Install
Copy this folder to `~/.claude/skills/hook-debugging/` (user) or `.claude/skills/hook-debugging/` (project).

## Use
Ask something like "my PreToolUse hook isn't blocking" and the skill loads on its own.
