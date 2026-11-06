# ROOMS: the six dioramas

Rules for all rooms: footprint FOOTPRINT x FOOTPRINT, two back walls (-x, -z), wood floor, wall height WALL_H, props at most WALL_H x 0.95 tall. Target 35 to 80 meshes (count instances once). At least four distinct idle loops. At most 6 colors (DESIGN.md). Props come from the shared kit in rooms/props/. Each room is its own folder and imports nothing from another room.

Folder per room: `index.ts` (build), `layout.ts` (positions), `anim.ts` (idle loops). Copy `rooms/content/` as the template.

## 1 content (butter), top layer
Writing studio. Bookshelf with 24 instanced books. Writing desk with laptop. Mug with steam. Stack of paper sheets. Corkboard with six pinned notes. Rug. Editorial calendar on the wall (7 x 4 cells). Paper plane.
Loops: plane flies a loop; top sheet lifts and settles; pinned notes flutter.

## 2 translation (lilac)
Language studio. Desk with a dual-pane screen showing "Hello" and "سلام". Globe on a stand. Dictionary stack. Headphones. Two speech-bubble signs on the wall. Glossary cards on a board.
Loops: globe spins; the two bubbles pop in turn; screen text swaps pairs; cursor blinks; headphones bob slightly.

## 3 seo (peach)
Analytics command center. Dashboard wall with a bar chart and a line chart. Laptop. Ranking gauge on the desk. Magnifying glass on a stand. Keyword cards on a board joined by strings (crawl map). Funnel of three stacked trapezoids. Four metric tiles. Search-result panel. Podium with a "1".
Loops: bars change height; a scan line sweeps the line chart; metric numbers tick up; a glint sweeps the magnifier.

## 4 web-design-development (rose, blue accent)
One intentional design-and-development workspace, not two rooms side by side.
L-shaped workstation: the desk along the -z wall carries dual monitors (a self-typing
code editor and a browser preview), keyboard, rubber duck and the LED strip under the
desk lip; the drafting-table arm carries tablet, stylus and the color-chip fan.
Inspiration wall on -z: mood board with swatches beside the component-card grid, framed
as one continuous wall. Standards panel on -x: token swatch rack and performance gauge.
Easel with the self-drawing canvas in the right corner. Chair or stool at the desk.
Rug.
Loops: code types itself; a stroke draws on the easel canvas; swatches highlight in turn;
gauge needle moves; LED strip shifts color; duck bobs.
Mesh budget: curate toward 80 (both source rooms totaled ~135; merge the desks, drop
duplicate furniture, fold the poster into the mood-board wall).

## 5 cms (sage)
Publishing studio. Editor desk. Large monitor with a block-editor UI. Keyboard. Content-card grid on the desk. Three floating content blocks. Editorial calendar. Pinned cards. Shelf with small plugin modules. Draft documents. Publish status lights.
Loops: blocks float; monitor blocks rearrange; publish light pulses; calendar dots tick.

## 6 infrastructure (steel), bottom layer
Server facility. Two racks with rows of LEDs. Cable trays. Floor tile pattern. Network panel with patch cables. Router. Backup battery unit. Two cooling fans. Coiled cable. Clipboard. Warning decals.
Loops: LEDs blink in different patterns; fans spin; a screen graph scrolls; cable status lights pulse; ambient light shifts slightly.
