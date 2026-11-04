/** @module ui/theme: the theme toggle; flips data-theme, persists the choice, emits on the bus. @see docs/DESIGN.md (Dual theme), src/config/theme.ts, src/sections/Hud.astro */
import { bus } from '@/lib/bus';
import type { ThemeName } from '@/config/theme';

const STORAGE_KEY = 'theme';

function current(): ThemeName {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function apply(name: ThemeName): void {
  document.documentElement.dataset.theme = name;
  try {
    localStorage.setItem(STORAGE_KEY, name);
  } catch {
    /* storage unavailable: the choice lives for this page only */
  }
  bus.emit('theme:change', { name });
  syncButton(name);
}

function syncButton(name: ThemeName): void {
  const button = document.getElementById('theme-toggle');
  if (!button) return;
  const dark = name === 'dark';
  button.setAttribute('aria-pressed', String(dark));
  button.dataset.mode = name;
}

/** Wires the HUD toggle; the initial data-theme was set inline before first paint. */
export function initThemeToggle(button: HTMLElement | null): void {
  if (!button) return;
  syncButton(current());
  button.addEventListener('click', () => {
    apply(current() === 'dark' ? 'light' : 'dark');
  });
}
