/** @module ui/detail: expanded floor view: card on the right half, compact sample strip beneath. @see docs/MOTION.md (Detail view), docs/WIRING.md (Routes), src/ui/dialog.ts, src/scene/focus.ts */
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
  panel.className = 'detail-view';
  panel.style.setProperty('--layer-c', 'var(--c-butter)');
  panel.innerHTML = `
    <div class="dv-card">
      <p class="dv-top"><button type="button" class="dv-back" data-dv-back>
        <span aria-hidden="true">&#8592;</span> ${t('detail.back')}</button></p>
      <p class="dv-kicker" aria-hidden="true"><span class="dv-num" data-dv-num></span></p>
      <h2 id="detail-title" class="dv-title" data-dv-title></h2>
      <p class="dv-short" data-dv-short></p>
      <p class="dv-intro" data-dv-intro></p>
      <h3 class="dv-heading">${t('detail.capabilitiesHeading')}</h3>
      <ul class="dv-caps" data-dv-caps></ul>
      <h3 class="dv-heading">${t('detail.toolkitHeading')}</h3>
      <ul class="dv-tools" data-dv-toolkit></ul>
    </div>
    <div class="dv-samples">
      <h3 class="dv-heading dv-samples-head">${t('detail.samplesHeading')}</h3>
      <div class="dv-sample-row" data-dv-samples></div>
    </div>`;
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
  (panel.querySelector('[data-dv-toolkit]') as HTMLElement).innerHTML = layer.toolkit
    .map((tool) => `<li>${tool}</li>`).join('');
  // Compact sample cards under the main composition; no links, no invented claims.
  (panel.querySelector('[data-dv-samples]') as HTMLElement).innerHTML = layer.samples
    .map((s) => `<article class="dv-sample"><h4>${s.title}</h4><p>${s.blurb}</p>
      <ul class="dv-tags">${s.tags.map((tag) => `<li>${tag}</li>`).join('')}</ul></article>`)
    .join('');
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

  // The card keeps the hover card's surface and accent rule and grows into the
  // right half while the floor travels left: one component, two states.
  const reduced = prefersReducedMotion();
  const panel = dialog.panel;
  const card = panel.querySelector<HTMLElement>('.dv-card');
  const samples = [...panel.querySelectorAll<HTMLElement>('.dv-sample')];
  const head = panel.querySelector<HTMLElement>('.dv-samples');
  if (card) {
    gsap.fromTo(card,
      { opacity: 0, x: reduced ? 0 : 22 },
      { opacity: 1, x: 0, duration: reduced ? 0.2 : 0.42, ease: 'power3.out', delay: reduced ? 0 : 0.08 });
  }
  if (head) gsap.fromTo(head, { opacity: 0 }, { opacity: 1, duration: 0.3, delay: reduced ? 0 : 0.2 });
  if (samples.length) {
    gsap.fromTo(samples,
      { opacity: 0, y: reduced ? 0 : 12 },
      { opacity: 1, y: 0, duration: reduced ? 0.2 : 0.34, ease: 'power2.out', stagger: reduced ? 0 : 0.05, delay: reduced ? 0 : 0.24 });
  }
}

function close(opts: { fromPop?: boolean; quick?: boolean } = {}): void {
  if (!isOpen || !dialog) return;
  isOpen = false;
  currentId = null;

  releaseFocus();

  // Restore scroll exactly, then a scroll event recomputes the step from scrollY.
  document.documentElement.style.overflow = '';
  if (window.scrollY !== savedScrollY) window.scrollTo(0, savedScrollY);

  if (!opts.fromPop && history.state?.stackDetail) history.back();

  // The card leaves first; the tower fades back in underneath it.
  const panel = dialog.panel;
  const targets = [...panel.querySelectorAll<HTMLElement>('.dv-card, .dv-samples')];
  gsap.to(targets, {
    opacity: 0,
    duration: prefersReducedMotion() ? 0.12 : opts.quick ? 0.14 : 0.24,
    ease: 'power1.in',
    overwrite: true,
    onComplete: () => {
      dialog?.close();
      targets.forEach((el) => (el.style.opacity = ''));
      panel.querySelectorAll<HTMLElement>('.dv-sample').forEach((el) => (el.style.opacity = ''));
    },
  });
}
