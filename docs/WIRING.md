# WIRING: how the parts connect

## Data flow
config/layers.ts (one LayerConfig per layer)
  -> Astro pages and sections render DOM, layer-nav, /work/<id> pages and the no-JS fallback
  -> scene/boot.ts builds the stack and rooms from the same config
UI <-> scene talk only through two things:
  1. src/scene/api.ts (functions the UI may call)
  2. src/lib/bus.ts (typed events)
Nothing else crosses that line.

## Contracts (src/config/types.ts is the single source)
```ts
export type PaletteKey = string; // a key of PALETTE
export interface Sample { title: string; blurb: string; tags: string[]; href?: string }
export interface LayerConfig {
  id: string; number: string; title: string; short: string; intro: string;
  color: PaletteKey; icon: string; // SVG path data
  capabilities: string[]; toolkit: string[]; samples: Sample[]; room: string;
}
export interface RoomContext { footprint: number; wallH: number; mat: MaterialKit; props: PropKit }
export interface RoomInstance {
  group: THREE.Group;
  update(time: number, dt: number, exposure: number): void; // exposure 0..1
  dispose(): void;
}
export type RoomBuilder = (ctx: RoomContext) => RoomInstance;
```
Bus events: `layer:hover(id|null)`, `layer:select(id)`, `layer:open(id)`, `layer:close`, `step:change(step)`.
scene/api.ts exports: `focusLayer(id)`, `releaseFocus()`, `setHover(id|null)`, `getLayerRect(id)` (screen rect for labels and cards), `getState()`.
Debug state: `window.__stack = { step, u, e, restY, ids }`, refreshed every frame. Tests read it.

## Routes
- `/` : the experience.
- `/work/<id>` : one static page per layer (getStaticPaths from config). It is the SEO page and the no-JS fallback. The 3D detail view uses pushState to the same URL and shows the same content.

## How to add a layer
1. Add a LayerConfig to src/config/layers.ts (this sets the order).
2. Add a folder src/scene/rooms/<room>/ with index.ts exporting `build: RoomBuilder`. Copy src/scene/rooms/content/ as the template.
3. Register it in src/scene/rooms/index.ts.
4. Run `npm run check`.
No other file changes. If one does, the wiring is wrong; fix the wiring.

## How to add a prop
Add it to src/scene/rooms/props/<name>.ts as `export const makeX = (ctx, opts) => THREE.Object3D`. Export it from props/index.ts. Rooms import props only through props/index.ts.
