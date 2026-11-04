/** @module scene/stack/pick: raycasts slab sides, hover lift or nudge, dims others, edge highlight. @see docs/MOTION.md (Pick, hover, touch), src/lib/bus.ts, src/scene/stack/labels.ts */
import * as THREE from 'three';
import type { OrthographicCamera } from 'three';
import { bus } from '@/lib/bus';
import { LAYERS } from '@/config/layers';
import { FOOTPRINT, SLAB_T } from '@/config/tuning';
import { PALETTE, lighten } from '@/config/palette';

export interface ScreenRect { left: number; top: number; width: number; height: number }

export interface Pick {
  update(dt: number, time: number): void;
  setHover(id: string | null): void;
  getLayerRect(id: string): ScreenRect | null;
  dispose(): void;
}

const HALF = FOOTPRINT / 2;
const HOVER_LIFT = 0.35;
const NUDGE = 0.25;
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

  const bodies = slabs.map((slab) => {
    const mesh = slab.children.find((c) => (c as THREE.Mesh).isMesh) as THREE.Mesh;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    return { mesh, mat, base: mat.color.clone() };
  });
  const edgeGeo = new THREE.EdgesGeometry(bodies[0].mesh.geometry);
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

  function setHover(id: string | null): void {
    if (id === hovered) return;
    hovered = id;
    const hoverIdx = id ? LAYERS.findIndex((l) => l.id === id) : -1;
    bodies.forEach((b, i) => {
      b.mat.color.copy(b.base);
      if (hoverIdx >= 0 && i !== hoverIdx) b.mat.color.multiplyScalar(0.94); // others lose 6 percent
    });
    if (edges) {
      edges.removeFromParent();
      edges = null;
    }
    if (hoverIdx >= 0) {
      const layerColor = PALETTE[LAYERS[hoverIdx].color as keyof typeof PALETTE];
      edgeMat.color.set(lighten(layerColor, 0.2));
      edges = new THREE.LineSegments(edgeGeo, edgeMat);
      edges.scale.setScalar(1.002);
      slabs[hoverIdx].add(edges);
    }
    bus.emit('layer:hover', { id });
  }

  const onMove = (e: PointerEvent): void => setHover(raycast(e));
  // Touch pointers fire pointerleave right after pointerup; touch dismisses via tap-elsewhere.
  const onLeave = (e: PointerEvent): void => {
    if (e.pointerType === 'mouse') setHover(null);
  };
  let downX = 0;
  let downY = 0;
  const onDown = (e: PointerEvent): void => { downX = e.clientX; downY = e.clientY; };
  const onUp = (e: PointerEvent): void => {
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
      const k = 1 - Math.exp(-12 * Math.max(dt, 0));
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

    getLayerRect(id): ScreenRect | null {
      const i = LAYERS.findIndex((l) => l.id === id);
      if (i < 0) return null;
      const slab = slabs[i];
      // The screen-right corner lies along the camera's +x / -z direction.
      // Project that outer corner so the DOM label clears the slab's full width.
      const v = new THREE.Vector3(
        slab.position.x + HALF,
        slab.position.y,
        slab.position.z - HALF,
      ).project(camera);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const viewH = camera.top - camera.bottom;
      return {
        left: (v.x * 0.5 + 0.5) * w,
        top: (-v.y * 0.5 + 0.5) * h,
        width: 0,
        height: (SLAB_T / viewH) * h,
      };
    },

    dispose() {
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      edgeGeo.dispose();
      edgeMat.dispose();
    },
  };
}
