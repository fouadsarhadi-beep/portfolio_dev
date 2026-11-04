# T06 Scroll state and motion
Goal: scrolling lifts layers one at a time. Scrolling up slams them back.
Read first: AGENTS.md, docs/MOTION.md (all of Scroll mapping, State, Lift, Slam, Debug), src/config/tuning.ts.
Files: src/scene/stack/state.ts, motion.ts, landing.ts, edit stack.ts and boot.ts, scripts/verify-stack.mjs.
Steps
1. state.ts: step from scroll with hysteresis, the `u` and `e` arrays, the invariant, `window.__stack`.
2. motion.ts: GSAP tweens on the `u` array (not on object transforms). Kill and replace tweens on the same index. Lift and slam timings per MOTION.md.
3. landing.ts: squash, shadow pulse, impact ring, camera jolt, prop reaction.
4. Rooms hide when e < 0.02 and rise with exposure.
5. verify-stack.mjs: Playwright script. Scroll to s = 0, 0.5 x STEPS, STEPS, then back to 0. Read `window.__stack` and assert the three checks in MOTION.md Debug. Exit 1 on failure.
Done when
- A slow scroll lifts layers 0..5 in order. Scrolling up restacks them in reverse order.
- `u[i] >= u[i+1]` always, including during a fast scroll jump.
- verify-stack.mjs passes. If Playwright cannot run, write that under "Not verified yet".
Do not touch: ui/, sections/.
