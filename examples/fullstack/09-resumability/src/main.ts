/**
 * 09 — Resumability · Client Entry (Transparent Mode)
 *
 * Transparent resumability via bootstrap():
 *
 *   bootstrap(App)
 *
 * The framework auto-detects SSR vs CSR and handles both paths.
 * No manual resume(), no astra-on:click, no astra-data in app code.
 *
 * SSR mode (HTML has [astra-data]):
 *   1. Deserializes state from astra-data → reactive Proxies
 *   2. Installs registerHandler() handlers on window
 *   3. Registers delegated event listeners for astra-on:*
 *
 * CSR mode (no [astra-data]):
 *   1. Executes the component normally with addEventListener
 */

import { bootstrap } from 'astrajs.dev/ssr';
import { bindText, store } from 'astrajs.dev/core';
import { Counter } from './app.js';

// ─── Bootstrap ───────────────────────────────────────────────────────────────
// Single call — handles both SSR resume and CSR mount transparently.
// The registerHandler() calls in app.tsx ensure handlers are installed
// on window in SSR mode for the delegated astra-on:click system.

bootstrap(Counter, '#app');

// ─── Reactive DOM bindings (SSR mode) ────────────────────────────────────────
//
// The server rendered <span class="count">0</span> as static text.
// After resume(), we deserialize the state from astra-data and wire
// bindText so the count display updates in O(1) when the store changes.
//
// The handlers on window are pointed at this SSR-deserialized store so
// clicks on the pre-rendered buttons mutate the correct data.

const hasSSRData = document.querySelector('[astra-data]') !== null;

if (hasSSRData) {
  const card = document.querySelector('[astra-data]')!;
  const raw = card.getAttribute('astra-data')!;
  const state = store(JSON.parse(raw)) as { count: number };

  // Wire reactive count display (O(1) DOM mutation via Proxy)
  const countEl = card.querySelector<HTMLElement>('.count')!;
  const textNode = document.createTextNode('');
  countEl.textContent = '';
  countEl.appendChild(textNode);
  bindText(textNode, () => String(state.count));

  // Override window handlers to mutate the SSR-deserialized store
  // (the registerHandler() ones close over the CSR store; we replace
  // them here for the SSR path so the pre-rendered buttons update
  // the resumed state)
  (window as unknown as Record<string, unknown>).handleIncrement = () => {
    state.count++;
  };
  (window as unknown as Record<string, unknown>).handleDecrement = () => {
    state.count--;
  };
}
