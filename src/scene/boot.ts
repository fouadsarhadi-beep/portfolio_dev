/** @module scene/boot: entry; dynamic-imports three after first paint, mounts the canvas or falls back. @cap-exempt: it is the one wiring entry -- every import group here is a sibling step of the same boot sequence, and splitting it would scatter the boot order across files. @see src/scene/loop.ts, src/main.ts, docs/WIRING.md */
import type { WebGLRenderer, OrthographicCamera, Scene, Object3D, Mesh, Material } from 'three';
import type { StackDebugState } from '@/config/types';
import type { ThemeColors } from '@/config/theme';
import type { Stage } from './stage';

interface SceneBundle {
  renderer: WebGLRenderer;
  camera: OrthographicCamera;
  scene: Scene;
  stage: Stage;
  three: typeof import('three');
  tier: 'high' | 'low';
  resizeFrustum: (w: number, h: number) => void;
}

let warned = false;

function hasWebGL(): boolean {
  const c = document.createElement('canvas');
  return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
}

/** Keep the DOM content; un-hide the fallback cards. */
function fallback(reason: string): void {
  if (!warned) {
    warned = true;
    console.warn(`[scene] ${reason} Showing the static content instead.`);
  }
  // Keep html.js so the fallback cards show (T11); un-hide them.
  document.documentElement.classList.add('no-webgl');
}

async function makeScene(mount: HTMLElement, tier: 'high' | 'low'): Promise<SceneBundle> {
  const { EXPOSURE } = await import('@/config/tuning');
  const THREE = await import('three');
  const [{ createRenderer }, { createCamera, resizeCamera }, { createLights }, { createStage }] =
    await Promise.all([
      import('./renderer'),
      import('./camera'),
      import('./lights'),
      import('./stage'),
    ]);

  const renderer = createRenderer(mount, tier);
  const camera = createCamera(mount.clientWidth, mount.clientHeight);
  const scene = new THREE.Scene();
  scene.add(...createLights(tier));
  const stage = createStage(tier);
  scene.add(stage.group);

  // RoomEnvironment through PMREM (no downloaded HDRI); intensity follows the theme.
  const { registerValue } = await import('./scene-theme');
  const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js');
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.5;
  pmrem.dispose();
  registerValue((_c: 'light' | 'dark' | ThemeColors, name: 'light' | 'dark') => {
    scene.environmentIntensity = name === 'dark' ? 0.45 : 0.5;
    // A touch more exposure in the dark so the warm plaster keeps its read.
    renderer.toneMappingExposure = name === 'dark' ? 1.12 : EXPOSURE;
  });

  return { renderer, camera, scene, stage, three: THREE, tier, resizeFrustum: (w, h) => resizeCamera(camera, w, h) };
}

