# T12 QA and report
Goal: verify, fix and report honestly.
Read first: AGENTS.md, docs/MOTION.md.
Files: docs/QA.md (create), fixes anywhere the QA finds a bug (list each file in PROGRESS.md).
Run each test. Mark verified or not verified. Never mark a test verified without running it.
1 Page loads at the top. 2 Stack starts as one solid column. 3 Wheel scroll works at once. 4 Trackpad. 5 Touch. 6 Keyboard (arrows, Page Down, Space). 7 Slow scroll separates the stack fully. 8 Layers lift in order, top first. 9 No slab intersects another. 10 Scrolling up restacks in reverse order. 11 Landing effects play. 12 About reachable. 13 Toolkit reachable. 14 Contact reachable. 15 Detail view opens. 16 Detail view closes and restores state. 17 Reduced motion keeps content reachable. 18 No console errors. 19 `npm run build` passes. 20 `npm run check` passes.
Done when
- docs/QA.md lists all 20 with a result and a note. PROGRESS.md "Not verified yet" lists what could not run.
- Final report: what was built, what is verified, what is not, known issues, how to run it.
