# AGENTS.md: read this first, every session

Project: a one-page portfolio for a web generalist. Centerpiece: a real-3D isometric stack of six thick layers, like Lego plates. Each layer carries a dollhouse room. Scrolling lifts the layers off one at a time. English only for now. Structure everything so a second language can be added later.

## Session protocol (follow exactly)
START
1. Read this file.
2. Read docs/PROGRESS.md. It names the current task and holds the handoff note.
3. Read that task card in docs/tasks/. Read no other card.
4. Open only the files the card lists, plus the header comment of any file you import. To find anything else, search docs/MAP.md. Do not scan the repo.
WORK
5. Do one task. Touch only the files listed under "Files" in the card.
6. Before you create a file, check docs/MAP.md for an existing one.
7. Edit in small diffs. Never rewrite an existing file from memory. Re-open a file right before you edit it.
8. If you need a change outside the card, write it under "Needs" in docs/PROGRESS.md and carry on.
END
9. Run `npm run check`. Fix every error it prints.
10. Update docs/PROGRESS.md: mark the task, then write the handoff note (max 8 lines: what exists, what is next, gotchas).
11. Commit the task's changes with a clear message (user-approved git-per-task workflow; commits are the revert points).
12. Stop. Start the next task only when asked.

Long session or unsure what was decided earlier (about 15 tool calls on one task)? Stop. Re-read this file and the task card. Rewrite the handoff note. Continue.
Stuck after 3 attempts? Write it under "Blocked" in docs/PROGRESS.md and report it.

## Locked decisions (ask before you change any)
- Stack: Astro (static output), TypeScript strict, vanilla Three.js, GSAP. No React. No Lenis.
- English only now. All UI text lives in src/content/en.ts and is read through `t()`. Use CSS logical properties (margin-inline, padding-inline) so RTL can arrive later.
- Six layers, top to bottom: content, translation, seo, web-design-development, cms, infrastructure. The order lives only in src/config/layers.ts. (Approved redesign, 2026-11: design and frontend merged into web-design-development.)
- Slab thickness equals wall height (SLAB_T). Closed floor-to-floor spacing equals SLAB_T. Lift distance LIFT = FOOTPRINT + SLAB_T + 0.4. See docs/DESIGN.md.
- Motion is triggered, not scrubbed: one layer per scroll step, top layer first. See docs/MOTION.md.
- Every layer is clickable from its side at all times, including while stacked.
- Dual theme. Light theme is high-key: near-white background with a faint green-yellow cast, no dark slabs. Dark theme deepens surfaces to a blue-charcoal range while layer accents stay readable. Hex colors only in palette.ts (both themes) and tokens.css.
- Native document scroll is the source of truth.

## Folder map
src/config      content and tuning data only. Imports nothing.
src/content     UI strings (en.ts).
src/pages, layouts, sections   Astro pages and DOM sections.
src/styles      tokens.css, base.css, hud.css, doc.css, ladder.css, sections.css.
src/scene       all Three.js code. boot.ts is the entry. api.ts is the only door for the UI.
src/scene/stack slab.ts, stack.ts, state.ts, motion.ts, landing.ts, pick.ts, labels.ts
src/scene/rooms one folder per room id, plus props/ (shared kit) and shell.ts
src/ui          preview card, detail view, keyboard, dialog. Talks to the scene through scene/api.ts and lib/bus.ts only.
src/lib         ticker, bus, math, quality, reduced-motion.
docs            DESIGN, MOTION, ROOMS, WIRING, COPY, PROGRESS, QA, MAP (generated), tasks/.

## Hard rules
Code
- Every file is at most 200 lines. Split before that.
- Every file starts with a header: `/** @module name: one-line purpose. @see neighbor files */`. In .astro files, put it inside the frontmatter.
- Hex colors appear only in src/config/palette.ts and src/styles/tokens.css.
- A room folder never imports another room folder. It may import ../props/*, ../shell and config.
- scene/ never imports ui/, sections/ or pages/. ui/ reaches the scene only through scene/api.ts.
- Shared types live in src/config/types.ts. No `any`.
Scroll and input
- No wheel hijacking. No body scroll lock except while the detail view is open, and restore scroll exactly after.
- The canvas must not block vertical scroll: `touch-action: pan-y`. Decorative HUD has `pointer-events: none`. Only real controls take pointer events.
- The hero stage is a tall section with a sticky 100svh child. Scroll progress comes from real scroll position.
Performance
- Cap device pixel ratio at 1.75. Reuse geometries and materials. Use InstancedMesh for repeats.
- Shadow map 2048 on desktop, 1024 on mobile. Pause rendering when the stage is offscreen or the tab is hidden.
- Load Three.js with a dynamic import after first paint. The static poster is removed (user review 2026-11-06: the screenshot carried the previous version's header and copy); the stage holds the plain background until the canvas fades in, and the DOM cards carry no-WebGL.
Accessibility
- Visible focus rings. Every layer has a real button in the DOM layer-nav. Escape closes. Honor prefers-reduced-motion. All content reachable with JavaScript off.
Copy
- Follow docs/COPY.md. Active voice, concrete nouns, no adverbs, no em dashes.
Verification
- No browser automation. No Playwright, no screenshot or click harness, unless the check cannot be done any other way (and then say why in the handoff note). Verify with `npm run check`, `npm run build`, `npm run smoke`, a Node script that reads the source, or arithmetic on the tuning constants. These are fast and cheap; a browser run is the last resort.

## Definition of done (any task)
- `npm run check` passes.
- The task card's "Done when" list is checked item by item. Mark each item verified or not verified.
- docs/PROGRESS.md is updated.
