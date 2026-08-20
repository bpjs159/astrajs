import { component, store } from 'astrajs.dev/core';

/**
 * Reactive counter — the classic AstraJS example.
 * The component body runs exactly once; {state.value} compiles into
 * an O(1) effect that updates only its own TextNode.
 */
export const Counter = component(() => {
  const state = store({ value: 0 });

  const btnStyle = `
    .counter-card { display: inline-flex; align-items: center; gap: 16px;
      background: #0a0f1a; border: 1px solid rgba(255,255,255,.07);
      border-radius: 16px; padding: 24px 32px; margin-top: 24px; }
    .counter-card button { padding: 8px 20px; border-radius: 8px; border: none;
      background: linear-gradient(135deg, #8d4dff, #4d7cff); color: #fff;
      font-weight: 600; cursor: pointer; }
    .counter-card button:hover { filter: brightness(1.1); }
    .counter-card .count { font-size: 1.5rem; font-weight: 800; min-width: 32px;
      text-align: center; color: #fff; }
  `;

  return (
    <div class="counter-card">
      <style>{btnStyle}</style>
      <button onclick={() => state.value--}>− 1</button>
      <span class="count">{state.value}</span>
      <button onclick={() => state.value++}>+ 1</button>
    </div>
  );
});
