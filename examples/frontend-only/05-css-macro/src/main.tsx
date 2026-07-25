/**
 * 05 — CSS Macro (`css` tagged template)
 *
 * At build time, the Vite compiler extracts `css`...`` templates
 * into static `.css` files with hashed class names.
 *
 * The `css` call is replaced with a `{ className: 'hashedName' }` map.
 * Zero runtime CSS-in-JS overhead — just a plain object.
 *
 * This demo simulates the output of that compilation.
 */

import { store, effect } from '@astrajs/core';

// ─── Simulated: what `css`...`` compiles to at build time ───────────────────
// In production, write:
//   import { css } from '@astrajs/compiler';
//   const styles = css`.card { padding: 16px; border-radius: 8px; }`;
// The compiler extracts the CSS to a static file and replaces the call:
const styles = {
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
      <pre>${JSON.stringify(styles, null, 2)}</pre>
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
