/**
 * {{PROJECT_NAME}} — entry point.
 *
 * This is the whole app: a reactive counter built on fine-grained
 * Proxy reactivity. The component runs ONCE — the compiler turns
 * {counter.value} into an O(1) effect that updates only that TextNode.
 */
import { component, store } from 'astrajs.dev/core';

const style = document.createElement('style');
style.textContent = `
  /* === FONTS (loaded from astrajs.dev) === */
  @font-face {
    font-family: 'Fauna Pro';
    src: url('https://astrajs.dev/fonts/fauna/FaunaPro-Regular.ttf') format('truetype');
    font-weight: 400;
    font-style: normal;
  }
  @font-face {
    font-family: 'Fauna Pro';
    src: url('https://astrajs.dev/fonts/fauna/FaunaPro-Medium.ttf') format('truetype');
    font-weight: 500;
    font-style: normal;
  }
  @font-face {
    font-family: 'Fauna Pro';
    src: url('https://astrajs.dev/fonts/fauna/FaunaPro-Semibold.ttf') format('truetype');
    font-weight: 600;
    font-style: normal;
  }
  @font-face {
    font-family: 'Fauna Pro';
    src: url('https://astrajs.dev/fonts/fauna/FaunaPro-Bold.ttf') format('truetype');
    font-weight: 700;
    font-style: normal;
  }

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
  /* ── Hero (logo + text) ───────────────────────────────── */
  .hero { text-align: center; margin-bottom: 40px; }
  .hero-logo {
    width: 120px;
    height: auto;
    object-fit: contain;
    margin-bottom: 16px;
    filter: drop-shadow(0 0 30px rgba(139, 77, 255, 0.4)) drop-shadow(0 0 60px rgba(77, 124, 255, 0.2));
  }
  .hero-word {
    font-family: 'Fauna Pro', serif;
    font-size: 2.4rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    margin-bottom: 8px;
    color: #fff;
  }
  .hero-js {
    background: linear-gradient(135deg, #b84cff, #4d7cff);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .hero p { color: #64748b; font-size: 0.85rem; }
  /* ── Counter card ─────────────────────────────────────── */
  .card {
    background: #0a0f1a;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 16px;
    padding: 48px 64px;
    text-align: center;
  }
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
    <div class="app-root">
      <div class="hero">
        <img class="hero-logo" src="https://astrajs.dev/images/logo.png" alt="AstraJS" />
        <h1 class="hero-word">ASTRA<span class="hero-js">JS</span></h1>
        <p>Zero VDOM. Surgical DOM updates. O(1) reactivity.</p>
      </div>
      <div class="card">
        <span class="count">{counter.value}</span>
        <div class="buttons">
          <button onclick={() => counter.value--}>− 1</button>
          <button onclick={() => counter.value++}>+ 1</button>
        </div>
      </div>
    </div>
  );
});

/* Mount */
const root = document.getElementById('app');
if (root) {
  root.appendChild(App({}) as unknown as Node);
}
