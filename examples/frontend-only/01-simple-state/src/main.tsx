/**
 * 01 — Simple State
 *
 * The most basic AstraJS reactive store: a counter.
 * `store()` wraps a plain object in an ES6 Proxy.
 * Mutations trigger only the DOM nodes that depend on the changed property.
 */

import { store } from '@astrajs/core';

// Create reactive state — just a plain object wrapped in a Proxy
const counter = store({ value: 0 });

// Mount the UI
const app = document.getElementById('app')!;

function render(): void {
  app.innerHTML = `
    <div class="card">
      <h1>Simple State</h1>
      <p style="color:#94a3b8;margin-bottom:8px;">Reactive counter with <code>store()</code></p>
      <div class="count">${counter.value}</div>
      <div class="buttons">
        <button class="btn-dec" id="dec">− Decrement</button>
        <button class="btn-reset" id="reset">Reset</button>
        <button class="btn-inc" id="inc">+ Increment</button>
      </div>
      <p class="hint">
        Only the <code>count</code> text updates — the rest of the DOM stays untouched.
      </p>
      <p class="hint" style="margin-top:8px;">
        Open the console: <code>counter.value = 42</code>
      </p>
    </div>
  `;

  document.getElementById('inc')!.onclick = () => counter.value++;
  document.getElementById('dec')!.onclick = () => counter.value--;
  document.getElementById('reset')!.onclick = () => { counter.value = 0; };
}

// Reactive effect: re-renders whenever counter.value changes
import { effect } from '@astrajs/core';
effect(() => {
  // This effect tracks counter.value
  // Every time it changes, we update the DOM
  const countEl = document.querySelector('.count');
  if (countEl) countEl.textContent = String(counter.value);
});

// Initial render
render();

// Expose for console play
(window as any).counter = counter;
