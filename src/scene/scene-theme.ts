/** @module scene/scene-theme: material, light and value registry that applies theme changes in place. @see docs/DESIGN.md (Dual theme), src/config/theme.ts, docs/WIRING.md */
import * as THREE from 'three';
import { THEMES, type ThemeColors, type ThemeName } from '@/config/theme';
import { bus } from '@/lib/bus';

type Getter = (c: ThemeColors) => string;
type Applier = (c: ThemeColors, name: ThemeName) => void;

const entries: Applier[] = [];
let active: ThemeName = 'light';

function themeColors(): ThemeColors {
  return THEMES[active];
}

/** Registers a THREE.Color that follows a semantic role; optional hex transform (lighten/darken). */
export function registerColor(get: Getter, target: THREE.Color, transform?: (hex: string) => string): void {
  const apply: Applier = (c, name) => {
    const hex = transform ? transform(get(c)) : get(c);
    target.set(hex);
  };
  entries.push(apply);
  apply(themeColors(), active);
}

/** Registers a standard material's diffuse color. */
export function registerMaterial(get: Getter, material: { color: THREE.Color }, transform?: (hex: string) => string): void {
  registerColor(get, material.color, transform);
}

/** Registers an emissive color (LEDs, screens, glowing bits). */
export function registerEmissive(get: Getter, material: THREE.MeshStandardMaterial, transform?: (hex: string) => string): void {
  registerColor(get, material.emissive, transform);
}

/** Registers a light's color and per-theme intensity. */
export function registerLight(
  light: THREE.Light,
  colorGet: Getter,
  intensity: { light: number; dark: number },
): void {
  const apply: Applier = (c, name) => {
    light.color.set(colorGet(c));
    light.intensity = name === 'dark' ? intensity.dark : intensity.light;
  };
  entries.push(apply);
  apply(themeColors(), active);
}

/** Registers any other per-theme change (opacity, environment intensity, ...). */
export function registerValue(apply: (c: ThemeColors, name: ThemeName) => void): void {
  entries.push(apply);
  apply(themeColors(), active);
}

function applyAll(name: ThemeName): void {
  active = name;
  const c = themeColors();
  for (const apply of entries) apply(c, name);
}

/** Reads the active theme from the DOM and applies it to every registration. */
export function initSceneTheme(): void {
  active = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  applyAll(active);
  bus.on('theme:change', ({ name }) => applyAll(name));
}
