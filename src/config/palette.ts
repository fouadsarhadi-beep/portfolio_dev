import type { ThemeColors } from './theme';
/** @module config/palette: the only place hex colors may live, plus lighten/darken and the theme palettes. @see docs/DESIGN.md (Dual theme), src/config/theme.ts */

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
  slab: '#EAE0CB',
  slabShade: '#CFC1A3',
  underGlow: '#D8C9A3',
  wood: '#EFC98F',
  white: '#FBFBF6',
  graphite: '#59606B',
  // Touchdown dust (user review 2026-11-07): graphite read as black soot against
  // the plaster family; light khaki sits in the tower's warm neutral range.
  dust: '#E2D5A9',
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
/* Theme palettes (docs/DESIGN.md Dual theme). Types live in config/theme.ts. */
export const LIGHT: ThemeColors = {
  bg: '#F8F9EF',
  bgGlow: '#FEFFF8',
  surface: '#FFFFFF',
  surfaceAlt: '#F4F6F0',
  elevated: '#FFFFFF',
  line: '#E3E6D6',
  ink: '#3D4339',
  inkSoft: '#6B7566',
  inkMuted: '#8A9186',
  accent: '#3D4339',
  accent2: '#B69B76',
  highlight: '#F5C64F',
  wall: '#F4F2EA',
  wallShade: '#E6E3D8',
  slab: '#EAE0CB',
  slabShade: '#CFC1A3',
  underGlow: '#D8C9A3',
  wood: '#EFC98F',
  woodDark: '#D9B788',
  white: '#FBFBF6',
  graphite: '#59606B',
  glow: '#BFE3FF',
  ledGreen: '#7BE0A4',
  ledAmber: '#FFC857',
  ledRed: '#FF8A80',
  layerAccents: {
    content: '#F5C64F',
    translation: '#B9A8EE',
    seo: '#F9A87B',
    'web-design-development': '#F29AB0',
    cms: '#AECB9F',
    infrastructure: '#A9B8CC',
  },
};

export const DARK: ThemeColors = {
  bg: '#090B0E',
  bgGlow: '#10151C',
  surface: '#11151A',
  surfaceAlt: '#171D23',
  elevated: '#202831',
  line: '#303943',
  ink: '#E7E9E8',
  inkSoft: '#A1A9AE',
  inkMuted: '#737D85',
  accent: '#9AAEB4',
  accent2: '#B69B76',
  highlight: '#D1D8D5',
  // The tower's dark tones are derived from the light ones (same hue, darker),
  // so the building reads as the same material under less light, not a recolor.
  wall: darken(LIGHT.wall, 0.86),       // #212221
  wallShade: darken(LIGHT.wallShade, 0.88), // #1C1B1A
  slab: darken(LIGHT.slab, 0.82),       // #2A2825
  slabShade: darken(LIGHT.slabShade, 0.84), // #211F1A
  underGlow: darken(LIGHT.underGlow, 0.72), // #3C382E
  wood: darken(LIGHT.wood, 0.8),        // #30281D
  woodDark: darken(LIGHT.woodDark, 0.85), // #211B14
  white: darken(LIGHT.white, 0.13),     // #DADAD6
  graphite: darken(LIGHT.slabShade, 0.45), // #726A5A
  glow: '#BFE3FF',
  ledGreen: '#7BE0A4',
  ledAmber: '#FFC857',
  ledRed: '#FF8A80',
  layerAccents: {
    content: '#F6CE66',
    translation: '#C5B6F2',
    seo: '#FBB894',
    'web-design-development': '#F5AFC4',
    cms: '#BFD8B2',
    infrastructure: '#BCC9DB',
  },
};
