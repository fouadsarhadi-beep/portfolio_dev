# T01 Config and types
Goal: all content and tuning data in typed config files. No behavior yet.
Read first: AGENTS.md, docs/WIRING.md (Contracts), docs/DESIGN.md (Palette, Geometry constants), docs/COPY.md.
Files: src/config/types.ts, palette.ts, tuning.ts, site.ts, layers.ts, src/content/en.ts, src/lib/i18n.ts (the `t()` helper).
Steps
1. types.ts: the interfaces from WIRING.md.
2. palette.ts: PALETTE from DESIGN.md plus `lighten`, `darken`.
3. tuning.ts: the geometry constants, STEP_VH, camera tunables.
4. site.ts: person, role, email placeholder, social links, availability.
5. layers.ts: seven LayerConfig entries in the locked order, with copy from COPY.md. Icon = a simple SVG path per layer.
6. en.ts: UI strings (nav labels, buttons, section headings, hints). i18n.ts: `t(key)`.
Done when
- `npm run check` passes. layers.ts has 7 entries, each with 4 capabilities and 2 samples. No hex outside palette.ts.
Do not touch: scene/, sections/, pages/.
