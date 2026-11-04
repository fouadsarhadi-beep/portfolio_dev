/** @module scene/api: the only door from UI into the scene. @see docs/WIRING.md, src/lib/bus.ts, src/scene/stack/pick.ts */
import { bus } from '@/lib/bus';
import type { LayerId, StackDebugState } from '@/config/types';

export interface ScreenRect { left: number; top: number; width: number; height: number }

interface SceneApiImpl {
  setHover(id: LayerId | null): void;
  getLayerRect(id: LayerId): ScreenRect | null;
  getState(): StackDebugState | null;
  focus(id: LayerId): void;
  release(): void;
}

let impl: SceneApiImpl = {
  setHover: () => undefined,
  getLayerRect: () => null,
  getState: () => null,
  focus: () => undefined,
  release: () => undefined,
};

/** The boot wires the real implementations in once the scene exists. */
export function bindSceneApi(x: SceneApiImpl): void {
  impl = x;
}

export function focusLayer(id: LayerId): void {
  impl.focus(id);
}

export function releaseFocus(): void {
  impl.release();
}

export function setHover(id: LayerId | null): void {
  bus.emit('layer:hover', { id });
  impl.setHover(id);
}

export function getLayerRect(id: LayerId): ScreenRect | null {
  return impl.getLayerRect(id);
}

export function getState(): StackDebugState | null {
  return impl.getState();
}
