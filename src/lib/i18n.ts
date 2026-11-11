/** @module lib/i18n: reads UI strings from the active locale through t(), exposes the locale-aware layer view, and re-applies the locale to the DOM after a switch. @see src/content/en.ts, src/content/fa.ts, src/config/layers.ts */
import { en, type Dict } from '@/content/en';
import { fa, faLayers, type LocaleOverrides } from '@/content/fa';
import { LAYERS } from '@/config/layers';
import type { LayerConfig } from '@/config/types';
import { bus } from './bus';

// Dotted key path type, e.g. t('hero.h1').
type KeyPaths<T> = T extends string
  ? never
  : { [K in keyof T & string]: T[K] extends string ? K : `${K}.${KeyPaths<T[K]>}` }[keyof T & string];

export type TKey = KeyPaths<Dict>;

const dictionaries: Record<string, LocaleOverrides> = { en, fa };
/** Locale overrides; a missing key falls through to English, then to the key. */
let overrides: LocaleOverrides = {};
let current = 'en';

export function locale(): string {
  return current;
}

export function setLocale(next: string): void {
  overrides = dictionaries[next] ?? {};
  current = dictionaries[next] ? next : 'en';
  bus.emit('locale:change', { locale: current });
}

function walk(root: unknown, key: string): string | undefined {
  let node: unknown = root;
  for (const part of key.split('.')) {
    if (node && typeof node === 'object' && part in node) node = (node as Record<string, unknown>)[part];
    else return undefined;
  }
  return typeof node === 'string' ? node : undefined;
}

export function t(key: TKey): string {
  return walk(overrides, key) ?? walk(en, key) ?? key;
}

/**
 * The layer configs in the active locale: English, or the English config with
 * the Persian overrides merged in. Rooms and order never change.
 */
export function layersView(): LayerConfig[] {
  if (current !== 'fa') return LAYERS;
  return LAYERS.map((l) => {
    const o = faLayers[l.id];
    if (!o) return l;
    const samples = l.samples.map((s, i) => ({ ...s, ...(o.samples?.[i] ?? {}) }));
    return { ...l, ...o, samples };
  });
}

/**
 * Picks the locale for this page: ?lang= wins, then a saved choice. Persian also
 * flips the document to RTL, which the logical properties already support.
 * Called from src/main.ts, so it never runs during the static build.
 */
export function initLocale(): void {
  let param: string | null = null;
  let saved: string | null = null;
  try {
    param = new URLSearchParams(window.location.search).get('lang');
    saved = window.localStorage.getItem('lang');
  } catch {
    /* storage unavailable: the query parameter still works */
  }
  const next = param ?? saved ?? 'en';
  setLocale(next);
  applyDir();
}

/** Sets lang/dir on the root; also called after a live locale switch. */
export function applyDir(): void {
  const rtl = current === 'fa';
  document.documentElement.lang = rtl ? 'fa' : 'en';
  document.documentElement.dir = rtl ? 'rtl' : 'ltr';
}

/**
 * Re-applies the active locale to the rendered DOM after a live switch:
 * [data-t] text, [data-t-aria] labels, [data-layer-id] hosts (fields via
 * [data-lf], lists via [data-lf-list], work samples via [data-sample-i]) and
 * open-layer aria labels. Only runs client-side.
 */
export function applyLocaleDom(): void {
  applyDir();
  const view = layersView();
  document.querySelectorAll<HTMLElement>('[data-t]').forEach((el) => {
    el.textContent = t(el.dataset.t as TKey);
  });
  document.querySelectorAll<HTMLElement>('[data-t-aria]').forEach((el) => {
    el.setAttribute('aria-label', t(el.dataset.tAria as TKey));
  });
  document.querySelectorAll<HTMLElement>('[data-layer-id]').forEach((host) => {
    const layer = view.find((l) => l.id === host.dataset.layerId);
    if (!layer) return;
    host.querySelectorAll<HTMLElement>('[data-lf]').forEach((el) => {
      const f = el.dataset.lf;
      if (f === 'title' || f === 'short' || f === 'intro' || f === 'number') el.textContent = layer[f];
    });
    host.querySelectorAll<HTMLElement>('[data-lf-list]').forEach((el) => {
      const f = el.dataset.lfList;
      if (f !== 'toolkit' && f !== 'capabilities') return;
      const chip = el.classList.contains('chips');
      el.innerHTML = layer[f].map((x) => `<li${chip ? ' class="chip"' : ''}>${x}</li>`).join('');
    });
    host.querySelectorAll<HTMLElement>('[data-layer-open]').forEach((el) => {
      el.setAttribute('aria-label', `${t('a11y.openLayer')} ${layer.number}: ${layer.title}`);
    });
  });
  document.querySelectorAll<HTMLElement>('[data-sample-i]').forEach((card) => {
    const host = card.closest<HTMLElement>('[data-layer-id]');
    const layer = host ? view.find((l) => l.id === host.dataset.layerId) : undefined;
    const s = layer?.samples[Number(card.dataset.sampleI)];
    if (!s) return;
    const title = card.querySelector<HTMLElement>('[data-sf="title"]');
    const blurb = card.querySelector<HTMLElement>('[data-sf="blurb"]');
    const tags = card.querySelector<HTMLElement>('[data-sf="tags"]');
    if (title) title.textContent = s.title;
    if (blurb) blurb.textContent = s.blurb;
    if (tags) tags.innerHTML = s.tags.map((x) => `<li class="chip">${x}</li>`).join('');
  });
  document.querySelectorAll<HTMLElement>('[data-lang-label]').forEach((el) => {
    el.textContent = current === 'fa' ? 'En' : 'فا';
  });
}
