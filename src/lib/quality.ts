/** @module lib/quality: picks the quality tier from screen width and CPU cores. @see docs/DESIGN.md (Responsive), src/config/tuning.ts */

export type QualityTier = 'high' | 'low';

export function detectTier(): QualityTier {
  const narrow = matchMedia('(max-width: 760px)').matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  return narrow || cores <= 4 ? 'low' : 'high';
}
