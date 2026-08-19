/**
 * 05 — CSS Macro · Native Dark Mode with CSS Custom Properties
 *
 * `css\`...\`` defines CSS custom properties for light/dark themes
 * at build time. `prefers-color-scheme` is used for the `system` mode
 * so the OS preference is respected with zero JavaScript.
 *
 * Three modes:
 * - `system` — follows OS preference via @media (prefers-color-scheme)
 * - `light`  — forces light theme
 * - `dark`   — forces dark theme
 *
 * Key concepts:
 * - `css\`...\`` + CSS custom properties = design tokens at build time
 * - `data-theme` attribute + `@media (prefers-color-scheme)` = native dark mode
 * - Zero runtime CSS — the `css` import is stripped at compile time
 */
import { component, store, classes } from 'astrajs.dev/core';
import { styles } from './styles.js';

type ThemeMode = 'system' | 'light' | 'dark';
const modes: ThemeMode[] = ['system', 'light', 'dark'];
const modeLabels: Record<ThemeMode, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

export const CSSDemo = component(() => {
  const cssDemoStore = store({ mode: 'system' as ThemeMode, clicks: 0 });

  const cycleMode = () => {
    const currentIndex = modes.indexOf(cssDemoStore.mode);
    cssDemoStore.mode = modes[(currentIndex + 1) % modes.length]!;
    cssDemoStore.clicks++;
  };

  return (
    <div>
      <h1>CSS Macro</h1>
      <p class="subtitle"><code>css\`...\`</code> + CSS custom properties = native dark mode at build time</p>
      <div class="demo-grid">
        <div class={classes(styles.card)} data-theme={cssDemoStore.mode} onClick={cycleMode}>
          <span class={styles.badge}>{modeLabels[cssDemoStore.mode]}</span>
          <h2>Click to cycle theme</h2>
          <p>This card uses <code>--bg</code>, <code>--text</code>, <code>--accent</code> custom properties defined in <code>css\`...\`</code>.</p>
          <p style="margin-top:16px;font-size:.75rem;opacity:.6;">Clicks: {cssDemoStore.clicks}</p>
        </div>
        <div class="code-block">
          <pre><span class="kw">const</span> <span class="fn">styles</span> = <span class="fn">css</span><span class="str">\`</span>
  <span class="prop">.card</span> {'{'}
    <span class="prop">--bg</span>: #fff;
    <span class="prop">--text</span>: #1e293b;
    <span class="prop">--accent</span>: #6366f1;
    <span class="prop">background</span>: <span class="kw">var</span>(<span class="prop">--bg</span>);
    <span class="prop">color</span>: <span class="kw">var</span>(<span class="prop">--text</span>);
  {'}'}

  <span class="comment">// Forces dark when data-theme="dark"</span>
  <span class="prop">.card[data-theme="dark"]</span> {'{'}
    <span class="prop">--bg</span>: #1e293b;
    <span class="prop">--text</span>: #f1f5f9;
    <span class="prop">--accent</span>: #818cf8;
  {'}'}

  <span class="comment">// Respects OS preference</span>
  <span class="kw">@media</span> (<span class="prop">prefers-color-scheme</span>: dark) {'{'}
    <span class="prop">.card[data-theme="system"]</span> {'{'}
      <span class="prop">--bg</span>: #1e293b;
      <span class="prop">--text</span>: #f1f5f9;
    {'}'}
  {'}'}
<span class="str">\`</span>;</pre>
        </div>
      </div>
    </div>
  );
});

