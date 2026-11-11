/** @module ui/picker: first-visit popups -- language (En /فا), then view mode (Interactive / Simple) -- and the header language toggle. The backdrop is the page blurred under 20% black; the choices are two large rounded-square pills in the site surface language. @see src/lib/i18n.ts, src/pages/simple.astro, src/styles/picker.css */
import { applyLocaleDom, locale, setLocale, t } from '@/lib/i18n';

const store = {
  get(k: string): string | null {
    try { return window.localStorage.getItem(k); } catch { return null; }
  },
  set(k: string, v: string): void {
    try { window.localStorage.setItem(k, v); } catch { /* private mode: session-only choice */ }
  },
};

function makeOverlay(titleKey: Parameters<typeof t>[0]): { overlay: HTMLElement; hide: () => void } {
  const overlay = document.createElement('div');
  overlay.className = 'picker';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = `
    <div class="picker-box">
      <p class="picker-title" data-t="${titleKey}"></p>
      <div class="picker-choices"></div>
    </div>`;
  document.body.appendChild(overlay);
  applyLocaleDom();
  const hide = (): void => {
    overlay.classList.add('picker--closing');
    window.setTimeout(() => overlay.remove(), 180);
  };
  return { overlay, hide };
}

function choice(label: string, onPick: () => void): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'picker-choice';
  b.textContent = label;
  b.addEventListener('click', onPick);
  return b;
}

/**
 * First visit: ask the language, then the view mode. Saved choices skip the
 * popups. Runs before the scene boots so the question is instant.
 */
export function initPicker(): void {
  const lang = store.get('lang');
  const mode = store.get('mode');
  if (!lang) {
    const { overlay, hide } = makeOverlay('picker.langTitle');
    const box = overlay.querySelector<HTMLElement>('.picker-choices') as HTMLElement;
    box.appendChild(choice('En', () => pickLang('en', hide)));
    box.appendChild(choice('فا', () => pickLang('fa', hide)));
    focusFirst(overlay);
    return;
  }
  if (!mode && window.location.pathname === '/') {
    showMode();
  }
}

function pickLang(next: string, hide: () => void): void {
  store.set('lang', next);
  setLocale(next);
  applyLocaleDom();
  hide();
  if (!store.get('mode') && window.location.pathname === '/') showMode();
}

function showMode(): void {
  const { overlay, hide } = makeOverlay('picker.modeTitle');
  const box = overlay.querySelector<HTMLElement>('.picker-choices') as HTMLElement;
  box.appendChild(choice(t('picker.interactive'), () => {
    store.set('mode', 'interactive');
    hide();
  }));
  box.appendChild(choice(t('picker.simple'), () => {
    store.set('mode', 'simple');
    if (window.location.pathname === '/') window.location.href = '/simple/';
    else hide();
  }));
  focusFirst(overlay);
}

function focusFirst(overlay: HTMLElement): void {
  window.setTimeout(() => overlay.querySelector<HTMLButtonElement>('button')?.focus(), 60);
}

/** Header language button: flips the live locale without a reload. */
export function initLangToggle(): void {
  const btn = document.querySelector<HTMLButtonElement>('[data-lang-toggle]');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const next = locale() === 'fa' ? 'en' : 'fa';
    store.set('lang', next);
    setLocale(next);
    applyLocaleDom();
  });
}
