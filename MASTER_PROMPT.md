# Master prompt (paste this into the coding agent)

You are building a portfolio website in this repository. The repository already contains AGENTS.md, docs/ and scripts/. Read them before you write any code.

1. Read AGENTS.md. It is your operating manual and overrides your habits.
2. Read docs/PROGRESS.md. Start the task it names. If it names none, start T00.
3. Work on that one task only, following the session protocol in AGENTS.md.
4. When the task is done, run `npm run check`, update docs/PROGRESS.md, commit the task's changes with a clear message (git-per-task workflow; commits are the revert points), then report in five lines:
   built / verified / not verified / blocked / next task. Stop there.

Rules that matter most:
- Never rewrite a file from memory. Open it first, then edit in small diffs.
- Check docs/MAP.md before you create any file.
- Do not claim something works unless you ran it. Write "not verified" instead.
- Do not change anything under "Locked decisions" in AGENTS.md. Ask me.
- Screenshot tooling (scripts/shots.mjs) is removed for now. Judge visual work with the checks the task card lists, and by looking at the running dev server yourself.

When I write "continue", start the next task in docs/PROGRESS.md.
