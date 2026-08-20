/**
 * astra-dash — dashboard en tiempo real.
 *
 * - autoSync: getSnapshot() dentro de mounted() → el compilador cablea el
 *   polling con ETag (el cliente solo recibe datos cuando cambian).
 * - AI streaming: askInsight(q, onToken) muta un TextNode por token.
 * - Upload: lectura en chunks con barra de progreso → RPC tipado.
 * - Resumibilidad: la isla se inyecta como HTML con estado serializado y
 *   se reanuda sin re-ejecutar el componente.
 */
import { component, store, mounted } from 'astrajs.dev/core';
import { autoSync } from 'astrajs.dev/server';
import { t, LOCALES, setLocale, currentLocale } from './i18n.js';
import { getSnapshot, uploadReport, type Snapshot } from './server/dash.server.js';
import { askInsight } from './ai.js';
import { resumeIslandHtml, wireResumeIsland } from './resume-island.js';

// ── Estado reactivo (misma semilla que el servidor para que el primer
//    pintado y el HTML prerenderizado coincidan) ─────────────────────────
const state = store({
  snapshot: {
    visits: 8421,
    orders: 517,
    revenue: 23480,
    cpu: 34,
    history: [42, 45, 41, 52, 55, 49, 60, 58, 66, 61, 70, 68, 74, 71, 78, 76, 81, 79, 85, 82, 88, 86, 91, 89],
    lastTick: 0,
  } as Snapshot,
  lastSync: '',
  question: '',
  answer: '',
  aiStatus: 'idle' as 'idle' | 'streaming' | 'done' | 'error',
  upProgress: 0,
  uploading: false,
  report: null as null | { name: string; bytes: number; rows: number; cols: number },
  uploadError: '',
});

function timeStr(): string {
  return new Date().toLocaleTimeString();
}

function applySnapshot(s: Snapshot): void {
  state.snapshot = s;
  state.lastSync = timeStr();
}

function formatNum(n: number): string {
  return n.toLocaleString(currentLocale());
}

// ── Header ──────────────────────────────────────────────────────────────
function Header(): JSX.Element {
  return (
    <header class="site-header">
      <div class="brand-logo" onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <span class="bl-first">A</span>
        <span>STRA</span><span class="bl-js">JS</span>
        <span class="brand-sub">Dash</span>
      </div>
      <nav class="site-nav">
        <a href="#kpis">{t('kpi.visits')}</a>
        <a href="#ai">{t('ai.title')}</a>
        <a href="#upload">{t('up.title')}</a>
        <a href="#resume">{t('resume.title')}</a>
      </nav>
      <div class="header-right">
        <a class="docs-link" href="https://astrajs.dev" target="_blank" rel="noopener">Volver a Docs ↗</a>
        <select
          class="lang-select"
          value={currentLocale()}
          onchange={(e) => setLocale((e.currentTarget as HTMLSelectElement).value)}
        >
          {LOCALES.map((l) => (
            <option value={l.code} selected={l.code === currentLocale()}>{l.label}</option>
          ))}
        </select>
      </div>
    </header>
  );
}

// ── Hero ────────────────────────────────────────────────────────────────
function Hero(): JSX.Element {
  return (
    <section class="hero">
      <div>
        <h1>
          {t('hero.title')}{' '}
          <span>AstraDash</span>
        </h1>
        <p>{t('hero.sub')}</p>
      </div>
      <div class="live-badge">
        <span class="live-dot" />
        {t('hero.live')} · {t('hero.sync')} {state.lastSync}
      </div>
    </section>
  );
}

// ── KPIs en vivo ────────────────────────────────────────────────────────
function Kpis(): JSX.Element {
  const s = state.snapshot;
  return (
    <section class="block" id="kpis">
      <h2 class="section-title">{t('chart.title')}</h2>
      <p class="section-sub">{t('chart.sub')}</p>
      <div class="kpi-grid">
        <div class="kpi">
          <div class="kpi-label">{t('kpi.visits')}</div>
          <div class="kpi-value">{formatNum(s.visits)}</div>
          <div class="kpi-delta">+{Math.max(1, Math.round(s.visits % 9))} hoy</div>
        </div>
        <div class="kpi">
          <div class="kpi-label">{t('kpi.orders')}</div>
          <div class="kpi-value">{formatNum(s.orders)}</div>
          <div class="kpi-delta">+{Math.max(1, s.orders % 4)} recientes</div>
        </div>
        <div class="kpi">
          <div class="kpi-label">{t('kpi.revenue')}</div>
          <div class="kpi-value">{formatNum(s.revenue)} <span style="font-size:1rem;color:#64748b">{t('kpi.revenue.unit')}</span></div>
          <div class="kpi-delta">+{(s.revenue % 500) + 40} hoy</div>
        </div>
        <div class="kpi">
          <div class="kpi-label">{t('kpi.cpu')}</div>
          <div class="kpi-value">{s.cpu}<span style="font-size:1rem;color:#64748b">{t('kpi.cpu.unit')}</span></div>
          <div class="kpi-delta">{(s.cpu % 6) - 3} pts</div>
        </div>
      </div>
      <div class="chart-card" style="margin-top:18px">
        <div class="chart-head">
          <h3>{t('chart.title')}</h3>
          <span class="chart-last">{t('hero.sync')} {state.lastSync}</span>
        </div>
        <div class="chart-bars">
          {(() => {
            const hist = state.snapshot.history;
            const max = Math.max(...hist, 1);
            return hist.map((v, i) => (
              <div class="chart-col">
                <div class="chart-bar" style={`height:${Math.max(4, Math.round((v / max) * 100))}%`} />
                {i % 4 === 0 ? <span class="chart-label">{v}</span> : <span class="chart-label" />}
              </div>
            ));
          })()}
        </div>
      </div>
    </section>
  );
}

