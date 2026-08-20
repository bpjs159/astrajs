import { component, store, dynamic } from 'astrajs.dev/core';
import { DocSidebar } from '../../components/docs-sidebar.js';
import { DocRightToc } from '../../components/doc-right-toc.js';
import { Icon } from '../../components/icon.js';
import { frontendExamples, fullstackExamples, type LiveExample } from './examples-live.js';
import { i18n } from '../../i18n.js';
import { CodeBlock } from '../../components/code-block.js';

const s = `
  .docs-layout{display:flex;min-height:100vh}
  .docs-main{flex:1;min-width:0;margin-left:260px;padding:48px 56px;max-width:1020px}
  @media(max-width:960px){.docs-main{margin-left:0;padding:32px 24px}}
  .docs-content h1{font-size:2rem;font-weight:800;color:#f7f7ff;margin-bottom:12px;letter-spacing:-.02em}
  .docs-content h2{font-size:1.3rem;font-weight:700;color:#f7f7ff;margin:40px 0 14px;padding-top:20px;border-top:1px solid rgba(255,255,255,.06);letter-spacing:-.01em}
  .docs-content h2:first-of-type{border-top:none;margin-top:28px}
  .docs-content p{font-size:.88rem;color:#94a3b8;line-height:1.75;margin-bottom:16px}
  .docs-content strong{color:#e2e8f0}
  .docs-content code{background:rgba(139,77,255,.1);color:#c4a0ff;padding:2px 7px;border-radius:4px;font-size:.8rem;font-weight:500;font-family:'JetBrains Mono',monospace}

  /* === TABS === */
  .ex-tabs{display:flex;gap:2px;margin-bottom:0}
  .ex-tab{padding:10px 24px;font-size:.78rem;font-weight:600;color:#475569;background:rgba(255,255,255,.02);border:1px solid transparent;border-bottom:none;border-radius:10px 10px 0 0;cursor:pointer;transition:color .15s,background .15s,border-color .15s}
  .ex-tab:hover{color:#94a3b8;background:rgba(255,255,255,.03)}
  .ex-tab.active{color:#b84cff;background:#060b14;border-color:rgba(255,255,255,.07);border-bottom-color:#060b14;position:relative;z-index:1}

  /* === VIEWER === */
  .ex-viewer{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;background:#060b14;border:1px solid rgba(255,255,255,.07);border-radius:12px;overflow:hidden;animation:viewerIn .4s cubic-bezier(.2,.8,.3,1)}
  @keyframes viewerIn{from{opacity:0;transform:translateY(-14px) scale(.985);filter:brightness(1.4)}to{opacity:1;transform:translateY(0) scale(1);filter:brightness(1)}}
  .ex-viewer-code{animation:viewerSlide .45s .05s cubic-bezier(.2,.8,.3,1) both}
  .ex-viewer-preview{animation:viewerSlide .45s .12s cubic-bezier(.2,.8,.3,1) both}
  @keyframes viewerSlide{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
  .ex-viewer-header{grid-column:1/-1;display:flex;align-items:center;gap:10px;padding:12px 20px;border-bottom:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.015)}
  .ex-viewer-header h3{font-size:.9rem;font-weight:700;color:#f7f7ff;letter-spacing:-.01em}
  .ex-viewer-close{margin-left:auto;font-size:.7rem;font-weight:600;color:#94a3b8;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:6px;padding:5px 14px;cursor:pointer;transition:color .12s,background .12s}
  .ex-viewer-close:hover{color:#fff;background:rgba(255,255,255,.1)}
  .ex-viewer-code{border-right:1px solid rgba(255,255,255,.06);min-width:0}
  .ex-viewer-code-label,.ex-viewer-preview-label{padding:8px 20px;font-size:.62rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.1em;border-bottom:1px solid rgba(255,255,255,.04)}
  .ex-viewer-code pre{padding:20px;overflow-x:auto;margin:0}
  .ex-viewer-code code{background:none;padding:0;display:block;font-size:.72rem;line-height:1.85;color:#cbd5e1;white-space:pre;tab-size:2}
  .ex-viewer-preview{background:rgba(255,255,255,.008);min-width:0;display:flex;flex-direction:column}
  .ex-viewer-preview-body{padding:24px;flex:1}
  @media(max-width:900px){
    .ex-viewer{grid-template-columns:1fr}
    .ex-viewer-code{border-right:none;border-bottom:1px solid rgba(255,255,255,.06)}
  }

  /* === CARDS GRID === */
  .ex-list{display:flex;flex-direction:column;gap:16px;background:#060b14;border:1px solid rgba(255,255,255,.07);border-radius:0 12px 12px 12px;padding:28px}
  .ex-cards-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
  .ex-card{display:flex;flex-direction:column;gap:8px;background:rgba(255,255,255,.015);border:1px solid rgba(255,255,255,.05);border-radius:12px;padding:20px 22px;cursor:pointer;transition:border-color .15s,transform .15s,background .15s}
  .ex-card:hover{border-color:rgba(139,77,255,.3);background:rgba(139,77,255,.03);transform:translateY(-2px)}
  .ex-card-top{display:flex;align-items:center;gap:12px}
  .ex-num{font-size:1.1rem;font-weight:800;color:rgba(184,76,255,.6);letter-spacing:-.02em}
  .ex-card h3{font-size:.92rem;font-weight:700;color:#f7f7ff;letter-spacing:-.01em}
  .ex-card p{font-size:.76rem;color:#94a3b8;line-height:1.6;margin:0;flex:1}
  .ex-card-tags{display:flex;flex-wrap:wrap;gap:6px}
  .ex-tag{font-size:.62rem;font-weight:600;color:#b84cff;background:rgba(139,77,255,.08);border:1px solid rgba(139,77,255,.15);padding:2px 10px;border-radius:12px}
  .ex-card-open{font-size:.66rem;font-weight:700;color:#8d4dff}

  /* === FULL EXAMPLES === */
  .ex-full{background:#060b14;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:28px;margin-bottom:28px}
  .ex-full h2{margin-top:0!important;border-top:none!important;padding-top:0!important;font-size:1.15rem}
  .ex-full>p{font-size:.82rem}
  .ex-full-cards{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
  @media(max-width:960px){.ex-full-cards{grid-template-columns:1fr}}
  .ex-full-card{display:flex;align-items:center;gap:14px;background:rgba(255,255,255,.015);border:1px solid rgba(255,255,255,.05);border-radius:12px;padding:18px 20px;text-decoration:none;transition:border-color .15s,transform .15s,background .15s}
  .ex-full-card:hover{border-color:rgba(139,77,255,.4);background:rgba(139,77,255,.04);transform:translateY(-2px)}
  .ex-full-icon{display:flex;align-items:center;line-height:1}
  .ex-full-body{display:flex;flex-direction:column;gap:4px;min-width:0}
  .ex-full-name{font-size:.9rem;font-weight:700;color:#f7f7ff}
  .ex-full-desc{font-size:.74rem;color:#94a3b8;line-height:1.5}
  .ex-full-arrow{margin-left:auto;display:flex;align-items:center;color:#94a3b8}
  .ex-full-card:hover .ex-full-arrow{color:#b84cff}
  @media(max-width:768px){.ex-full-cards{grid-template-columns:1fr}}
  @media(max-width:768px){.ex-cards-grid{grid-template-columns:1fr}}
`;

