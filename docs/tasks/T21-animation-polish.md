# T21 Stack animation, camera, and interaction polish

Goal: the interactive experience feels deliberate, coordinated, and physically coherent.
Read first: AGENTS.md, docs/MOTION.md.
Files: src/scene/stack/motion.ts, landing.ts, pick.ts, src/scene/camera.ts, loop.ts as needed.
Scope: review lift/slam easing and timing, perceived weight, impact and secondary motion, camera follow and framing, hover/selection feedback, detail-panel transitions, reverse and rapid scrolling, room-animation coordination. Preserve the interaction model, native scrolling, no wheel hijacking.
Done when:
- Layer transitions feel consistent and intentional (screenshots/numerical checks).
- Camera behavior supports the composition.
- Existing interactions remain functional.
- Timing does not create visual conflicts; both themes work during transitions.
Do not touch: rooms/, ui/, sections/.
