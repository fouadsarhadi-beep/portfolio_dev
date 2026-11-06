/** @module ui/doc-viewer: text reader for a sample document, opened over the expanded floor. @see src/config/documents.ts, src/ui/detail-samples.ts, src/ui/detail.ts, docs/DESIGN.md (Document reader) */
import { gsap } from 'gsap';
import { DOCUMENTS } from '@/config/documents';
import { prefersReducedMotion } from '@/lib/reduced-motion';
import { t } from '@/lib/i18n';
import type { DocKind, SampleDocument } from '@/config/types';

const KIND_LABEL: Record<DocKind, string> = { pdf: 'PDF', doc: 'DOC', sheet: 'SHEET' };

let backdrop: HTMLElement | null = null;
let view: HTMLElement | null = null;
let restoreTo: HTMLElement | null = null;
let isOpen = false;

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);
}

/** A sheet renders as a real table (first row is the header); prose as paragraphs. */
function bodyMarkup(doc: SampleDocument): string {
  if (doc.rows?.length) {
    const [head, ...rest] = doc.rows;
    const cells = (tag: 'th' | 'td', row: string[]): string =>
      `<tr>${row.map((cell) => `<${tag}>${escapeHtml(cell)}</${tag}>`).join('')}</tr>`;
    return `<table class="doc-table"><thead>${cells('th', head)}</thead><tbody>${rest
      .map((row) => cells('td', row))
      .join('')}</tbody></table>`;
  }
  if (doc.text?.length) return doc.text.map((p) => `<p>${escapeHtml(p)}</p>`).join('');
  return `<p>${t('detail.docEmpty')}</p>`;
}

function build(): void {
  const host = document.querySelector<HTMLElement>('.stage-sticky');
  if (!host || backdrop) return;
  backdrop = document.createElement('div');
  backdrop.className = 'doc-backdrop';
  backdrop.hidden = true;
  backdrop.innerHTML = `
    <section class="doc-view" role="dialog" aria-modal="true" aria-labelledby="doc-title">
      <header class="doc-head">
        <span class="doc-kind" data-doc-kind></span>
        <h3 class="doc-title" id="doc-title" data-doc-title></h3>
        <p class="doc-meta" data-doc-meta></p>
        <button type="button" class="doc-close" data-doc-close aria-label="${t('detail.docClose')}">&#215;</button>
      </header>
      <div class="doc-body" data-doc-body></div>
      <footer class="doc-foot">
        <a class="doc-original" data-doc-original hidden target="_blank" rel="noopener">${t('detail.docOriginal')}</a>
        <button type="button" class="btn" data-doc-done>${t('detail.docClose')}</button>
      </footer>
    </section>`;
  host.appendChild(backdrop);
  view = backdrop.querySelector('.doc-view');
  backdrop.querySelector('[data-doc-close]')?.addEventListener('click', () => closeDocument());
  backdrop.querySelector('[data-doc-done]')?.addEventListener('click', () => closeDocument());
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeDocument();
  });
  // Keep Tab inside the reader; the page behind stays put.
  backdrop.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !view) return;
    const items = [...view.querySelectorAll<HTMLElement>('button, a[href]')];
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}

/** Opens the document for a sample. Returns false when nothing is attached. */
export function openDocument(key: string | undefined, fallbackTitle: string, from: HTMLElement): boolean {
  const doc = key ? DOCUMENTS[key] : undefined;
  if (!doc) return false;
  build();
  if (!backdrop || !view) return false;

  (backdrop.querySelector('[data-doc-kind]') as HTMLElement).textContent = KIND_LABEL[doc.kind];
  (backdrop.querySelector('[data-doc-title]') as HTMLElement).textContent = fallbackTitle;
  (backdrop.querySelector('[data-doc-meta]') as HTMLElement).textContent = doc.meta ?? '';
  (backdrop.querySelector('[data-doc-body]') as HTMLElement).innerHTML = bodyMarkup(doc);

  const original = backdrop.querySelector<HTMLAnchorElement>('[data-doc-original]');
  if (original) {
    original.hidden = !doc.src;
    if (doc.src) original.href = doc.src;
  }

  // Carry the floor's accent, so the reader belongs to the layer it came from.
  const accent = document.querySelector<HTMLElement>('.detail-view')?.style.getPropertyValue('--layer-c');
  if (accent) backdrop.style.setProperty('--layer-c', accent);

  restoreTo = from;
  isOpen = true;
  backdrop.hidden = false;
  const close = backdrop.querySelector<HTMLElement>('[data-doc-close]');
  close?.focus();
  if (!prefersReducedMotion()) {
    gsap.fromTo(view, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.26, ease: 'power2.out' });
  }
  return true;
}

/** True when a reader was open and has now been closed (detail.ts checks this first). */
export function closeDocument(): boolean {
  if (!isOpen || !backdrop) return false;
  isOpen = false;
  const finish = (): void => {
    if (backdrop) backdrop.hidden = true;
    restoreTo?.focus();
    restoreTo = null;
  };
  if (prefersReducedMotion() || !view) {
    finish();
    return true;
  }
  gsap.to(view, { opacity: 0, y: 10, duration: 0.18, ease: 'power1.in', onComplete: finish });
  return true;
}