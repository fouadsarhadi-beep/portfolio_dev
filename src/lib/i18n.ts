/** @module lib/i18n: reads UI strings from the active locale through t(). @see src/content/en.ts, src/content/fa.ts */
import { en, type Dict } from '@/content/en';
import { fa, type LocaleOverrides } from '@/content/fa';

// Dotted key path type, e.g. t('hero.h1').
type KeyPaths<T> = T extends string
  ? never
  : { [K in keyof T & string]: T[K] extends string ? K : `${K}.${KeyPaths<T[K]>}` }[keyof T & string];

export type TKey = KeyPaths<Dict>;

const dictionaries: Record<string, LocaleOverrides> = { en, fa };
/** Locale overrides; a missing key falls through to English, then to the key. */
let overrides: LocaleOverrides = {};

export function setLocale(locale: string): void {
  overrides = dictionaries[locale] ?? {};
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
  const locale = param ?? saved ?? 'en';
  setLocale(locale);
  const rtl = locale === 'fa';
  document.documentElement.lang = rtl ? 'fa' : 'en';
  document.documentElement.dir = rtl ? 'rtl' : 'ltr';
}
