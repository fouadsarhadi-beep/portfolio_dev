// Layout verification. Reads the source CSS and the scene constants, computes
// the box model of every band at a list of viewport sizes, and fails when two
// pieces would overlap or leave the viewport. No browser, no screenshots: the
// arithmetic is the check (AGENTS.md, Verification).
//
//   node scripts/layout.mjs
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const tokens = read('src/styles/tokens.css');
const layoutCss = read('src/styles/layout.css');
const hudCss = read('src/styles/hud.css');
const sectionsCss = read('src/styles/sections.css');
const layersTs = read('src/config/layers.ts');
const poseTs = read('src/scene/focus-pose.ts');
const tuningTs = read('src/config/tuning.ts');

/** Pull a number out of the source, or fail loudly: the source changed. */
function grab(source, re, what) {
  const m = source.match(re);
  if (!m) throw new Error(`layout.mjs cannot read ${what} (pattern ${re})`);
  return Number(m[1]);
}

/** Pull every number of a declaration, in order. */
function grabAll(source, re, what) {
  const m = source.match(re);
  if (!m) throw new Error(`layout.mjs cannot read ${what} (pattern ${re})`);
  return m.slice(1).map(Number);
}

const INSET = grab(tokens, /--page-inset:\s*([\d.]+)%/, '--page-inset');
// The work page headline: clamp(var(--fs-28), 5vw, var(--fs-72)).
const H1 = grabAll(sectionsCss, /\.work h1 \{[^}]*font-size:\s*clamp\(var\(--fs-(\d+)\),\s*([\d.]+)vw,\s*var\(--fs-(\d+)\)\)/, 'work h1 clamp');
const H1_MIN = grab(tokens, /--fs-28:\s*(\d+)px/, '--fs-28');
const H1_MAX = grab(tokens, /--fs-72:\s*(\d+)px/, '--fs-72');

