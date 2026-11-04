# ROOMS: the seven dioramas

Rules for all rooms: footprint FOOTPRINT x FOOTPRINT, two back walls (-x, -z), wood floor, wall height WALL_H, props at most WALL_H x 0.95 tall. Target 35 to 80 meshes (count instances once). At least four distinct idle loops. At most 6 colors (DESIGN.md). Props come from the shared kit in rooms/props/. Each room is its own folder and imports nothing from another room.

Folder per room: `index.ts` (build), `layout.ts` (positions), `anim.ts` (idle loops). Copy `rooms/content/` as the template.

## 1 content (butter), top layer
Writing studio. Bookshelf with 24 instanced books. Writing desk with laptop. Mug with steam. Stack of paper sheets. Corkboard with six pinned notes. Floor lamp. Plant. Rug. Editorial calendar on the wall (7 x 4 cells). Paper plane.
Loops: plane flies a loop; lamp glow pulses; plant sways; top sheet lifts and settles; pinned notes flutter.

## 2 translation (lilac)
Language studio. Desk with a dual-pane screen showing "Hello" and "سلام". Globe on a stand. Dictionary stack. Headphones. Two speech-bubble signs on the wall. Glossary cards on a board. Plant.
Loops: globe spins; the two bubbles pop in turn; screen text swaps pairs; cursor blinks; headphones bob slightly.

## 3 seo (peach)
Analytics command center. Dashboard wall with a bar chart and a line chart. Laptop. Magnifying glass on a stand. Keyword cards on a board joined by strings (crawl map). Funnel of three stacked trapezoids. Four metric tiles. Search-result panel. Podium with a "1".
Loops: bars change height; a scan line sweeps the line chart; metric numbers tick up; a glint sweeps the magnifier.

## 4 design (rose)
Design studio. Drafting table. Large mood board with swatches and cards. Easel with a canvas. Color-chip fan. Tablet and stylus. Poster with a big "Aa". Stool. Plant.
Loops: swatches highlight in turn; a stroke draws on the canvas; the poster glyph swaps; the chip fan opens and closes slowly.

## 5 frontend (blue)
Development workspace. Dual monitors: one shows a code editor, one a browser preview. Keyboard. Rubber duck. Stool. Component cards on a wall grid. Token swatch rack. Performance gauge. LED strip under the desk.
Loops: code types itself; cards snap into the grid; gauge needle moves; LED strip shifts color; duck bobs.

## 6 cms (sage)
Publishing studio. Editor desk. Large monitor with a block-editor UI. Keyboard. Mug. Desk lamp. Three floating content blocks. Editorial calendar. Pinned cards. Shelf with small plugin modules. Draft documents. Publish status lights. Plant.
Loops: blocks float; monitor blocks rearrange; plant sways; publish light pulses; calendar dots tick.

## 7 infrastructure (steel), bottom layer
Server facility. Two racks with rows of LEDs. Cable trays. Floor tile pattern. Network panel with patch cables. Router. Backup battery unit. Two cooling fans. Coiled cable. Clipboard. Warning decals.
Loops: LEDs blink in different patterns; fans spin; a screen graph scrolls; cable status lights pulse; ambient light shifts slightly.
