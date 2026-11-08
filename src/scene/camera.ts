/** @module scene/camera: orthographic camera locked to the (1,1,1) isometric view, with damped follow, the framing-offset tween and the stage's sideways shift. @see docs/DESIGN.md (Camera), docs/MOTION.md (Camera), src/config/tuning.ts */
import * as THREE from 'three';
import { gsap } from 'gsap';
import { CAM_DIR, CAM_DISTANCE, CAM_VIEW_HEIGHT, CAM_DAMP_LAMBDA, CAM_FRAME_OFFSET_Y } from '@/config/tuning';
import { stageShiftPx } from './focus-pose';

const NEAR = 0.1;
const FAR = 100;

interface CameraData {
  /** Framing offset in world units (the hero lift, or a value mid-tween). */
  frameOffset?: number;
  /** The stage's sideways shift in px: always 0 since T39 centred the tower in
   *  its cell (the pills moved to their own column), kept for the restore path. */
  stageShiftPx?: number;
  /** The shift actually applied: the stage's, or 0 while a floor is expanded. */
  shiftPx?: number;
  /** True while the detail view owns the shift (tweened to 0). */
  shiftDetached?: boolean;
  /** The zoom the overview blends from: boot sets it per tier and re-fits it
   *  on resize; the detail view restores it on close. */
  baseZoom?: number;
  viewW?: number;
  viewH?: number;
  targetY?: number;
}

function data(camera: THREE.OrthographicCamera): CameraData {
  return camera.userData as CameraData;
}

/** The shift in px a floor-expanded view must neutralise. */
export function stageShift(camera: THREE.OrthographicCamera): number {
  return data(camera).stageShiftPx ?? 0;
}

/** Rebuilds the frustum from the last known box, keeping both offsets. */
function applyFrustum(camera: THREE.OrthographicCamera): void {
  const d = data(camera);
  const width = Math.max(d.viewW ?? 1, 1);
  const height = Math.max(d.viewH ?? 1, 1);
  const halfH = CAM_VIEW_HEIGHT / 2;
  const halfW = (halfH * width) / height;
  const offsetY = d.frameOffset ?? CAM_FRAME_OFFSET_Y;
  // A px shift is this many world units at the current zoom-independent scale.
  const dx = ((d.shiftPx ?? 0) * CAM_VIEW_HEIGHT) / height;
  d.frameOffset = offsetY;
  camera.left = -halfW + dx;
  camera.right = halfW + dx;
  camera.top = halfH - offsetY;
  camera.bottom = -halfH - offsetY;
  camera.updateProjectionMatrix();
}

export function createCamera(width: number, height: number): THREE.OrthographicCamera {
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, NEAR, FAR);
  resizeCamera(camera, width, height);
  // Lock the view direction: position = target + (1,1,1) x distance, target at origin.
  camera.position.set(CAM_DIR.x * CAM_DISTANCE, CAM_DIR.y * CAM_DISTANCE, CAM_DIR.z * CAM_DISTANCE);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  return camera;
}

/**
 * Sets the vertical framing offset and rebuilds the frustum. The offset keeps
 * the lift in pixels at any zoom, so the detail view has to neutralise it
 * rather than inherit it (src/scene/focus.ts).
 */
export function applyFraming(camera: THREE.OrthographicCamera, offsetY: number): void {
  data(camera).frameOffset = offsetY;
  applyFrustum(camera);
}

/** The zoom the overview blends from: 1 until boot sets it (tier fit, T39). */
export function baseZoomOf(camera: THREE.OrthographicCamera): number {
  return data(camera).baseZoom ?? 1;
}

/** Store the base zoom; the overview blend and the detail close both read it. */
export function setBaseZoom(camera: THREE.OrthographicCamera, zoom: number): void {
  data(camera).baseZoom = zoom;
}

export function resizeCamera(camera: THREE.OrthographicCamera, width: number, height: number): void {
  const d = data(camera);
  d.viewW = width;
  d.viewH = height;
  d.stageShiftPx = stageShiftPx();
  // The stage shift follows the box, unless a floor owns the framing right now.
  if (d.shiftDetached !== true) d.shiftPx = d.stageShiftPx;
  applyFrustum(camera);
}

/** The framing offset currently applied: the hero lift, or a value mid-tween. */
export function currentFrameOffset(camera: THREE.OrthographicCamera): number {
  return data(camera).frameOffset ?? CAM_FRAME_OFFSET_Y;
}

/** Eases the frustum framing offset to `to`; the scene stays put in view space. */
export function tweenFraming(
  camera: THREE.OrthographicCamera,
  to: number,
  duration: number,
  ease: string,
): void {
  const framing = { off: currentFrameOffset(camera) };
  gsap.to(framing, {
    off: to,
    duration,
    ease,
    overwrite: true,
    onUpdate: () => applyFraming(camera, framing.off),
  });
}

/**
 * Eases the sideways shift to `to` px. The detail view calls this with 0 on open
 * (so a floor is framed against the whole viewport, not the stage cell) and with
 * the stage's own value on close. `done` runs once the shift has landed.
 */
export function tweenShift(
  camera: THREE.OrthographicCamera,
  to: number,
  duration: number,
  ease: string,
  done?: () => void,
): void {
  const d = data(camera);
  const proxy = { px: d.shiftPx ?? 0 };
  gsap.to(proxy, {
    px: to,
    duration,
    ease,
    overwrite: true,
    onUpdate: () => {
      d.shiftPx = proxy.px;
      applyFrustum(camera);
    },
    onComplete: () => {
      d.shiftPx = to;
      applyFrustum(camera);
      done?.();
    },
  });
}

/** True while a floor owns the framing; the stage shift is frozen until it lands. */
export function setShiftDetached(camera: THREE.OrthographicCamera, detached: boolean): void {
  data(camera).shiftDetached = detached;
}

/**
 * Damped follow: the target Y eases toward wantY (lambda 6). Moves the camera
 * with the target and returns the current target Y. The caller adds the landing
 * jolt to the lookAt target only (docs/MOTION.md Camera).
 */
export function followCamera(camera: THREE.OrthographicCamera, wantY: number, dt: number): number {
  const cur = data(camera).targetY ?? wantY;
  const next = cur + (wantY - cur) * (1 - Math.exp(-CAM_DAMP_LAMBDA * Math.max(dt, 0)));
  data(camera).targetY = next;
  camera.position.set(CAM_DIR.x * CAM_DISTANCE, next + CAM_DIR.y * CAM_DISTANCE, CAM_DIR.z * CAM_DISTANCE);
  camera.updateMatrixWorld();
  return next;
}

