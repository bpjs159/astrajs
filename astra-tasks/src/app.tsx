/**
 * astra-tasks — tablero Kanban colaborativo.
 *
 * - Mutaciones optimistas: mover/borrar aplica en la UI al instante; si el
 *   RPC falla (o el toggle de fallo simulado está activo) revierte solo.
 * - autoSync manual: el endpoint vive en otro módulo, así que el cableado
 *   del compilador no aplica → autoSync() explícito dentro de mounted().
 * - serverForm: formulario de nueva tarjeta con validación cliente+servidor.
 * - Agente AI: askAgent corre un tool-loop en el servidor y opera el tablero.
 */
import { component, store, mounted, dynamic } from 'astrajs.dev/core';
import { autoSync } from 'astrajs.dev/server';
import { form, serverForm } from 'astrajs.dev/form';
import * as validation from 'astrajs.dev/validation';
import { t, LOCALES, setLocale, currentLocale } from './i18n.js';
import { getBoard, createCard, moveCard, deleteCard, askAgent, type Board, type Card } from './server/tasks.server.js';

// ── Estado ──────────────────────────────────────────────────────────────────
const seedBoard: Board = {
  columns: [
    { id: 'todo', name: 'col.todo' },
    { id: 'doing', name: 'col.doing' },
    { id: 'done', name: 'col.done' },
  ],
  cards: [
    { id: 't1', title: 'Terminar docs de autoSync', desc: 'ETag + 304 explicado con ejemplos.', col: 'doing', order: 1 },
    { id: 't2', title: 'Diseñar el agente AI', desc: 'Tool-loop sobre el tablero.', col: 'doing', order: 2 },
    { id: 't3', title: 'Demo de rollback', desc: 'Toggle para simular fallo del servidor.', col: 'todo', order: 1 },
    { id: 't4', title: 'Prueba multi-pestaña', desc: 'Abre 2 tabs y mira la sincronización.', col: 'todo', order: 2 },
    { id: 't5', title: 'Preparar el vhost', desc: 'nginx + pm2 en producción.', col: 'done', order: 1 },
  ],
};

const ui = store({
  board: seedBoard,
  lastSync: '',
  pending: new Set<string>(),
  toast: '',
  toastOk: true,
  failMode: false,
  dragOver: null as string | null,
  question: '',
  answer: '',
  aiStatus: 'idle' as 'idle' | 'thinking',
});

let dragId: string | null = null;

function timeStr(): string {
  return new Date().toLocaleTimeString();
}

