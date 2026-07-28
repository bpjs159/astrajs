/**
 * 08 — Lifecycle Demo
 *
 * Demonstrates mounted() / unmount cleanup via the Timer component.
 *
 * ## Zero-VDOM transparent DX
 *
 * The compiler auto-wraps reactive JSX expressions with `dynamic()`.
 * You write plain JSX — `{$.show ? <Timer /> : <p>}</p>` — and the
 * compiler injects `dynamic(() => ...)` automatically. Each expression
 * gets its own micro-effect for O(1) surgical DOM updates.
 */
import { component, store } from '@astrajs/core';
import { Timer } from './timer.js';

// ── Main component ──────────────────────────────────────────────────────────

export const LifecycleDemo = component(() => {
  const $ = store((self) => ({
    show: true,
    logs: [] as string[],
    addLog(msg: string) { self.logs = [...self.logs, '[' + new Date().toLocaleTimeString() + '] ' + msg]; },
    clearLogs() { self.logs = []; }
  }));

  return (
    <div class="card">
      <h1>mounted() / Unmount</h1>
      <p class="subtitle">Lifecycle tied to DOM insertion & removal</p>

      {$.show ? (
        <Timer
          onMount={() => $.addLog('[Timer] mounted — interval started')}
          onUnmount={() => $.addLog('[Timer] unmounted — interval cleared')}
        />
      ) : (
        <p style="color:#64748b;padding:20px;">Timer hidden — unmount cleanup ran</p>
      )}

      <button class="btn btn-toggle" onClick={() => $.show = !$.show}>
        {$.show ? 'Unmount' : 'Mount'} Timer
      </button>
      <button class="btn btn-reset" onClick={() => $.clearLogs()}>
        Clear Log
      </button>

      <div class="log">
        {$.logs.map((entry: string) => (
          <div>{entry}</div>
        ))}
      </div>
    </div>
  );
});
