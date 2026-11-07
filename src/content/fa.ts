/** @module content/fa: Persian strings, partial by design; anything missing falls back to English. @see src/lib/i18n.ts, src/content/en.ts, docs/DESIGN.md (Dual theme) */
import type { Dict } from './en';

/** Same shape as the dictionary, but any translated string is allowed. */
type Loose<T> = { [K in keyof T]?: T[K] extends string ? string : Loose<T[K]> };

export type LocaleOverrides = Loose<Dict>;

/** Only the sections translated so far. `t()` walks this first, then English. */
export const fa: LocaleOverrides = {
  nav: {
    stack: 'برج',
    toolkit: 'ابزارها',
    about: 'درباره',
    contact: 'تماس',
  },
  ladder: {
    label: 'طبقه‌ها',
  },
  guide: {
    kicker: 'طبقه‌های ۰۱ تا ۰۶',
    line: 'هر طبقه بخشی از کار است، روی هم چیده‌شده.',
    hint: 'برای دیدن نمونه‌ها روی یک طبقه بزنید',
    skip: 'نمای ساده',
  },
  nf: {
    title: 'این صفحه وجود ندارد',
    line: 'این سایت یک صفحه است. یکی از طبقه‌ها را امتحان کنید.',
    home: 'بازگشت به برج',
  },
  contact: {
    copyEmail: 'کپی ایمیل',
    copied: 'کپی شد',
  },
};