export const DocsExamples = component(() => {
  const state = store({
    tab: 'frontend' as 'frontend' | 'fullstack',
    // Primitive key: comparing objects returned from a store read would
    // fail (the Proxy wraps objects on access, breaking identity).
    selectedNum: null as string | null,
  });

  // Deep-link: /docs/examples#backend (legacy #fullstack) cambia a backend.
  // Escucha hashchange para reaccionar también a clics del sidebar en vivo
  // (el sidebar usa history.replaceState y avisa manualmente).
  if (typeof window !== 'undefined') {
    const applyHash = () => {
      const h = window.location.hash;
      if (h === '#backend' || h === '#fullstack') state.tab = 'fullstack';
      else if (h === '#frontend') state.tab = 'frontend';
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
  }

  return (
    <div class="docs-layout">
      <style>{s}</style>
      <DocSidebar />
      <main class="docs-main">
        <div class="docs-content">
          <h1 id="ejemplos">{i18n.t('sb.examples')}</h1>
          <p>
            {i18n.t('ex.h.a')}
            <strong>{i18n.t('ex.h.b')}</strong>
            {i18n.t('ex.h.c')}<code>examples/frontend/</code>{i18n.t('ex.h.d')}<code>examples/fullstack/</code>{i18n.t('ex.h.e')}
          </p>

          <section class="ex-full" id="full">
            <h2>{i18n.t('ex.fullTitle')}</h2>
            <p>{i18n.t('ex.fullDesc')}</p>
            <div class="ex-full-cards">
              <a class="ex-full-card" href="https://store.astrajs.dev" target="_blank" rel="noopener">
                <span class="ex-full-icon"><Icon name="store" size={22} /></span>
                <span class="ex-full-body">
                  <span class="ex-full-name">AstraStore</span>
                  <span class="ex-full-desc">{i18n.t('ex.fullStoreDesc')}</span>
                </span>
                <span class="ex-full-arrow"><Icon name="arrow-right" size={14} /></span>
              </a>
              <a class="ex-full-card" href="https://blog.astrajs.dev" target="_blank" rel="noopener">
                <span class="ex-full-icon"><Icon name="pen" size={22} /></span>
                <span class="ex-full-body">
                  <span class="ex-full-name">AstraBlog</span>
                  <span class="ex-full-desc">{i18n.t('ex.fullBlogDesc')}</span>
                </span>
                <span class="ex-full-arrow"><Icon name="arrow-right" size={14} /></span>
              </a>
              <a class="ex-full-card" href="https://dash.astrajs.dev" target="_blank" rel="noopener">
                <span class="ex-full-icon"><Icon name="chart" size={22} /></span>
                <span class="ex-full-body">
                  <span class="ex-full-name">AstraDash</span>
                  <span class="ex-full-desc">{i18n.t('ex.fullDashDesc')}</span>
                </span>
                <span class="ex-full-arrow"><Icon name="arrow-right" size={14} /></span>
              </a>
              <a class="ex-full-card" href="https://tasks.astrajs.dev" target="_blank" rel="noopener">
                <span class="ex-full-icon"><Icon name="kanban" size={22} /></span>
                <span class="ex-full-body">
                  <span class="ex-full-name">AstraTasks</span>
                  <span class="ex-full-desc">{i18n.t('ex.fullTasksDesc')}</span>
                </span>
                <span class="ex-full-arrow"><Icon name="arrow-right" size={14} /></span>
              </a>
            </div>
          </section>

          <div class="ex-tabs">
            <button
              id="frontend"
              class={`ex-tab${state.tab === 'frontend' ? ' active' : ''}`}
              onclick={() => { state.tab = 'frontend'; state.selectedNum = null; }}
            >
              Frontend (10)
            </button>
            <button
              id="backend"
              class={`ex-tab${state.tab === 'fullstack' ? ' active' : ''}`}
              onclick={() => { state.tab = 'fullstack'; state.selectedNum = null; }}
            >
              Backend (10)
            </button>
          </div>

          <div class="ex-list">
            {/* ── CARDS GRID: el visor se abre en la posición de la card ── */}
            <div class="ex-cards-grid">
              {(() => {
                // NOTE: the state reads must live INSIDE this expression
                // so the compiler's dynamic() wrapper tracks them reactively.
                const list = state.tab === 'frontend' ? frontendExamples : fullstackExamples;
                return list.flatMap((ex) => {
                  const card = (
                    <div class="ex-card" onclick={() => { state.selectedNum = ex.num; }}>
                      <div class="ex-card-top">
                        <span class="ex-num">{ex.num}</span>
                        <h3>{i18n.t(ex.title)}</h3>
                      </div>
                      <p>{i18n.t(ex.description)}</p>
                      <div class="ex-card-tags">
                        {ex.concepts.map((c) => (
                          <span class="ex-tag">{c}</span>
                        ))}
                      </div>
                      <span class="ex-card-open">{i18n.t('ex.open')}</span>
                    </div>
                  );

                  if (state.selectedNum === ex.num) {
                    // Viewer inline, right below the clicked card
                    return [
                      card,
                      <div class="ex-viewer">
                        <div class="ex-viewer-header">
                          <span class="ex-num">{ex.num}</span>
                          <h3>{i18n.t(ex.title)}</h3>
                          <button class="ex-viewer-close" onclick={() => { state.selectedNum = null; }}>
                            <Icon name="x" size={11} /> {i18n.t('ex.close')}
                          </button>
                        </div>
                        <div class="ex-viewer-code">
                          <div class="ex-viewer-code-label">{i18n.t('ex.code')}</div>
                          <CodeBlock code={ex.code} commentsKey={ex.commentsKey} />
                        </div>
                        <div class="ex-viewer-preview">
                          <div class="ex-viewer-preview-label">{i18n.t('ex.live')}</div>
                          <div class="ex-viewer-preview-body">
                            {ex.render()}
                          </div>
                        </div>
                      </div>,
                    ];
                  }

                  return card;
                });
              })()}
            </div>
          </div>
        </div>
      </main>
      <DocRightToc items={[
        { href: '/docs/examples#full', label: 'Full examples' },
        { href: '/docs/examples#frontend', label: 'Frontend examples' },
        { href: '/docs/examples#backend', label: 'Backend examples' },
      ]} />
    </div>
  );
});
