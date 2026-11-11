/** @module ui/nav-level: levels the layer-nav pills with their floors: each frame, every slab's screen position is projected through the camera and its pill is placed at that height inside the side column (min-gap spreading keeps them readable when floors are stacked). Active only in the five-part stage; in the collapsed one-cell stage the nav is a bottom strip and the CSS owns it. @see src/sections/Hero.astro, src/lib/bus.ts, src/styles/hud.css (.layer-nav) */
import type * as THREE from 'three';
import { LAYERS } from '@/config/layers';
import { bus } from '@/lib/bus';

const MIN_GAP = 8;

interface SceneDebug {
  camera: THREE.OrthographicCamera;
  scene: THREE.Scene;
  three: { Vector3: typeof THREE.Vector3 };
}

export function initNavLevel(): void {
  const nav = document.querySelector<HTMLElement>('.layer-nav');
  const side = document.querySelector<HTMLElement>('.stage-side');
  if (!nav || !side) return;
  const items = [...nav.querySelectorAll<HTMLLIElement>('li')];
  if (items.length !== LAYERS.length) return;

  let detail = false;
  bus.on('layer:open', () => { detail = true; });
  bus.on('layer:close', () => { detail = false; });

  const frame = (): void => {
    requestAnimationFrame(frame);
    // Nothing moves while the tab is hidden; skip the whole pass.
    if (document.hidden) return;
    // three itself comes from the scene debug handle, so this module stays out
    // of the eager chunk (three loads after first paint, src/scene/boot.ts).
    const sc = (window as unknown as Record<string, unknown>).__scene as SceneDebug | undefined;
    const stage = document.querySelector<HTMLElement>('.stage-grid');
    // Five-part stage only: more than one grid column means the side cell exists.
    const fivePart = stage !== null
      && getComputedStyle(stage).gridTemplateColumns.split(' ').length > 1;
    if (!sc || !fivePart || detail) {
      if (nav.classList.contains('leveled')) {
        nav.classList.remove('leveled');
        for (const li of items) li.style.transform = '';
      }
      return;
    }
    const rect = side.getBoundingClientRect();
    if (rect.height < 10 || rect.bottom < 0 || rect.top > innerHeight) return;

    const padBottom = Math.min(Math.max(innerHeight * 0.02, 12), 24);
    const canvas = document.querySelector<HTMLElement>('#canvas-mount');
    const cr = canvas ? canvas.getBoundingClientRect() : rect;

    // Project each slab centre to a y inside the side column.
    const targets: { i: number; y: number }[] = [];
    for (let i = 0; i < LAYERS.length; i++) {
      const slab = sc.scene.getObjectByName(`slab-${LAYERS[i].id}`) as THREE.Object3D | null;
      if (!slab) continue;
      const ndc = new sc.three.Vector3(slab.position.x, slab.position.y, slab.position.z).project(sc.camera);
      const yInCanvas = ((1 - ndc.y) / 2) * cr.height;
      targets.push({ i, y: cr.top - rect.top + yInCanvas });
    }
    if (targets.length !== items.length) return;

    // Min-gap spreading, top to bottom, so stacked floors stay readable.
    targets.sort((a, b) => a.y - b.y);
    const h = items.map((li) => li.offsetHeight || 40);
    for (let k = 1; k < targets.length; k++) {
      const minY = targets[k - 1].y + h[targets[k - 1].i] + MIN_GAP;
      if (targets[k].y < minY) targets[k].y = minY;
    }
    // Clamp only the bottom: a pill whose floor has scrolled up out of view
    // keeps its true (negative) position and is clipped by the container,
    // instead of piling up at the top on top of the other pills.
    for (const t of targets) {
      const y = Math.min(rect.height - padBottom - h[t.i], t.y);
      items[t.i].style.transform = `translateY(${y.toFixed(1)}px)`;
      // Fully out of view: also take it out of the tab order.
      items[t.i].style.visibility = (y + h[t.i] < 0 || y > rect.height) ? 'hidden' : '';
    }
    nav.classList.add('leveled');
  };
  requestAnimationFrame(frame);
}