/** Aplica el tablero del servidor (salvo que haya operaciones optimistas en vuelo). */
function applyBoard(b: Board): void {
  if (ui.pending.size > 0) return;
  ui.board = { ...b, cards: [...b.cards] };
  ui.lastSync = timeStr();
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;
function showToast(msg: string, ok: boolean): void {
  ui.toast = msg;
  ui.toastOk = ok;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { ui.toast = ''; }, 2600);
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function nextOrderClient(col: Card['col']): number {
  return Math.max(0, ...ui.board.cards.filter((c) => c.col === col).map((c) => c.order)) + 1;
}

// ── Mutaciones optimistas ───────────────────────────────────────────────────
async function optimisticMove(card: Card, col: Card['col']): Promise<void> {
  if (ui.pending.has(card.id) || card.col === col) return;
  const prev = card.col;
  card.col = col; // 1) optimista: la UI cambia YA
  card.order = nextOrderClient(col);
  ui.pending = new Set(ui.pending).add(card.id);
  try {
    if (ui.failMode) {
      await delay(650); // mismo retardo que el servidor
      throw new Error('simulated');
    }
    const fresh = await moveCard(card.id, col); // 2) confirmación real
    applyBoard(fresh);
    showToast(t('toast.moved'), true);
  } catch {
    card.col = prev; // 3) rollback quirúrgico
    showToast(t('toast.rollback'), false);
  } finally {
    const next = new Set(ui.pending);
    next.delete(card.id);
    ui.pending = next;
  }
}

async function optimisticDelete(card: Card): Promise<void> {
  if (ui.pending.has(card.id)) return;
  const prevCards = [...ui.board.cards];
  ui.board = { ...ui.board, cards: ui.board.cards.filter((c) => c.id !== card.id) };
  ui.pending = new Set(ui.pending).add(card.id);
  try {
    if (ui.failMode) {
      await delay(450);
      throw new Error('simulated');
    }
    const fresh = await deleteCard(card.id);
    applyBoard(fresh);
  } catch {
    ui.board = { ...ui.board, cards: prevCards };
    showToast(t('toast.rollback'), false);
  } finally {
    const next = new Set(ui.pending);
    next.delete(card.id);
    ui.pending = next;
  }
}

function findCard(id: string | null): Card | null {
  if (!id) return null;
  return ui.board.cards.find((c) => c.id === id) ?? null;
}

// ── Header ──────────────────────────────────────────────────────────────────
function Header(): JSX.Element {
  return (
    <header class="site-header">
      <div class="brand-logo">
        <span class="bl-first">A<span class="bl-star"><img src="/images/logo_star.png" alt="" /></span></span>
        <span>STRA</span><span class="bl-js">JS</span>
        <span class="brand-sub">Tasks</span>
      </div>
      <div class="header-right">
        <label class="fail-toggle">
          <input type="checkbox" onchange={(e) => { ui.failMode = (e.currentTarget as HTMLInputElement).checked; }} />
          {t('fail.label')}
        </label>
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

// ── Tablero ─────────────────────────────────────────────────────────────────
function Column(col: Board['columns'][number]): JSX.Element {
  const cards = ui.board.cards.filter((c) => c.col === col.id).sort((a, b) => a.order - b.order);
  return (
    <div
      class={dynamic(() => `column${ui.dragOver === col.id ? ' drag-over' : ''}`)}
      ondragover={(e) => { e.preventDefault(); }}
      ondragenter={() => { ui.dragOver = col.id; }}
      ondragleave={() => { if (ui.dragOver === col.id) ui.dragOver = null; }}
      ondrop={(e) => {
        e.preventDefault();
        ui.dragOver = null;
        const card = findCard(dragId);
        if (card) void optimisticMove(card, col.id);
      }}
    >
      <div class="column-head">
        <span class="column-dot" style={`background:${col.id === 'todo' ? '#fbbf24' : col.id === 'doing' ? '#8d4dff' : '#34d399'}`} />
        <span class="column-title">{t(col.name)}</span>
        <span class="column-count">{cards.length}</span>
      </div>
      <div class="cards">
        {cards.map((card) => (
          <div
            class={dynamic(() => `task${ui.pending.has(card.id) ? ' pending' : ''}`)}
            draggable="true"
            ondragstart={() => { dragId = card.id; }}
            ondragend={() => { dragId = null; ui.dragOver = null; }}
          >
            <div class="task-title">{card.title}</div>
            {card.desc ? <div class="task-desc">{card.desc}</div> : <span />}
            <div class="task-actions">
              {col.id !== 'done' ? (
                <button class="task-btn" onclick={() => void optimisticMove(card, 'done')}>{t('card.move')}</button>
              ) : <span />}
              {col.id === 'done' || col.id === 'doing' ? (
                <button class="task-btn" onclick={() => void optimisticMove(card, 'todo')}>{t('card.back')}</button>
              ) : <span />}
              <button class="task-btn del" style="margin-left:auto" onclick={() => void optimisticDelete(card)}>{t('card.delete')}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Formulario con serverForm ───────────────────────────────────────────────
function NewCardForm(): JSX.Element {
  const formData = store({ title: '', desc: '' });
  const formCtrl = form();
  const formHandle = serverForm({
    controller: formCtrl,
    data: formData,
    serverAction: createCard,
    onSuccess: (_d: { title: string; desc: string }, card: Card) => {
      ui.board = { ...ui.board, cards: [...ui.board.cards, card] };
      formData.title = '';
      formData.desc = '';
      showToast(t('toast.moved'), true);
    },
  });
  const { submit } = formHandle;

  return (
    <section class="panel">
      <div>
        <h3>{t('card.new')}</h3>
        <p class="panel-sub">{t('card.newSub')}</p>
      </div>
      <form controller={formCtrl} onSubmit={submit}>
        <input
          name="title"
          type="text"
          placeholder={t('card.title')}
          required
          minLength={2}
          value={formData.title}
          validate={validation.minLength(2)}
        />
        {formCtrl.touched.title && formCtrl.getError('title') ? (
          <p class="field-error">{formCtrl.getError('title')}</p>
        ) : <span />}
        <textarea
          name="desc"
          placeholder={t('card.desc')}
          value={formData.desc}
        />
        <div style="margin-top:12px">
          <button class="btn" type="submit" disabled={dynamic(() => formHandle.isSubmitting)}>
            {dynamic(() => (formHandle.isSubmitting ? t('card.creating') : t('card.create')))}
          </button>
        </div>
      </form>
    </section>
  );
}

// ── Agente AI ───────────────────────────────────────────────────────────────
async function ask(): Promise<void> {
  const q = ui.question.trim();
  if (!q || ui.aiStatus === 'thinking') return;
  ui.aiStatus = 'thinking';
  ui.answer = '…';
  try {
    ui.answer = await askAgent(q);
  } catch (err) {
    ui.answer = (err as Error).message;
  }
  ui.aiStatus = 'idle';
}

function AiPanel(): JSX.Element {
  return (
    <section class="panel">
      <div>
        <h3>{t('ai.title')}</h3>
        <p class="panel-sub">{t('ai.sub')}</p>
      </div>
      <div class="chat">
        <input
          type="text"
          value={ui.question}
          placeholder={t('ai.placeholder')}
          oninput={(e) => { ui.question = (e.currentTarget as HTMLInputElement).value; }}
        />
        <div>
          <button class="btn" onclick={() => void ask()} disabled={ui.aiStatus === 'thinking'}>
            {t('ai.ask')}
          </button>
        </div>
        <div class="chat-status">{ui.aiStatus === 'thinking' ? t('ai.thinking') : t('ai.idle')}</div>
        <div class="chat-answer">{ui.answer}</div>
        <div class="tools-row">
          <span class="chat-status">{t('ai.tools')}</span>
          <span class="tool-chip">getBoard</span>
          <span class="tool-chip">moveCard</span>
          <span class="tool-chip">createCard</span>
        </div>
      </div>
    </section>
  );
}

// ── App ─────────────────────────────────────────────────────────────────────
export const App = component(() => {
  // autoSync manual (el endpoint vive en otro módulo): sondeo cada 2.5s.
  // mounted() devuelve el unsubscribe → limpieza automática al desmontar.
  if (typeof window !== 'undefined' && !(window as unknown as Record<string, unknown>).__astra_ssr__) {
    mounted(() => {
      getBoard().then(applyBoard);
      return autoSync('/api/astra/getBoard', applyBoard, { interval: 2500 });
    });
  }

  return (
    <div>
      {Header()}
      <main class="site-main">
        <section class="hero">
          <div>
            <h1>
              {t('hero.title')} <span>AstraTasks</span>
            </h1>
            <p>{t('hero.sub')}</p>
          </div>
          <div class="hero-right">
            <span class="sync-badge">
              <span class="sync-dot" />
              {t('hero.sync')} · {ui.lastSync}
            </span>
          </div>
        </section>

        <div class="board">
          {ui.board.columns.map((col) => Column(col))}
        </div>

        <div class="panel-grid">
          {NewCardForm()}
          {AiPanel()}
        </div>

        <div class="feature-strip">
          <span class="feature-tag">{t('strip.optimistic')}</span>
          <span class="feature-tag">{t('strip.rollback')}</span>
          <span class="feature-tag">{t('strip.autosync')}</span>
          <span class="feature-tag">{t('strip.form')}</span>
          <span class="feature-tag">{t('strip.agent')}</span>
        </div>
      </main>
      <footer class="site-footer">
        {t('footer')} · <a href="https://astrajs.dev" target="_blank" rel="noopener">astrajs.dev</a>
      </footer>
      <div class={dynamic(() => (ui.toastOk ? 'toast ok' : 'toast'))} hidden={!ui.toast}>{ui.toast}</div>
    </div>
  );
});
