/** @module scene/stack/plaster: a procedural craft texture for the slab body: a near-white base with seeded speckles and brushed strokes, so the material color shows through and the theme re-tints it in place. @see src/scene/stack/slab.ts, src/config/palette.ts (colors only there) */
import * as THREE from 'three';
import { PALETTE, darken, lighten } from '@/config/palette';

export interface PlasterTexture {
  tex: THREE.CanvasTexture;
  /** Redraws the canvas for a new slab color (theme switch). */
  redraw(baseHex: string): void;
}

/** Deterministic PRNG so every slab shares one identical texture. */
function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

/** Relative luminance of a #rrggbb color, 0..1. */
function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Picks the two speckle directions for a base color: on a dark base the flecks
 * must be lighter than the surface and the chips darker, on a light base the
 * reverse, so the texture reads in both themes.
 */
function fleckColors(baseHex: string, rand: () => number): { fleck: (k: number) => string; chip: (k: number) => string } {
  const dark = luminance(baseHex) < 0.5;
  return {
    fleck: dark ? (k) => lighten(baseHex, k) : (k) => darken(baseHex, k),
    chip: dark ? (k) => darken(baseHex, k) : (k) => lighten(baseHex, k),
  };
}

export function makePlasterTexture(): PlasterTexture {
  const SIZE = 256;
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;

  function redraw(baseHex: string): void {
    const rand = lcg(20261111);
    const fc = fleckColors(baseHex, rand);
    // Near-white base: the material color multiplies through.
    ctx.fillStyle = PALETTE.white;
    ctx.fillRect(0, 0, SIZE, SIZE);
    // Brushed horizontal strokes, like a trowelled surface.
    for (let i = 0; i < 90; i++) {
      const y = rand() * SIZE;
      const len = 30 + rand() * 120;
      const x = rand() * SIZE - 20;
      ctx.strokeStyle = fc.fleck(0.05 + rand() * 0.06);
      ctx.globalAlpha = 0.05 + rand() * 0.05;
      ctx.lineWidth = 0.6 + rand() * 1.2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + len, y + (rand() - 0.5) * 3);
      ctx.stroke();
    }
    // Speckles: flecks in the surface direction, a few chips in the other.
    for (let i = 0; i < 700; i++) {
      const x = rand() * SIZE;
      const y = rand() * SIZE;
      const r = 0.4 + rand() * 1.1;
      const dark = rand() > 0.22;
      ctx.fillStyle = dark ? fc.fleck(0.1 + rand() * 0.12) : fc.chip(0.5 + rand() * 0.3);
      ctx.globalAlpha = dark ? 0.05 + rand() * 0.07 : 0.08 + rand() * 0.08;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    tex.needsUpdate = true;
  }

  redraw(PALETTE.slab);
  return { tex, redraw };
}

/**
 * Plank texture for the wood deck: near-white base with plank seams and grain
 * strokes, re-tinted from the wood color on a theme switch.
 */
export function makeWoodTexture(): PlasterTexture {
  const SIZE = 256;
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;

  function redraw(baseHex: string): void {
    const rand = lcg(4242);
    const fc = fleckColors(baseHex, rand);
    ctx.fillStyle = PALETTE.white;
    ctx.fillRect(0, 0, SIZE, SIZE);
    // Plank seams: vertical dark lines every 64px, slightly wavy. On a dark
    // deck the seams read as light grooves instead (fleck direction).
    for (let p = 0; p <= SIZE; p += 64) {
      ctx.strokeStyle = fc.chip(0.28);
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(p + (rand() - 0.5) * 3, 0);
      ctx.bezierCurveTo(p + (rand() - 0.5) * 6, SIZE * 0.33, p + (rand() - 0.5) * 6, SIZE * 0.66, p + (rand() - 0.5) * 3, SIZE);
      ctx.stroke();
    }
    // Grain: long soft strokes along each plank.
    for (let i = 0; i < 160; i++) {
      const plank = Math.floor(rand() * 4);
      const x = plank * 64 + 4 + rand() * 56;
      const y = rand() * SIZE;
      ctx.strokeStyle = rand() > 0.5 ? fc.fleck(0.12 + rand() * 0.1) : fc.chip(0.35);
      ctx.globalAlpha = 0.06 + rand() * 0.06;
      ctx.lineWidth = 0.5 + rand();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (rand() - 0.5) * 4, y + 20 + rand() * 60);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    tex.needsUpdate = true;
  }

  redraw(PALETTE.wood);
  return { tex, redraw };
}
