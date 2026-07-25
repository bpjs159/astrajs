/**
 * 10 — Effects & Cleanup
 *
 * `effect()` auto-tracks dependencies and re-runs when they change.
 * Cleanup functions run before each re-run (and on final teardown).
 *
 * This demo shows:
 * - A timer that runs via an effect
 * - Effect cleanup stops the timer
 * - Multiple effects can coexist
 */

import { store, effect, untrack } from '@astrajs/core';

// ─── Store ───────────────────────────────────────────────────────────────────
const state = store({
  running: false,
  seconds: 0,
  logs: [] as string[],
  effectRuns: 0,
});

function addLog(msg: string, cls: string): void {
  state.logs = [...state.logs.slice(-30), { msg, cls, id: Date.now() }];
}

// ─── Timer Effect ────────────────────────────────────────────────────────────
let timerHandle: ReturnType<typeof setInterval> | null = null;

effect(() => {
  state.effectRuns++;
  addLog('🎬 Effect started (subscribed to state.running)', 'created');

  if (state.running) {
    timerHandle = setInterval(() => {
      // Use batch to group the seconds increment with potential log
      state.seconds++;
      if (state.seconds % 5 === 0) {
        addLog(`⏱ Tick: ${state.seconds}s`, 'tick');
      }
    }, 1000);
    addLog('▶ Timer started', 'created');
  }

  // ─── Cleanup: runs BEFORE the effect re-executes ─────────────────────────
  return () => {
    if (timerHandle !== null) {
      clearInterval(timerHandle);
      timerHandle = null;
      addLog('🧹 Cleanup: timer cleared', 'cleanup');
    }
  };
});

// ─── Watcher Effect (logs every state change, but untracks seconds) ────────
effect(() => {
  const isRunning = state.running;
  // Read seconds without subscribing (won't re-run on seconds change)
  const sec = untrack(() => state.seconds);
  addLog(`👁 Watcher: running=${isRunning}, seconds=${sec}`, 'tick');
});

// ─── Mount ───────────────────────────────────────────────────────────────────
const app = document.getElementById('app')!;

function render(): void {
  const mins = Math.floor(state.seconds / 60);
  const secs = state.seconds % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  app.innerHTML = `
    <div class="card">
      <h1>⚡ Effects & Cleanup</h1>
      <p class="subtitle">
        <code>effect(fn)</code> auto-tracks deps · cleanup runs before re-execution
      </p>

      <div class="timer-display">
        <div class="time">${timeStr}</div>
        <div class="status ${state.running ? 'status-running' : 'status-stopped'}">
          ${state.running ? '▶ Running' : '⏸ Stopped'}
        </div>
      </div>

      <div class="btn-row">
        <button class="btn btn-start" id="btn-start" ${state.running ? 'disabled' : ''}>
          ▶ Start
        </button>
        <button class="btn btn-stop" id="btn-stop" ${!state.running ? 'disabled' : ''}>
          ⏹ Stop
        </button>
        <button class="btn btn-reset" id="btn-reset">
          ↺ Reset
        </button>
      </div>

      <p style="text-align:center;font-size:.75rem;color:#64748b;margin-bottom:12px;">
        Effect has run <span class="highlight">${state.effectRuns}</span> time${state.effectRuns !== 1 ? 's' : ''}
        &nbsp;|&nbsp; Cleanup runs before each re-execution
      </p>

      <div class="log-panel">
        ${state.logs.slice(-15).map((l: {msg:string;cls:string}) =>
          `<div class="${l.cls}">${l.msg}</div>`
        ).join('')}
      </div>
    </div>
  `;

  document.getElementById('btn-start')!.onclick = () => { state.running = true; };
  document.getElementById('btn-stop')!.onclick = () => { state.running = false; };
  document.getElementById('btn-reset')!.onclick = () => {
    state.running = false;
    state.seconds = 0;
  };
}

effect(() => { render(); });
render();

addLog('🚀 App mounted', 'created');

(window as any).state = state;