// ── AI en streaming ─────────────────────────────────────────────────────
function sendQuestion(): void {
  const q = state.question.trim();
  if (!q || state.aiStatus === 'streaming') return;
  state.aiStatus = 'streaming';
  state.answer = '';
  askInsight(q, (chunk: string) => {
    state.answer += chunk;
  })
    .then(() => { state.aiStatus = 'done'; })
    .catch((err: Error) => { state.aiStatus = 'error'; state.answer = err.message; });
}

function AiPanel(): JSX.Element {
  return (
    <section class="panel" id="ai">
      <div>
        <h3>{t('ai.title')}</h3>
        <p class="panel-sub">{t('ai.sub')}</p>
      </div>
      <textarea
        value={state.question}
        oninput={(e) => { state.question = (e.currentTarget as HTMLTextAreaElement).value; }}
        placeholder={t('ai.placeholder')}
      />
      <div>
        <button class="btn" onclick={sendQuestion} disabled={state.aiStatus === 'streaming'}>
          {t('ai.send')}
        </button>
      </div>
      <div class="ai-status">
        {state.aiStatus === 'streaming' ? t('ai.streaming') : state.aiStatus === 'done' ? t('ai.done') : state.aiStatus === 'error' ? t('ai.error') : t('ai.idle')}
      </div>
      <div class="ai-answer">
        {state.answer}
        <span class={state.aiStatus === 'streaming' ? 'cursor' : 'cursor off'} />
      </div>
    </section>
  );
}

// ── Upload con progreso ─────────────────────────────────────────────────
async function handleFile(e: Event): Promise<void> {
  const input = e.currentTarget as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  state.uploading = true;
  state.upProgress = 0;
  state.uploadError = '';
  state.report = null;
  try {
    const CHUNK = 256 * 1024;
    let offset = 0;
    let text = '';
    while (offset < file.size) {
      const blob = file.slice(offset, Math.min(offset + CHUNK, file.size));
      text += await blob.text();
      offset += CHUNK;
      state.upProgress = Math.min(99, Math.round((offset / Math.max(file.size, 1)) * 100));
    }
    const res = await uploadReport(text, file.name);
    if (!res.ok) {
      state.uploadError = t(res.error);
    } else {
      state.report = res.summary;
      state.upProgress = 100;
    }
  } catch (err) {
    state.uploadError = (err as Error).message;
  } finally {
    state.uploading = false;
    input.value = '';
  }
}

function UploadPanel(): JSX.Element {
  return (
    <section class="panel" id="upload">
      <div>
        <h3>{t('up.title')}</h3>
        <p class="panel-sub">{t('up.sub')}</p>
      </div>
      <label class="drop-zone">
        {state.uploading ? t('up.uploading') : t('up.choose')}
        <input type="file" accept=".csv,.txt,.json" onchange={(e) => { void handleFile(e); }} />
      </label>
      <div class="progress">
        <div class="progress-fill" style={`width:${state.upProgress}%`} />
      </div>
      <div class="upload-meta">
        <span>{state.upProgress}%</span>
        <span>{state.uploading ? t('up.uploading') : state.report ? t('up.done') : ''}</span>
      </div>
      {state.report ? (
        <div class="report">
          <span><strong>{state.report.name}</strong></span>
          <span>{state.report.rows} {t('up.rows')}</span>
          <span>{state.report.cols} {t('up.cols')}</span>
          <span>{state.report.bytes.toLocaleString()} {t('up.bytes')}</span>
        </div>
      ) : null}
      {state.uploadError ? <div class="upload-error">{state.uploadError}</div> : null}
    </section>
  );
}

// ── Isla resumible ──────────────────────────────────────────────────────
function ResumeIsland(): JSX.Element {
  const el = document.createElement('div');
  el.innerHTML = resumeIslandHtml({
    title: t('resume.title'),
    sub: t('resume.sub'),
    pill: t('resume.pill'),
    bump: t('resume.bump'),
    reset: t('resume.reset'),
    noteA: t('resume.note'),
    noteB: ' + ',
    noteC: '',
  });
  wireResumeIsland(el);
  return el;
}

// ── Footer ──────────────────────────────────────────────────────────────
function Footer(): JSX.Element {
  return (
    <footer class="site-footer">
      {t('footer')} · <a href="https://astrajs.dev" target="_blank" rel="noopener">astrajs.dev</a>
    </footer>
  );
}

// ── App ─────────────────────────────────────────────────────────────────
export const App = component(() => {
  // autoSync: el endpoint vive en otro módulo, así que el cableado automático
  // del compilador (que solo sigue server() del mismo archivo) no aplica —
  // registramos el polling a mano. mounted() limpia al desmontar (unsubscribe).
  if (typeof window !== 'undefined' && !(window as unknown as Record<string, unknown>).__astra_ssr__) {
    mounted(() => {
      applySnapshot(state.snapshot);
      getSnapshot().then(applySnapshot);
      return autoSync('/api/astra/getSnapshot', applySnapshot, { interval: 2500 });
    });
  }

  return (
    <div>
      {Header()}
      <main class="site-main">
        {Hero()}
        {Kpis()}
        <div class="panel-grid">
          {AiPanel()}
          {UploadPanel()}
        </div>
        <div class="feature-strip">
          <span class="feature-tag">{t('strip.autoSync')}</span>
          <span class="feature-tag">{t('strip.ai')}</span>
          <span class="feature-tag">{t('strip.upload')}</span>
          <span class="feature-tag">{t('strip.resume')}</span>
          <span class="feature-tag">{t('strip.isr')}</span>
        </div>
        {ResumeIsland()}
      </main>
      {Footer()}
    </div>
  );
});
