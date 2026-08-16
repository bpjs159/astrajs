import { component, store } from 'astrajs.dev/core';

/**
 * Reactive counter — the classic AstraJS example.
 * The component body runs exactly once; {state.value} compiles into
 * an O(1) effect that updates only its own TextNode.
 */
export const Counter = component(() => {
  const state = store({ value: 0 });

  const btnStyle = `
    button { padding: 8px 20px; margin-right: 8px; border-radius: 8px; border: none;
             background: linear-gradient(135deg, #8d4dff, #4d7cff); color: #fff;
             font-weight: 600; cursor: pointer; }
    span.count { font-size: 1.5rem; font-weight: 800; margin: 0 16px; color: #fff; }
  `;

  return (
    <div style="margin-top:24px">
      <style>{btnStyle}</style>
      <button onclick={() => state.value--}>− 1</button>
      <span class="count">{state.value}</span>
      <button onclick={() => state.value++}>+ 1</button>
    </div>
  );
});
