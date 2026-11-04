/** @module config/types: shared contracts for config, scene and UI. @see docs/WIRING.md, src/config/layers.ts */
import type * as THREE from 'three';

export type PaletteKey = string; // a key of PALETTE in src/config/palette.ts
export type LayerId = string;

export interface Vec3 { x: number; y: number; z: number }

export interface Sample { title: string; blurb: string; tags: string[]; href?: string }

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

export interface RoomContext { footprint: number; wallH: number; mat: MaterialKit; props: PropKit }

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
}

/** Debug state on window.__stack, refreshed every frame (docs/WIRING.md). */
export interface StackDebugState { step: number; u: number[]; e: number[]; restY: number[]; ids: string[] }
