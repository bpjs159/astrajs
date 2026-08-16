/**
 * {{PROJECT_NAME}} — entry point.
 *
 * This is the whole app: a reactive counter built on fine-grained
 * Proxy reactivity. The component runs ONCE — the compiler turns
 * {counter.value} into an O(1) effect that updates only that TextNode.
 */
import { component, store } from 'astrajsx/core';

const style = document.createElement('style');
style.textContent = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: system-ui, sans-serif;
    background: #04060d;
    color: #e2e8f0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .card {
    background: #0a0f1a;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 16px;
    padding: 48px 64px;
    text-align: center;
  }
  .card h1 {
    font-size: 1.6rem;
    font-weight: 800;
    margin-bottom: 8px;
    background: linear-gradient(135deg, #b84cff, #4d7cff);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .card p { color: #64748b; font-size: 0.85rem; margin-bottom: 24px; }
  .count {
    font-size: 3rem;
    font-weight: 800;
    color: #fff;
    display: block;
    margin-bottom: 24px;
  }
  .buttons { display: flex; gap: 12px; justify-content: center; }
  button {
    font-size: 0.9rem;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, #8d4dff, #4d7cff);
    border: none;
    border-radius: 10px;
    padding: 12px 28px;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
  }
  button:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(139, 77, 255, 0.35); }
`;
document.head.appendChild(style);

export const App = component(() => {
  const counter = store({ value: 0 });

  return (
    <div class="card">
      <h1>ASTRAJS</h1>
      <p>Zero VDOM. Surgical DOM updates. O(1) reactivity.</p>
      <span class="count">{counter.value}</span>
      <div class="buttons">
        <button onclick={() => counter.value--}>− 1</button>
        <button onclick={() => counter.value++}>+ 1</button>
      </div>
    </div>
  );
});

/* Mount */
const root = document.getElementById('app');
if (root) {
  root.appendChild(App({}) as unknown as Node);
}
