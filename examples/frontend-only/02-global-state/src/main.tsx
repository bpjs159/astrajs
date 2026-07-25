/**
 * 02 — Global State
 *
 * A single store shared by multiple "components" on the page.
 * Each component reads/writes the same reactive state.
 * Mutations in one component instantly update all others — O(1) per mutation.
 */

import { store, effect } from '@astrajs/core';

// ─── Shared Global Store ─────────────────────────────────────────────────────
const appStore = store({
  likes: 0,
  dislikes: 0,
  comments: 0,
});

// ─── Derived value (not a separate store — computed on read) ────────────────
function total(): number {
  return appStore.likes + appStore.dislikes + appStore.comments;
}

// ─── Mount ───────────────────────────────────────────────────────────────────
const app = document.getElementById('app')!;

function render(): void {
  app.innerHTML = `
    <h1>Global State</h1>
    <p class="subtitle">One store — shared by all components</p>
    <div class="grid">
      <div class="card" id="likes-card">
        <h3>👍 Likes</h3>
        <div class="value" id="likes-val">${appStore.likes}</div>
        <button class="btn-up" data-action="likes-up">+1 Like</button>
        <button class="btn-down" data-action="likes-down">−1 Like</button>
      </div>
      <div class="card" id="dislikes-card">
        <h3>👎 Dislikes</h3>
        <div class="value" id="dislikes-val">${appStore.dislikes}</div>
        <button class="btn-up" data-action="dislikes-up">+1 Dislike</button>
        <button class="btn-down" data-action="dislikes-down">−1 Dislike</button>
      </div>
      <div class="card" id="comments-card">
        <h3>💬 Comments</h3>
        <div class="value" id="comments-val">${appStore.comments}</div>
        <button class="btn-up" data-action="comments-up">+1 Comment</button>
        <button class="btn-down" data-action="comments-down">−1 Comment</button>
      </div>
      <div class="total-box">
        <h3>Total Interactions</h3>
        <div class="value" id="total-val">${total()}</div>
      </div>
      <p class="hint">
        All components read from <code>appStore</code> — a single reactive Proxy.
      </p>
    </div>
  `;

  // Delegate clicks
  app.querySelectorAll('button[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = (btn as HTMLButtonElement).dataset.action!;
      if (action === 'likes-up') appStore.likes++;
      if (action === 'likes-down') appStore.likes = Math.max(0, appStore.likes - 1);
      if (action === 'dislikes-up') appStore.dislikes++;
      if (action === 'dislikes-down') appStore.dislikes = Math.max(0, appStore.dislikes - 1);
      if (action === 'comments-up') appStore.comments++;
      if (action === 'comments-down') appStore.comments = Math.max(0, appStore.comments - 1);
    });
  });
}

render();

// ─── Reactive DOM Bindings ───────────────────────────────────────────────────
effect(() => {
  const el = document.getElementById('likes-val');
  if (el) el.textContent = String(appStore.likes);
});
effect(() => {
  const el = document.getElementById('dislikes-val');
  if (el) el.textContent = String(appStore.dislikes);
});
effect(() => {
  const el = document.getElementById('comments-val');
  if (el) el.textContent = String(appStore.comments);
});
effect(() => {
  const el = document.getElementById('total-val');
  if (el) el.textContent = String(total());
});

(window as any).appStore = appStore;
