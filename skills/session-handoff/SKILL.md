---
name: session-handoff
description: Writes a handoff note capturing the current task state so a fresh Claude Code session can continue the work. Use when the user says they're wrapping up, switching sessions, running out of context, or asks for a handoff, summary of where things stand, or notes for next time.
---

# Session handoff

Produce a note that lets a new session with zero memory resume without re-deriving anything. Write for a reader who has the repo but not this conversation.

## Gather facts, don't recall them
Before writing, check the actual state:
- `git status` and `git diff --stat` for uncommitted work
- `git log --oneline -10` for recent commits
- current branch and whether it tracks a remote
- any failing tests, build errors, or running background processes you know of

Do not claim something is done or passing unless you verified it in this session. Say "not verified" instead.

## Contents
Use these sections and omit any that are empty:

1. **Goal**: what the user is trying to achieve, in one or two sentences.
2. **State**: what is done, what is in progress, what is untouched. Name files with paths.
3. **Decisions**: choices made and the reason, especially ones a newcomer might reverse by mistake. Include approaches tried and rejected.
4. **Open questions**: things waiting on the user or unresolved.
5. **Next steps**: ordered, concrete, starting with the very next action.
6. **Gotchas**: commands to run tests, environment quirks, files not to touch, failing checks that are expected.

## Rules
- Be specific: file paths, commands, error messages. No "various fixes".
- Keep it short, ideally under a page. Link to files instead of pasting their contents.
- Never include secrets, tokens, or credentials.
- Separate facts from guesses.

## Where to put it
Default to `HANDOFF.md` in the repo root (or the scratchpad directory if one is provided and the note shouldn't be committed). If the file exists, ask before overwriting. Don't commit it unless asked. Tell the user the path, and give them a ready-to-paste opening prompt for the new session, such as: "Read HANDOFF.md and continue from the next steps."
