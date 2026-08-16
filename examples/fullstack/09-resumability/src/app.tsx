/**
 * 09 — Resumability · App Component
 *
 * This is how the developer writes the component — NORMAL JSX with
 * `onClick={fn}`. The framework handles the rest:
 *
 * - During SSR: onClick → astra-on:click (auto-converted by JSX runtime)
 * - State is serialized as astra-data in the HTML
 * - On the client: bootstrap() auto-detects SSR markers and resumes
 *
 * The developer never writes astra-on:click or astra-data manually.
 */

import { store } from '@bpjs159/core';

// ─── Reactive state ──────────────────────────────────────────────────────────

const counter = store({ count: 0 });

// ─── Handler functions ───────────────────────────────────────────────────────
// Plain functions that close over the reactive store.
// registerHandler() calls are AUTO-INJECTED by the compiler when
// resumability: true is set in astra.config.json — no manual setup.

export function handleIncrement(): void {
  counter.count++;
}

export function handleDecrement(): void {
  counter.count--;
}

// ─── Component ───────────────────────────────────────────────────────────────
// Normal JSX with onClick={fn}. The compiler auto-converts to
// astra-on:click during SSR and auto-injects registerHandler() calls.

export function Counter(): JSX.Element {
  return (
    <div class="card">
      <div class="header">
        <h1>⚡ Resumability</h1>
        <p>
          Write normal <code>onClick</code> JSX — the framework
          auto-converts to <code>astra-on:click</code> during SSR
        </p>
      </div>
      <div class="body">
        <div class="counter">
          <button class="btn" onClick={handleDecrement}>−</button>
          <span class="count">{counter.count}</span>
          <button class="btn" onClick={handleIncrement}>+</button>
        </div>

        <div class="info">
          <p>
            <strong>View page source</strong> — the HTML has
            <code>astra-data</code> with the initial state and
            <code>astra-on:click</code> attributes.
            <strong>Zero hydration</strong> — the component is never
            re-executed in the browser.
          </p>
        </div>

        <div class="status" id="status">
          ⚡ Resumed from SSR — no hydration needed
        </div>
      </div>
    </div>
  );
}