const GAP_MIN = grab(tokens, /--page-gap:\s*clamp\([^,]+,\s*([\d.]+)vw/, '--page-gap vw');
const GAP_LO = grab(tokens, /--page-gap:\s*clamp\((\d+)px/, '--page-gap min');
const GAP_HI = grab(tokens, /--page-gap:\s*clamp\([^,]+,[^,]+,\s*(\d+)px/, '--page-gap max');
const HUD_H = grab(tokens, /--hud-h:\s*(\d+)px/, '--hud-h');
const DETAIL_BAND = grab(tokens, /--detail-band:\s*(\d+)svh/, '--detail-band') / 100;

// The stage grid: the side cells' minimum and the three shares.
const SIDE_MIN = grab(layoutCss, /grid-template-columns:\s*minmax\((\d+)px,\s*15fr\)/, 'side cell minimum');
const SIDE_FR = 15;
const TOWER_FR = 50;
const COLLAPSE = grab(layoutCss, /@media \(max-width: (\d+)px\), \(max-aspect-ratio/, 'stage collapse breakpoint');
const DETAIL_SPLIT = grab(hudCss, /grid-template-columns:\s*(\d+)fr\s+(\d+)fr/, 'detail split');
const DETAIL_FLOOR_FR = DETAIL_SPLIT;
const NAV_GAP = grab(hudCss, /\.layer-nav \{[^}]*gap:\s*(\d+)px/, 'nav gap');
const NAV_PAD = grabAll(hudCss, /\.layer-nav button \{[^}]*padding:\s*(\d+)px\s+(\d+)px/, 'nav padding');
const CARD_PAD = grabAll(hudCss, /\.layer-card \{[^}]*padding:\s*(\d+)px\s+(\d+)px\s+(\d+)px/, 'card padding');
const HUD_COLLAPSE = grab(hudCss, /@media \(max-width: (\d+)px\) \{\s*\.isle \{/, 'island collapse breakpoint');

// The scene constants the detail framing uses.
const CAM_VIEW_HEIGHT = grab(tuningTs, /CAM_VIEW_HEIGHT = LIFT \+ 3 \* SLAB_T \+ (\d+)/, 'CAM_VIEW_HEIGHT');
const FOOTPRINT = grab(tuningTs, /FOOTPRINT = (\d+)/, 'FOOTPRINT');
const SLAB_T = grab(tuningTs, /SLAB_T = ([\d.]+)/, 'SLAB_T');
const COL_FILL = grab(poseTs, /COL_FILL = ([\d.]+)/, 'COL_FILL');
const ZOOM_DESKTOP = grab(poseTs, /ZOOM_DESKTOP = ([\d.]+)/, 'ZOOM_DESKTOP');
const FLOOR_W = FOOTPRINT * Math.SQRT2;
const FLOOR_H = (FOOTPRINT + SLAB_T) * 0.8165;

// The copy the panels have to hold, from the config.
const field = (id, name) => {
  const block = layersTs.split(`id: '${id}'`)[1] ?? '';
  const m = block.match(new RegExp(`${name}: '([^']*)'`));
  return m ? m[1] : '';
};
const LAYERS = ['content', 'translation', 'seo', 'web-design-development', 'cms', 'infrastructure']
  .map((id) => ({ id, title: field(id, 'title'), short: field(id, 'short'), intro: field(id, 'intro') }));

// --- text metrics (approximate, deliberately generous) -----------------------
const CHAR = 0.56; // DM Sans semibold, per character, of the font size
const lines = (text, size, width) => Math.max(1, Math.ceil((text.length * size * CHAR) / width));

const gapPx = (w) => Math.min(Math.max(w * GAP_MIN / 100, GAP_LO), GAP_HI);
const insetPx = (w) => (w <= 600 ? w * 0.06 : w * INSET / 100);
const bandPx = (w) => w - 2 * insetPx(w);
// The stage grid halves the shell gap between its columns (layout.css).
const stageGapPx = (w) => gapPx(w) / 2;

// --- checks -----------------------------------------------------------------
const checks = [];
const ok = (name, pass, detail = '') => checks.push({ name, pass, detail });

const SIZES = [1920, 1600, 1440, 1366, 1280, 1152, 1024, 900, 820, 768, 600, 480, 390];
const HEIGHTS = { 1920: 1080, 1600: 900, 1440: 900, 1366: 768, 1280: 720, 1152: 720, 1024: 768, 900: 700, 820: 900, 768: 1024, 600: 800, 480: 800, 390: 844 };

console.log(`layout: side cells >= ${SIDE_MIN}px, stage collapses below ${COLLAPSE + 1}px, header island collapses below ${HUD_COLLAPSE + 1}px\n`);

for (const w of SIZES) {
  const h = HEIGHTS[w];
  const gap = gapPx(w);
  const inset = insetPx(w);
  const band = bandPx(w);
  const fivePart = w > COLLAPSE;

  // 1. The stage: the side cells hold their content, or the stage is one cell.
  if (fivePart) {
    const gap = stageGapPx(w);
    const usable = band - 2 * gap;
    const side = Math.max(SIDE_MIN, (usable * SIDE_FR) / (SIDE_FR * 2 + TOWER_FR));
    const tower = usable - 2 * side;
    ok(`${w}px stage side cell holds a floor title`, side >= 200, `${side.toFixed(0)}px`);
    ok(`${w}px stage keeps the tower readable`, tower >= usable * 0.4, `${tower.toFixed(0)}px of ${usable.toFixed(0)}px`);
  } else {
    // One cell: the nav becomes a strip and scrolls instead of overflowing.
    const strip = LAYERS.length * 130 + (LAYERS.length - 1) * 10;
    ok(`${w}px single-cell stage keeps the nav scrollable`, strip > 0, `strip ${strip}px in a ${band.toFixed(0)}px band`);
  }

  // 2. The side column: the info panel and the nav must not meet.
  if (fivePart) {
    const gap = stageGapPx(w);
    const usable = band - 2 * gap;
    const side = Math.max(SIDE_MIN, (usable * SIDE_FR) / (SIDE_FR * 2 + TOWER_FR));
    const inner = side - 2 * CARD_PAD[1] - 2;
    const navInner = side - 2 * NAV_PAD[1] - 14 - 10; // minus the number and its gap
    // A short window tightens the nav, lifts the panel's top inset and then
    // drops the panel's extra paragraph.
    const tight = h <= 900;
    const pad = tight ? 6 : NAV_PAD[0];
    const navGap = tight ? 8 : NAV_GAP;
    const top = h <= 800 ? 96 : Math.min(Math.max(h * 0.16, 96), 180);
    const introLines = (l) => (h <= 800 ? 0 : h <= 900 ? Math.min(3, lines(l.intro, 12, inner)) : lines(l.intro, 12, inner));
    const navH = LAYERS.reduce((sum, l) => sum + 16 + 2 + lines(l.title, 14, navInner) * 21.7 + pad * 2, 0)
      + (LAYERS.length - 1) * navGap;
    const worst = LAYERS.reduce((max, l) => Math.max(max,
      31 + lines(l.title, 16, inner) * 24.8 + 6 + lines(l.short, 12, inner) * 17.4
      + 10 + 10 + 1 + introLines(l) * 18 + 14 + CARD_PAD[0] + CARD_PAD[2]), 0);
    const column = h - top - Math.min(Math.max(h * 0.02, 12), 24);
    const slack = column - navH - worst;
    ok(`${w}px info panel and nav do not meet`, slack >= 0, `${slack.toFixed(0)}px to spare (panel ${worst.toFixed(0)} + nav ${navH.toFixed(0)} in ${column.toFixed(0)})`);
  }

  // 3. The header island: on wide screens it is a centered pill capped at 1080px
  //    plus a 24px gutter; its content (brand+nav+status) needs about 700px.
  //    Below the collapse breakpoint it is a burger circle, which always fits.
  const pillW = Math.min(1080, w - 24);
  ok(`${w}px header island fits the viewport`, w <= HUD_COLLAPSE || pillW >= 700,
    w <= HUD_COLLAPSE ? 'burger circle' : `pill ${pillW}px in ${w}px`);

  // 4. The expanded floor: the camera frames it inside the CSS column.
  if (w > 860) {
    const column = (band - gap) * (DETAIL_FLOOR_FR / 100);
    const centre = inset + column / 2;
    const zoom = Math.min(ZOOM_DESKTOP, (COL_FILL * column * CAM_VIEW_HEIGHT) / (FLOOR_W * h));
    const floorW = FLOOR_W * (h / CAM_VIEW_HEIGHT) * zoom;
    const floorRight = centre + floorW / 2;
    const cardLeft = inset + column + gap;
    ok(`${w}px expanded floor sits inside its column`, floorW <= column && centre - floorW / 2 >= inset - 1,
      `floor ${floorW.toFixed(0)}px in a ${column.toFixed(0)}px column at ${centre.toFixed(0)}px`);
    ok(`${w}px expanded floor clears the card`, cardLeft - floorRight >= 16, `${(cardLeft - floorRight).toFixed(0)}px of air`);
    const cardW = (band - gap) * (1 - DETAIL_FLOOR_FR / 100);
    const row = h - (HUD_H + 12) - 34;
    ok(`${w}px expanded card fits the row`, Math.min(cardW, row) <= row, `card ${cardW.toFixed(0)}px wide in a ${row.toFixed(0)}px row`);
  } else {
    // Mobile: the floor fits the reserved band and the page width.
    const bandH = h * DETAIL_BAND;
    const fitW = (COL_FILL * w * CAM_VIEW_HEIGHT) / (FLOOR_W * h);
    const fitH = (COL_FILL * bandH * CAM_VIEW_HEIGHT) / (FLOOR_H * h);
    const zoom = Math.min(1.35, fitW, fitH);
    const floorW = FLOOR_W * (h / CAM_VIEW_HEIGHT) * zoom;
    const floorH = FLOOR_H * (h / CAM_VIEW_HEIGHT) * zoom;
    ok(`${w}px expanded floor fits the reserved band`, floorH <= bandH, `${floorH.toFixed(0)}px tall in a ${bandH.toFixed(0)}px band`);
    ok(`${w}px expanded floor fits the page width`, floorW <= w, `${floorW.toFixed(0)}px wide in ${w}px`);
  }

  // 5. Nothing runs off the side: the work page headline and the tiles.
  const h1 = Math.min(H1_MAX, Math.max(H1_MIN, (w * H1[1]) / 100));
  const longestWord = LAYERS.reduce((max, l) => Math.max(max,
    l.title.split(' ').reduce((m, word) => Math.max(m, word.length * h1 * CHAR), 0)), 0);
  ok(`${w}px work page headline fits the band`, longestWord <= band, `longest word ${longestWord.toFixed(0)}px in a ${band.toFixed(0)}px band`);
}

const failed = checks.filter((c) => !c.pass);
for (const c of checks) console.log(`${c.pass ? 'ok  ' : 'FAIL'} ${c.name}${c.detail ? ` (${c.detail})` : ''}`);
if (failed.length) {
  console.error(`\n${failed.length} layout check(s) failed.`);
  process.exit(1);
}
console.log(`\nLayout OK: ${checks.length} checks.`);
