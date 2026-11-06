# T31 — Page-wide visual harmony

Spec: user brief 2026-11-05 (T28-T32 redesign batch). Implemented 2026-11-06.

## What was done
- Added two shadow tokens (`--shadow-card`, `--shadow-lift`) built from `--ink` with `color-mix`, and removed `--hard-offset` (the last consumer, the cartoon offset shadow, is gone).
- Shared button (`.btn` in sections.css): solid ink pill, `--bg` text, soft shadow, 1px lift on hover. Used by Contact and the work-page back link.
- About: layer diagram rows now read as a hairline list with tabular number kickers (no filled pastel chips). The three panels are surface cards with the same 2px accent rule as the hover/expanded cards.
- Toolkit: tiles are hairline surface cards with a hover lift; the colored `.swatch` is replaced by the layer icon (`SVG` from `LAYERS[].icon`, stroked in `--ink-soft`), so floors are distinguished by number, title and iconography.
- Chips: 1px hairline, `--ink-soft`, weight 500 (was 1.5px + 600).
- Contact panel: 1px border + soft shadow (removed the butter hard-offset shadow); social links are hairline pills that go ink on hover.
- HUD: layer pills are surface pills with a hairline border, 1px lift and a deeper border on hover; the number is a small tabular kicker instead of a colored chip. Theme toggle uses the same hairline rule. Progress bar is neutral (`--line` segments, `--ink` when reached) instead of per-layer colors.
- Section headings carry a 28x2 hairline rule above them (same rhythm as the card accent rules).
- Work pages: the 120px colored numeral is now a 14px kicker with an accent rule; capability boxes and sample cards are hairline surface cards without colored side bars.
- No-WebGL fallback cards follow the same surface + accent rule treatment.
- Theme switch/persistence untouched. No new copy, no new sections, no onboarding popups, no day/night redesign.

## Verified (code-level; visual pass left to the user per request)
- `npm run check`: PASS (88 files). `npm run build`: PASS (7 pages).
- Computed-style probe before handing over: every card/panel/tile/pill resolves to `1px solid var(--line)`, 14px radius (or pill), `--shadow-card`; `.swatch` no longer exists; `.tile-icon path` renders; no horizontal overflow at desktop width.
- No `2px solid var(--ink)` borders, `--hard-offset` uses or 10px colored side bars remain anywhere in `src` (grep).

## Known limits
- Hover tones are subtle by design; on very low-contrast displays the 1px lift is the main affordance.
- Responsive tuning of these new styles (360/390/768, dark theme) is T32 + the user's live pass.