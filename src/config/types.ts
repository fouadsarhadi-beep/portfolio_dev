/** @module config/types: shared contracts for config, scene and UI. @see docs/WIRING.md, src/config/layers.ts */
import type * as THREE from 'three';

export type PaletteKey = string; // a key of PALETTE in src/config/palette.ts
export type LayerId = string;

export interface Vec3 { x: number; y: number; z: number }

export type DocKind = 'pdf' | 'doc' | 'sheet';

/**
 * One sample document, read in the doc viewer (src/ui/doc-viewer.ts).
 * `html` is authored markup: headings, paragraphs, lists, emphasis, tables. It
 * is inserted as-is, so it is trusted repo content, never user input.
 * `text` is plain prose, escaped on the way in. `rows` is a sheet (first row is
 * the header). `src` is optional: when the real file exists, the reader offers it.
 */
export interface SampleDocument {
  kind: DocKind;
  meta?: string;
  html?: string;
  text?: string[];
  rows?: string[][];
  src?: string;
}

/**
 * A work sample. `icon` names a glyph in src/config/sample-icons.ts; without it
 * the tile falls back to the layer icon. `doc` keys into src/config/documents.ts;
 * a sample without one opens nothing. `href` is unused for now.
 */
export interface Sample {
  title: string; blurb: string; tags: string[]; href?: string; icon?: string; doc?: string;
}

export interface LayerConfig {
  id: string; number: string; title: string; short: string; intro: string;
  color: PaletteKey; icon: string; // SVG path data, 24x24
  capabilities: string[]; toolkit: string[]; samples: Sample[]; room: string;
}

/** Named shared materials a room may use, e.g. mat.wall, mat.wood. */
export interface MaterialKit { [name: string]: THREE.Material }

/** A prop factory. Props come only from src/scene/rooms/props/. */
export interface PropFactory { (ctx: RoomContext, opts?: Record<string, unknown>): THREE.Object3D }
export interface PropKit { [name: string]: PropFactory }

export interface RoomContext { footprint: number; wallH: number; mat: MaterialKit; props: PropKit; layer: LayerConfig }

export interface RoomInstance {
  group: THREE.Group;
  update(time: number, dt: number, exposure: number): void; // exposure 0..1
  dispose(): void;
}

export type RoomBuilder = (ctx: RoomContext) => RoomInstance;

/** Typed bus events (docs/WIRING.md). Used by src/lib/bus.ts. */
export interface StackEvents {
  'layer:hover': { id: LayerId | null };
  'layer:select': { id: LayerId };
  'layer:open': { id: LayerId };
  'layer:close': undefined;
  'step:change': { step: number };
  'theme:change': { name: 'light' | 'dark' };
}

/** Debug state on window.__stack, refreshed every frame (docs/WIRING.md). */
export interface StackDebugState {
  step: number; overview: number; u: number[]; e: number[]; restY: number[]; spreadY: number[]; ids: string[];
}
