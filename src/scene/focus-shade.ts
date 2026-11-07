/** @module scene/focus-shade: fades every floor except the expanded one, then takes the invisible floors out of the scene. @see src/scene/focus.ts, docs/MOTION.md (Detail view) */
import type { Material, Mesh, Object3D } from 'three';

const FADE_RATE = 1 / 0.25; // full fade in 0.25s (docs/MOTION.md Detail view)

export interface Shade {
  /** Fades everything except slab `keep` to nothing. */
  only(keep: number): void;
  /** Brings every floor back to full strength and into the scene. */
  all(): void;
  /** Advances the fade toward its target; robust at any frame rate. */
  update(dt: number, open: boolean, activeIdx: number): void;
}

export function createShade(slabs: Object3D[]): Shade {
  // Per-slab material lists so the other floors can fade out of the composition.
  const mats = slabs.map((slab) => {
    const set = new Set<Material>();
    slab.traverse((o) => {
      const mesh = o as Mesh;
      if (mesh.isMesh && Array.isArray(mesh.material)) mesh.material.forEach((m) => set.add(m));
      else if (mesh.isMesh) set.add(mesh.material as Material);
    });
    return [...set];
  });
  // Which materials ship transparent (the number engraving, the icon decal, the
  // AO strips). They must stay transparent: alpha blending off renders the empty
  // pixels of their canvas textures black, which blacks out a whole slab face.
  const baseTransparent = mats.map((list) => list.map((m) => m.transparent));
  // A persistent per-frame value, not a transient tween, so slow frames can
  // never skip or restore it.
  const fade = slabs.map(() => 1);
  const target = slabs.map(() => 1);
  const hidden = slabs.map(() => false);

  /** A floor faded to nothing leaves the scene; restored the moment it returns. */
  function setHidden(i: number, on: boolean): void {
    if (hidden[i] === on) return;
    hidden[i] = on;
    slabs[i].visible = !on;
  }

  function setOpacity(i: number, o: number): void {
    const list = mats[i];
    const wasTransparent = baseTransparent[i];
    for (let k = 0; k < list.length; k++) {
      const m = list[k];
      m.opacity = o;
      // Restore the material's own transparency, never force it off: the
      // engraving and decal materials are transparent by design.
      m.transparent = o < 1 || wasTransparent[k];
    }
  }

  return {
    only(keep: number): void {
      for (let i = 0; i < slabs.length; i++) target[i] = i === keep ? 1 : 0;
    },

    all(): void {
      for (let i = 0; i < slabs.length; i++) {
        target[i] = 1;
        setHidden(i, false);
      }
    },

    update(dt: number, open: boolean, activeIdx: number): void {
      const step = FADE_RATE * Math.min(Math.max(dt, 0), 0.1);
      for (let i = 0; i < slabs.length; i++) {
        if (fade[i] !== target[i]) {
          if (fade[i] < target[i]) fade[i] = Math.min(target[i], fade[i] + step);
          else fade[i] = Math.max(target[i], fade[i] - step);
          setOpacity(i, fade[i]);
        }
        // Invisible geometry still casts shadows and writes depth, so a floor
        // that has faded to nothing is taken out of the scene outright.
        setHidden(i, open && i !== activeIdx && fade[i] === 0);
      }
    },
  };
}