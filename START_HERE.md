# Start here (for you, not the agent)

1. Make an empty folder for the project. Copy everything from this kit into it (AGENTS.md, docs/, scripts/, MASTER_PROMPT.md).
2. Open the folder in your coding agent.
3. Paste the text of MASTER_PROMPT.md as the first message. The agent starts with T00.
4. After each task, read the five-line report. Say "continue" for the next task. Look at the screenshots yourself after T04, T05, T06 and every room.
5. If the agent drifts or forgets something: start a fresh session and paste the master prompt again. The handoff note in docs/PROGRESS.md carries the state.

Files
- AGENTS.md: the rules the agent re-reads every session.
- docs/DESIGN.md, MOTION.md, ROOMS.md, COPY.md, WIRING.md: style, behavior, rooms, words, connections.
- docs/PROGRESS.md: current task and handoff note. docs/MAP.md appears after the first `npm run map`.
- docs/tasks/: one small card per task, T00 to T12. Tasks from T13 on are defined in docs/PROGRESS.md.
- scripts/check.mjs: tests the rules (file size, headers, colors, forbidden imports) and writes docs/MAP.md.
- scripts/shots.mjs: screenshots for visual review.
