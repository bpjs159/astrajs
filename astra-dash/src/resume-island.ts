/**
 * astra-dash — isla resumible.
 *
 * El markup se inyecta como string crudo (mismo en SSR y CSR): el estado
 * viaja serializado en `astra-data` y los botones usan `astra-on:click`.
 * `wireResumeIsland` es la versión manual de lo que hace bootstrap():
 * deserializa el estado a un Proxy reactivo y ata un solo TextNode.
 * El componente jamás se re-ejecuta en el navegador.
 */
import { store, bindText } from 'astrajs.dev/core';

interface ResumeStrings {
  title: string;
  sub: string;
  pill: string;
  bump: string;
  reset: string;
  noteA: string;
  noteB: string;
  noteC: string;
}

export function resumeIslandHtml(s: ResumeStrings): string {
  return `<section class="resume-demo">
  <div class="resume-card" astra-data='{"views":1234}'>
    <div class="resume-head">
      <div>
        <h3>${s.title}</h3>
        <p>${s.sub}</p>
      </div>
      <span class="resume-pill">${s.pill}</span>
    </div>
    <div class="resume-body">
      <div class="resume-counter">
        <button class="btn ghost" astra-on:click="bumpViews">${s.bump}</button>
        <span class="resume-views">1234</span>
        <button class="btn ghost" astra-on:click="resetViews">${s.reset}</button>
      </div>
      <p class="resume-note">${s.noteA}<code>astra-data</code>${s.noteB}<code>astra-on:click</code>${s.noteC}</p>
    </div>
  </div>
</section>`;
}

/** Resume manual: estado → Proxy, bindText sobre el TextNode, eventos delegados. */
export function wireResumeIsland(root: ParentNode): void {
  const card = root.querySelector('.resume-card');
  if (!card) return;
  const raw = card.getAttribute('astra-data');
  if (!raw) return;

  const state = store(JSON.parse(raw)) as { views: number };

  const viewsEl = card.querySelector('.resume-views');
  if (viewsEl) {
    viewsEl.textContent = '';
    const tn = document.createTextNode('');
    viewsEl.appendChild(tn);
    bindText(tn, () => String(state.views));
  }

  card.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const btn = target.closest('[astra-on\\:click]');
    if (!btn) return;
    const action = btn.getAttribute('astra-on:click');
    if (action === 'bumpViews') state.views++;
    else if (action === 'resetViews') state.views = 0;
  });
}
