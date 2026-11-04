/** @module lib/i18n: reads UI strings from the active locale through t(). @see src/content/en.ts */
import { en, type Dict } from '@/content/en';

// Dotted key path type, e.g. t('hero.h1').
type KeyPaths<T> = T extends string
  ? never
  : { [K in keyof T & string]: T[K] extends string ? K : `${K}.${KeyPaths<T[K]>}` }[keyof T & string];

export type TKey = KeyPaths<Dict>;

const dictionaries: Record<string, Dict> = { en };
let active: Dict = dictionaries.en;

// English only for now; a second locale registers here later.
export function setLocale(locale: string): void {
  active = dictionaries[locale] ?? dictionaries.en;
}

export function t(key: TKey): string {
  let node: unknown = active;
  for (const part of key.split('.')) {
    if (node && typeof node === 'object' && part in node) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return key; // missing key: surface the key instead of failing silently
    }
  }
  return typeof node === 'string' ? node : key;
}