export async function boot(): Promise<void> {
  const mount = document.querySelector<HTMLElement>('#canvas-mount');
  if (!mount) return;

  if (!hasWebGL()) {
    fallback('WebGL is not available.');
    return;
  }

  // First paint before loading three (locked decision).
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  // Everything below pulls three.js in, so it all loads dynamically together.
  const [
    { CAM_DIR, CAM_DISTANCE, SLAB_T, LOW_TIER_BASE_ZOOM }, { DETAIL_BREAKPOINT }, { LAYERS }, { bus }, { PALETTE }, { createStack },
    { createState }, { createMotion }, { createLanding }, { createPick },
    { createFocus }, { bindSceneApi }, { startLoop }, { detectTier },
    { initSceneTheme }, { createDustPuffs }, { setBaseZoom }, { overviewFitZoom },
  ] = await Promise.all([
    import('@/config/tuning'), import('@/config/layout'), import('@/config/layers'), import('@/lib/bus'), import('@/config/palette'),
    import('./stack/stack'), import('./stack/state'), import('./stack/motion'),
    import('./stack/landing'), import('./stack/pick'),
    import('./focus'), import('./api'), import('./loop'), import('@/lib/quality'),
    import('./scene-theme'), import('./stack/dust'), import('./camera'), import('./focus-pose'),
  ]);
  // The registry applies the active theme to every material registered during build.
  initSceneTheme();

  // The base zoom for a tier and a mount box: the tier's cap over the cell fit.
  const fitBaseZoom = (w: number, h: number): number => {
    const fit = overviewFitZoom(w, h);
    return tier === 'low' ? Math.min(LOW_TIER_BASE_ZOOM, fit) : fit;
  };

  let bundle: SceneBundle | null = null;
  try {
    bundle = await makeScene(mount, detectTier());
  } catch (err) {
    fallback(`Scene failed to start: ${String(err)}`);
    return;
  }
  const { renderer, camera, scene, stage, three, tier, resizeFrustum } = bundle;

  // Wait for the display fonts so slab number textures use Fredoka.
  try { await document.fonts.ready; } catch { /* textures fall back to system fonts */ }
  const stack = createStack();
  scene.add(stack.group);

  // Initial framing target (the loop takes over damping immediately).
  // The tower renders at the tier's base zoom, fitted to its cell so the
  // enlarged tower (T39) keeps its constant air inside the column.
  camera.position.set(CAM_DIR.x * CAM_DISTANCE, CAM_DISTANCE + CAM_DIR.y * CAM_DISTANCE, CAM_DIR.z * CAM_DISTANCE);
  const base = fitBaseZoom(mount.clientWidth, mount.clientHeight);
  camera.zoom = base;
  setBaseZoom(camera, base);
  camera.updateProjectionMatrix();

  // Scroll state, motion, landing (with contact-shadow pulse + dust puffs).
  const state = createState();
  const puffs = createDustPuffs(stack.group, PALETTE.dust);
  const landing = createLanding(findContactShadow(stage.group), puffs);
  const motion = createMotion(state.u, LAYERS.length, {
    onLand: (i) => {
      const room = stack.rooms.find((r) => r.layerIndex === i)?.group;
      landing.onLand(stack.slabs[i], room, state.restY[i]);
    },
  });
  state.onChange = (_from, to) => {
    motion.goTo(to);
    bus.emit('step:change', { step: to });
  };
  const pick = createPick({ canvas: renderer.domElement, camera, slabs: stack.slabs, u: state.u });
  const focus = createFocus({
    camera,
    slabs: stack.slabs,
    canvasWrap: mount,
    getFollowY: () => {
      // Same rule as the loop (src/scene/loop.ts): the bottom floor sits lower.
      const last = state.restY.length - 1;
      const off = state.step >= last ? 0.1 : 0.9;
      return state.restY[state.step] + SLAB_T / 2 + off;
    },
    // Must match the expanded-layout breakpoint in hud.css (max-width: 860px;
    // the constant lives in src/config/layout.ts).
    isMobile: () => matchMedia(`(max-width: ${DETAIL_BREAKPOINT}px)`).matches,
  });
  bindSceneApi({
    setHover: (id) => pick.setHover(id),
    getState: () => ((window as unknown as Record<string, unknown>).__stack as StackDebugState) ?? null,
    // While a floor is expanded the tower is not a hover/click target (T30).
    focus: (id) => { pick.setEnabled(false); focus.open(id); },
    release: () => { focus.close(); pick.setEnabled(true); },
  });

  const stageEl = document.querySelector<HTMLElement>('.stage');
  let stageTop = stageEl ? stageEl.getBoundingClientRect().top + window.scrollY : 0;
  window.addEventListener('resize', () => {
    stageTop = stageEl ? stageEl.getBoundingClientRect().top + window.scrollY : 0;
  }, { passive: true });
  const onScroll = (): void => state.updateFromScroll(window.scrollY, window.innerHeight, stageTop);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  renderer.render(scene, camera);
  markReady(mount);

  // Debug hooks; window.__stack is refreshed every frame by state (docs/WIRING.md).
  (window as unknown as Record<string, unknown>).__scene = { camera, scene, renderer, three };
  state.publish();

  startLoop({ renderer, camera, scene, stack, state, landing, pick, focus, stage });

  // Keep renderer size and camera frustum in sync with the mount box, and
  // re-fit the base zoom so the tower keeps its air at any box shape (T39).
  new ResizeObserver((entries) => {
    const box = entries[0]?.contentRect;
    if (!box || box.width === 0 || box.height === 0) return;
    renderer.setSize(box.width, box.height, false);
    resizeFrustum(box.width, box.height);
    const z = fitBaseZoom(box.width, box.height);
    setBaseZoom(camera, z);
    // While a floor is expanded the detail view owns the zoom; leave it alone.
    if (!focus.active() && Math.abs(camera.zoom - z) > 0.0005) {
      camera.zoom = z;
      camera.updateProjectionMatrix();
    }
  }).observe(mount);
}

function markReady(mount: HTMLElement): void {
  document.documentElement.setAttribute('data-scene-ready', 'true');
  mount.setAttribute('data-live', 'true');
}

/** The soft contact shadow plane under the floating tower takes the landing pulse. */
function findContactShadow(group: Object3D): Material | null {
  let found: Material | null = null;
  group.traverse((o) => {
    if (!found && (o as Mesh).isMesh && o.name === 'contact-shadow') {
      found = (o as Mesh).material as Material;
    }
  });
  return found;
}
