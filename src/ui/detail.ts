/** @module ui/detail: the detail panel: content from config, staggered entrance, history and scroll freeze. @see docs/MOTION.md (Detail view), docs/WIRING.md (Routes), src/scene/api.ts, src/ui/dialog.ts */
import { gsap } from 'gsap';
import { bus } from '@/lib/bus';
import { LAYERS } from '@/config/layers';
import { focusLayer, releaseFocus } from '@/scene/api';
import { prefersReducedMotion } from '@/lib/reduced-motion';
import { t } from '@/lib/i18n';
import { createDialog, type DialogHandle } from './dialog';

let dialog: DialogHandle | null = null;
let isOpen = false;
let currentId: string | null = null;
let savedScrollY = 0;

export function initDetail(): void {
  if (dialog) return;
  const host = document.querySelector<HTMLElement>('.stage-sticky');
  if (!host) return;

  dialog = createDialog(buildPanel, { labelledBy: 'detail-title', onEscape: () => close() });
  host.appendChild(dialog.panel);

  bus.on('layer:open', ({ id }) => open(id));
  bus.on('layer:close', () => close());
  window.addEventListener('popstate', () => {
    if (isOpen) close({ fromPop: true });
  });
}

function buildPanel(panel: HTMLElement): void {
  panel.className = 'detail-panel';
  panel.style.setProperty('--layer-c', 'var(--c-butter)');
  panel.innerHTML = `
    <p><button type="button" class="btn dv-back" data-dv-back>${t('detail.back')}</button></p>
    <p class="dp-num" data-dv-num aria-hidden="true"></p>
    <h2 id="detail-title" class="dp-title" data-dv-title></h2>
    <p class="dp-short" data-dv-short></p>
    <p class="dp-intro" data-dv-intro></p>
    <h3>${t('detail.capabilitiesHeading')}</h3>
    <ul class="cap-list" data-dv-caps></ul>
    <h3>${t('detail.samplesHeading')}</h3>
    <div class="samples" data-dv-samples></div>
    <h3>${t('detail.toolkitHeading')}</h3>
    <ul class="chips" data-dv-toolkit></ul>`;
  panel.querySelector('[data-dv-back]')?.addEventListener('click', () => close());
}

function fillPanel(id: string): void {
  const layer = LAYERS.find((l) => l.id === id);
  const panel = dialog?.panel;
  if (!layer || !panel) return;
  panel.style.setProperty('--layer-c', `var(--c-${layer.color})`);
  (panel.querySelector('[data-dv-num]') as HTMLElement).textContent = layer.number;
  (panel.querySelector('[data-dv-title]') as HTMLElement).textContent = layer.title;
  (panel.querySelector('[data-dv-short]') as HTMLElement).textContent = layer.short;
  (panel.querySelector('[data-dv-intro]') as HTMLElement).textContent = layer.intro;
  (panel.querySelector('[data-dv-caps]') as HTMLElement).innerHTML = layer.capabilities
    .map((c) => `<li>${c}</li>`).join('');
  (panel.querySelector('[data-dv-samples]') as HTMLElement).innerHTML = layer.samples
    .map((s) => `<article class="sample-card"><h3>${s.title}</h3><p>${s.blurb}</p>
      <ul class="chips">${s.tags.map((tag) => `<li class="chip">${tag}</li>`).join('')}</ul></article>`)
    .join('');
  (panel.querySelector('[data-dv-toolkit]') as HTMLElement).innerHTML = layer.toolkit
    .map((tool) => `<li class="chip">${tool}</li>`).join('');
}

function open(id: string): void {
  if (isOpen && currentId === id) return;
  if (isOpen) close({ fromPop: false, quick: true });
  const layer = LAYERS.find((l) => l.id === id);
  if (!layer || !dialog) return;

  isOpen = true;
  currentId = id;
  fillPanel(id);
  dialog.open();

  // Freeze the page scroll; the stack state stays exactly where it was.
  savedScrollY = window.scrollY;
  document.documentElement.style.overflow = 'hidden';

  focusLayer(id);
  history.pushState({ stackDetail: id }, '', `/work/${id}/`);

  // Panel entrance: staggered, rising 24px, power3.out (docs/MOTION.md).
  const reduced = prefersReducedMotion();
  const panel = dialog.panel;
  const items = [...panel.querySelectorAll<HTMLElement>(':scope > p, :scope > h2, :scope > h3, :scope > ul, :scope > div')];
  gsap.fromTo(items,
    { opacity: 0, y: reduced ? 0 : 24 },
    { opacity: 1, y: 0, duration: reduced ? 0.2 : 0.5, ease: 'power3.out', stagger: reduced ? 0 : 0.06 });
}

function close(opts: { fromPop?: boolean; quick?: boolean } = {}): void {
  if (!isOpen || !dialog) return;
  isOpen = false;
  currentId = null;

  releaseFocus();
  dialog.close();

  // Restore scroll exactly, then a scroll event recomputes the step from scrollY.
  document.documentElement.style.overflow = '';
  if (window.scrollY !== savedScrollY) window.scrollTo(0, savedScrollY);

  if (!opts.fromPop && history.state?.stackDetail) history.back();

  const panel = dialog.panel;
  const items = [...panel.querySelectorAll<HTMLElement>(':scope > *')];
  gsap.to(items, {
    opacity: 0,
    duration: prefersReducedMotion() ? 0.15 : opts.quick ? 0.18 : 0.3,
    ease: 'power1.in',
    onComplete: () => {
      panel.hidden = true;
      items.forEach((el) => (el.style.opacity = ''));
    },
  });
}
