/** @module config/palette: the only place hex colors may live, plus lighten/darken. @see docs/DESIGN.md, src/config/types.ts */

export const PALETTE = {
  bg: '#F8F9EF',
  bgGlow: '#FEFFF8',
  surface: '#FFFFFF',
  ink: '#3D4339',
  inkSoft: '#6B7566',
  line: '#E3E6D6',
  butter: '#F5C64F',
  lilac: '#B9A8EE',
  peach: '#F9A87B',
  rose: '#F29AB0',
  blue: '#8FBDE8',
  sage: '#AECB9F',
  steel: '#A9B8CC',
  wall: '#F4F2EA',
  wallShade: '#E6E3D8',
  wood: '#F0D5A8',
  white: '#FBFBF6',
  graphite: '#59606B',
  glow: '#BFE3FF',
  ledGreen: '#7BE0A4',
  ledAmber: '#FFC857',
  ledRed: '#FF8A80',
} as const;

export type PaletteName = keyof typeof PALETTE;

const clamp01 = (k: number): number => Math.min(1, Math.max(0, k));

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
};

const rgbToHex = (r: number, g: number, b: number): string => {
  const c = (v: number) => Math.round(v).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
};

const mix = (hex: string, target: [number, number, number], k: number): string => {
  const [r, g, b] = hexToRgb(hex);
  const t = clamp01(k);
  return rgbToHex(
    r + (target[0] - r) * t,
    g + (target[1] - g) * t,
    b + (target[2] - b) * t,
  );
};

/** k = 0 returns the color, k = 1 returns white. */
export const lighten = (hex: string, k: number): string => mix(hex, [255, 255, 255], k);

/** k = 0 returns the color, k = 1 returns black. */
export const darken = (hex: string, k: number): string => mix(hex, [0, 0, 0], k);
