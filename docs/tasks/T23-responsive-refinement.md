# T23 Responsive visual refinement

Goal: desktop, tablet, and mobile each get a deliberate composition.
Read first: AGENTS.md (Hard rules), docs/DESIGN.md (Responsive).
Files: src/styles/*.css, src/sections/*.astro, src/config/tuning.ts (mobile framing) as needed.
Scope: stack proportions and visibility, camera framing, room readability, layer labels, HUD placement, detail panels, typography, theme toggle placement, scroll behavior, rendering complexity on low-power devices. Mobile is a distinct composition; the stack stays the primary focus.
Done when:
- 360px has no horizontal scroll; the stack stays prominent and readable.
- Interface elements do not overlap or obscure content.
- Both themes work at supported sizes.
- No unnecessary desktop-only assumptions remain.
Do not touch: rooms/.
