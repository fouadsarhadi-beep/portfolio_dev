/** @module lib/quality: picks the quality tier from screen width, CPU cores and data preference. @see docs/DESIGN.md (Responsive), src/config/tuning.ts */

export type QualityTier = 'high' | 'low';

interface NetworkInformation { saveData?: boolean; effectiveType?: string }

export function detectTier(): QualityTier {
  const narrow = matchMedia('(max-width: 760px)').matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  // A metered connection or an explicit reduced-data preference gets the low
  // tier as well: fewer dust pixels, smaller shadow map, no grid overlay.
  const conn = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  const slow = Boolean(conn?.saveData) || /(^|-)2g$/.test(conn?.effectiveType ?? '');
  const reducedData = matchMedia('(prefers-reduced-data: reduce)').matches;
  return narrow || cores <= 4 || slow || reducedData ? 'low' : 'high';
}
