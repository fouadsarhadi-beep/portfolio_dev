/** @module lib/bus: typed event bus, one of two doors between UI and scene. @see docs/WIRING.md, src/config/types.ts, src/scene/api.ts */
import type { StackEvents } from '@/config/types';

type AnyHandler = (payload: unknown) => void;

class Bus {
  private map = new Map<keyof StackEvents, Set<AnyHandler>>();

  on<K extends keyof StackEvents>(type: K, fn: (payload: StackEvents[K]) => void): () => void {
    let set = this.map.get(type);
    if (!set) {
      set = new Set();
      this.map.set(type, set);
    }
    const wrapped = fn as unknown as AnyHandler;
    set.add(wrapped);
    return () => set.delete(wrapped);
  }

  emit<K extends keyof StackEvents>(type: K, payload: StackEvents[K]): void {
    const set = this.map.get(type) as Set<(p: StackEvents[K]) => void> | undefined;
    if (!set) return;
    for (const fn of set) fn(payload);
  }
}

export const bus = new Bus();
