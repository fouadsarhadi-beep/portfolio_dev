/** @module lib/reduced-motion: reads prefers-reduced-motion for every motion decision. @see docs/MOTION.md (Reduced motion) */

const query = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;

export function prefersReducedMotion(): boolean {
  return query?.matches ?? false;
}

/** Calls cb when the setting changes. Returns an unsubscribe function. */
export function onReducedMotionChange(cb: (reduced: boolean) => void): () => void {
  if (!query) return () => undefined;
  const listener = (): void => cb(query.matches);
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
}
