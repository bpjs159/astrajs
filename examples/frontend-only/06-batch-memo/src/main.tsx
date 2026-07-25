/**
 * 09 — Batch & Memo
 *
 * `batch()`: Groups multiple mutations into ONE notification cycle.
 * `memo()`: Lazy derived computation — only re-evaluates when a dependency changes AND it's read.
 */

import { store, effect, batch, memo } from '@astrajs/core';

// ─── Store ───────────────────────────────────────────────────────────────────
const state = store({
  x: 0,
  y: 0,
  logs: [] as string[],
  updateCount: 0,
});

// ─── Memo: derived value, lazily computed ───────────────────────────────────
const sum = memo(() => {
  addLog(`🧮 memo() recalculated: ${state.x} + ${state.y} = ${state.x + state.y}`);
  return state.x + state.y;
});

const product = memo(() => {
  addLog(`🧮 memo() recalculated: ${state.x} × ${state.y} = ${state.x * state.y}`);
  return state.x * state.y;
});

function addLog(msg: string): void {
  state.logs = [...state.logs.slice(-30), `[#${state.updateCount}] ${msg}`];
}

// ─── Track total effect runs ────────────────────────────────────────────────
effect(() => {
  // This tracks both x and y — runs whenever either changes
  state.updateCount++;
});

// ─── Mount ───────────────────────────────────────────────────────────────────
const app = document.getElementById('app')!;

function render(): void {
  app.innerHTML = `
    <div class="card">
      <h1>📊 Batch & Memo</h1>
      <p class="subtitle">
        <code>batch()</code> = 1 notification · <code>memo()</code> = lazy derived value
      </p>

      <div class="grid2">
        <div class="panel">
          <h3><span class="icon">🔢</span> State</h3>
          <div class="val">x = ${state.x}</div>
          <div class="val" style="color:#a78bfa;">y = ${state.y}</div>
          <div style="display:flex;gap:4px;margin-top:12px;">
            <button class="btn btn-up" data-act="x-up">x++</button>
            <button class="btn btn-up" data-act="y-up">y++</button>
            <button class="btn btn-batch" data-act="batch">batch(x++, y++)</button>
          </div>
          <div class="desc">
            Effects run: <span class="highlight">${state.updateCount}</span>
            ${state.updateCount > 0 ? `<br>Without batch: would be ${state.updateCount * 2}` : ''}
          </div>
        </div>

        <div class="panel">
          <h3><span class="icon">🧠</span> Memo</h3>
          <div class="val">sum = ${sum()}</div>
          <div class="val" style="color:#a78bfa;">product = ${product()}</div>
          <div class="desc">
            Memo only recalculates when read AND dirty.<br>
            Reading <code>sum()</code> twice returns cached value.
          </div>
        </div>
      </div>

      <div class="log" style="margin-top:16px;">
        ${state.logs.slice(-10).map((l) => `<div class="${l.includes('batch') ? 'batch' : 'single'}">${l}</div>`).join('')}
      </div>
    </div>
  `;

  // Wire up buttons
  app.querySelectorAll('button[data-act]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const act = (btn as HTMLButtonElement).dataset.act!;
      if (act === 'x-up') state.x++;
      if (act === 'y-up') state.y++;
      if (act === 'batch') {
        batch(() => { state.x++; state.y++; });
        addLog('🔵 batch(x++, y++) — 1 notification for 2 mutations');
      }
    });
  });
}

effect(() => { render(); });
render();

(window as any).state = state;
(window as any).sum = sum;
