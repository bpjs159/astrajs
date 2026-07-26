/**
 * 05 — CSS Macro · Demo
 *
 * The `css` macro is processed at build time by the compiler.
 * Classes are extracted to static CSS with hashes and replaced
 * with a { className: 'hashedName' } object.
 */

import { store, effect } from '@astrajs/core';
import { styles } from './styles.js';

// Simulation of what the compiler generates at build time:
// import { css } from '@astrajs/compiler';
// const styles = css`.card { ... }`;
// → Becomes: { card: 'card_a3f2c1', ... }
const compilado = {
  card: 'card_a3f2c1',
  title: 'title_b9e4d7',
  button: 'button_c1a8f6',
  badge: 'badge_d5e2b3',
};

// ─── Reactive state for the demo ────────────────────────────────────────────
const state = store({ theme: 'primary' as string, clicks: 0 });

const themes = ['primary', 'success', 'warning', 'danger'];
const themeLabels: Record<string, string> = { primary: 'Primary', success: 'Success', warning: 'Warning', danger: 'Danger' };
const themeDescriptions: Record<string, string> = {
  primary: 'Indigo gradient — your main brand color',
  success: 'Green gradient — for positive actions & confirmations',
  warning: 'Amber gradient — for warnings and alerts',
  danger: 'Red gradient — for destructive actions & errors',
};

// ─── Mount ───────────────────────────────────────────────────────────────────
const app = document.getElementById('app')!;

function render(): void {
  const theme = state.theme;

  app.innerHTML = `
    <div class="demo-grid">
      <div class="box box-${theme}" style="cursor:pointer;" id="theme-box">
        <h3>🎨 ${themeLabels[theme] ?? theme}</h3>
        <p>${themeDescriptions[theme] ?? ''}</p>
        <p style="margin-top:12px;font-size:.75rem;opacity:.7;">Click to cycle theme</p>
        <p style="margin-top:4px;font-size:.75rem;opacity:.7;">Clicks: ${state.clicks}</p>
      </div>
      <div class="code-block">
        <pre><span class="kw">import</span> { css } <span class="kw">from</span> <span class="str">'@astrajs/compiler'</span>;

<span class="kw">const</span> styles = <span class="fn">css</span><span class="str">\`
  .card {
    padding: 16px;
    border-radius: 8px;
    background: </span><span class="highlight">linear-gradient(...)</span><span class="str">;
  }
  .card:hover {
    transform: translateY(-4px);
  }
\`</span>;

<span class="comment" style="color:#64748b;">// ↓ Compiles to at build time ↓</span>
<span class="kw">const</span> styles = {
  card: <span class="str">'card_a3f2c1'</span>,
};</pre>
        <p style="margin-top:12px;font-size:.75rem;color:#64748b;">
          ← CSS extracted to <code>sc-card_a3f2c1.css</code>
        </p>
      </div>
    </div>

    <div class="code-block" style="margin-top:20px;">
      <p style="color:#94a3b8;font-size:.85rem;margin-bottom:8px;">
        📁 <strong>Build output</strong> — class names use content hashes for zero-conflict scoping:
      </p>
      <pre>${JSON.stringify(compilado, null, 2)}</pre>
    </div>
  `;

  document.getElementById('theme-box')!.onclick = () => {
    const idx = themes.indexOf(state.theme);
    state.theme = themes[(idx + 1) % themes.length]!;
    state.clicks++;
  };
}

effect(() => { render(); });
render();

(window as any).state = state;
(window as any).styles = styles;
