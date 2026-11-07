/** @module scene/stack/layer-rect: projects a slab's outer corner so a DOM label or card clears its full width. @see src/scene/stack/pick.ts, src/scene/stack/labels.ts */
import * as THREE from 'three';
import type { OrthographicCamera } from 'three';
import { FOOTPRINT, SLAB_T } from '@/config/tuning';

export interface ScreenRect { left: number; top: number; width: number; height: number }

const HALF = FOOTPRINT / 2;

/** Screen-space box of one slab at its current pose. */
export function layerRect(
  slab: THREE.Object3D,
  camera: OrthographicCamera,
  canvas: HTMLCanvasElement,
): ScreenRect {
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
}