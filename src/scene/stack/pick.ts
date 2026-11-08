/** @module scene/stack/pick: raycasts slab sides, hover lift or nudge, dims others, edge highlight. @see docs/MOTION.md (Pick, hover, touch), src/lib/bus.ts */
import * as THREE from 'three';
import type { OrthographicCamera } from 'three';
import { bus } from '@/lib/bus';
import { LAYERS } from '@/config/layers';
import { PALETTE } from '@/config/palette';
import type { ThemeColors } from '@/config/theme';
import { currentTheme } from '../scene-theme';

export interface Pick {
  update(dt: number, time: number): void;
  setHover(id: string | null): void;
  /** Picking is paused while a floor is expanded (no hover state behind the card). */
  setEnabled(on: boolean): void;
  dispose(): void;
}

const HOVER_LIFT = 0.35;
const NUDGE = 0.25;
const DIM = 0.94; // other floors lose 6 percent while one is hovered
const VIEW_RIGHT = { x: Math.SQRT1_2, z: -Math.SQRT1_2 }; // screen-right in world space

export function createPick(opts: {
  canvas: HTMLCanvasElement;
  camera: OrthographicCamera;
  slabs: THREE.Object3D[];
  u: number[];
}): Pick {
  const { canvas, camera, slabs, u } = opts;
  const n = slabs.length;
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const lift = new Array<number>(n).fill(0);
  const nudgeX = new Array<number>(n).fill(0);
  const nudgeZ = new Array<number>(n).fill(0);
  let hovered: string | null = null;
  let enabled = true;

  // Colors come from the theme role on every repaint. A snapshot would go stale
  // at the first theme switch, and because hovering repaints on every pointer
  // move it would then overwrite the registry everywhere, for every floor.
  const bodies = slabs.map((slab) => {
    const mesh = slab.children.find((c) => (c as THREE.Mesh).isMesh) as THREE.Mesh;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    const role = mat.userData.role as ((c: ThemeColors) => string) | undefined;
    return { mesh, mat, role };
  });
  const edgeGeo = new THREE.EdgesGeometry(bodies[0].mesh.geometry);
  // Neutral edge: the unified family keeps per-floor color out of the scene (T28/T29).
  const edgeMat = new THREE.LineBasicMaterial({ color: PALETTE.white, transparent: true, opacity: 0.6 });
  let edges: THREE.LineSegments | null = null;

  function idOfSlab(obj: THREE.Object3D | null): string | null {
    let cur: THREE.Object3D | null = obj;
    while (cur) {
      const id = cur.userData.layerId;
      if (typeof id === 'string') return id;
      cur = cur.parent;
    }
    return null;
  }

  function raycast(e: PointerEvent): string | null {
    const rect = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -(((e.clientY - rect.top) / rect.height) * 2 - 1));
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(slabs, true);
    return hits.length ? idOfSlab(hits[0].object) : null;
  }

  /** Repaints every body from its theme role, dimming the ones that are not hovered. */
  function repaint(): void {
    const hoverIdx = hovered ? LAYERS.findIndex((l) => l.id === hovered) : -1;
    bodies.forEach((b, i) => {
      const hex = b.role ? b.role(currentTheme()) : null;
      if (!hex) return;
      b.mat.color.set(hex);
      if (hoverIdx >= 0 && i !== hoverIdx) b.mat.color.multiplyScalar(DIM);
    });
  }

  // The registry registers its appliers at boot, before this one, so it writes
  // the theme color first and the dim is applied on top of it.
  const offTheme = bus.on('theme:change', repaint);

  function setHover(id: string | null): void {
    if (id === hovered) return;
    hovered = id;
    const hoverIdx = id ? LAYERS.findIndex((l) => l.id === id) : -1;
    repaint();
    if (edges) {
      edges.removeFromParent();
      edges = null;
    }
    if (hoverIdx >= 0) {
      edges = new THREE.LineSegments(edgeGeo, edgeMat);
      edges.scale.setScalar(1.002);
      slabs[hoverIdx].add(edges);
    }
    bus.emit('layer:hover', { id });
  }

  const onMove = (e: PointerEvent): void => { if (enabled) setHover(raycast(e)); };
  // Touch pointers fire pointerleave right after pointerup; touch dismisses via tap-elsewhere.
  const onLeave = (e: PointerEvent): void => {
    if (e.pointerType === 'mouse') setHover(null);
  };
  let downX = 0;
  let downY = 0;
  const onDown = (e: PointerEvent): void => { downX = e.clientX; downY = e.clientY; };
  const onUp = (e: PointerEvent): void => {
    if (!enabled) return;
    if (Math.hypot(e.clientX - downX, e.clientY - downY) > 8) return; // drag, not a tap
    const id = raycast(e);
    if (e.pointerType === 'mouse') {
      if (id) bus.emit('layer:open', { id });
      return;
    }
    // Touch: first tap selects and previews, second tap on the same layer opens.
    if (id) {
      if (hovered === id) {
        bus.emit('layer:open', { id });
      } else {
        bus.emit('layer:select', { id });
        setHover(id); // updates internal state and emits layer:hover
      }
    } else {
      setHover(null); // tap elsewhere dismisses
    }
  };

  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointerup', onUp);

  return {
    update(dt, time) {
      const k = 1 - Math.exp(-10 * Math.max(dt, 0));
      for (let i = 0; i < n; i++) {
        const active = hovered === LAYERS[i].id;
        const gapAbove = (i === 0 ? u[0] : u[i - 1]) > 0.1;
        const tLift = active && gapAbove ? HOVER_LIFT : 0;
        const tNx = active && !gapAbove ? NUDGE * VIEW_RIGHT.x : 0;
        const tNz = active && !gapAbove ? NUDGE * VIEW_RIGHT.z : 0;
        lift[i] += (tLift - lift[i]) * k;
        nudgeX[i] += (tNx - nudgeX[i]) * k;
        nudgeZ[i] += (tNz - nudgeZ[i]) * k;
        const slab = slabs[i];
        slab.position.y += lift[i];
        slab.position.x = nudgeX[i];
        slab.position.z = nudgeZ[i];
      }
      if (edges) edgeMat.opacity = 0.45 + Math.sin(time * 4) * 0.25;
    },

    setHover,

    setEnabled(on: boolean): void {
      enabled = on;
      if (!on) setHover(null);
    },

    dispose() {
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      offTheme();
      edgeGeo.dispose();
      edgeMat.dispose();
    },
  };
}
