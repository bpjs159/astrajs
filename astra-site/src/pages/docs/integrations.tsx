/**
 * astra-site — Docs: Integraciones
 *
 * Cómo convive AstraJS con Tailwind CSS, MUI y el resto del ecosistema.
 * Principio general: como AstraJS compila JSX a DOM REAL (sin runtime
 * propietario), cualquier librería que hable DOM funciona directamente.
 */
import { component, dynamic } from 'astrajs.dev/core';
import { DocSidebar } from '../../components/docs-sidebar.js';
import { DocRightToc } from '../../components/doc-right-toc.js';
import { Icon } from '../../components/icon.js';
import { i18n } from '../../i18n.js';
import { CodeBlock } from '../../components/code-block.js';

const s = `
  .docs-layout{display:flex;min-height:100vh}
  .docs-main{flex:1;min-width:0;margin-left:260px;padding:48px 56px;max-width:860px}
  @media(max-width:960px){.docs-main{margin-left:0;padding:32px 24px}}
  .docs-content h1{font-size:2rem;font-weight:800;color:#f7f7ff;margin-bottom:12px;letter-spacing:-.02em}
  .docs-content h2{font-size:1.3rem;font-weight:700;color:#f7f7ff;margin:40px 0 14px;padding-top:20px;border-top:1px solid rgba(255,255,255,.06);letter-spacing:-.01em}
  .docs-content h2:first-of-type{border-top:none;margin-top:28px}
  .docs-content h3{font-size:1.05rem;font-weight:700;color:#f7f7ff;margin:28px 0 10px}
  .docs-content p{font-size:.88rem;color:#94a3b8;line-height:1.75;margin-bottom:16px}
  .docs-content strong{color:#e2e8f0}
  .docs-content code{background:rgba(139,77,255,.1);color:#c4a0ff;padding:2px 7px;border-radius:4px;font-size:.8rem;font-weight:500;font-family:'JetBrains Mono',monospace}
  .docs-content pre{background:#060b14;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:0;overflow-x:auto;margin-bottom:24px;position:relative}
  .docs-content pre::before{content:'TS';position:absolute;top:0;right:16px;font-size:.62rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.08em;padding:8px 0}
  .docs-content pre code{display:block;background:none;color:#cbd5e1;padding:20px 24px;font-size:.76rem;line-height:1.85;border-radius:0;overflow-x:auto;white-space:pre;tab-size:2}
  .docs-content ul,.docs-content ol{padding-left:24px;margin-bottom:16px}
  .docs-content li{font-size:.88rem;color:#94a3b8;line-height:1.75;margin-bottom:6px}
  .docs-content table{width:100%;border-collapse:collapse;margin-bottom:24px;font-size:.82rem}
  @media(max-width:960px){.docs-content table{display:block;overflow-x:auto;max-width:100%}}
  .docs-content th{text-align:left;padding:10px 14px;background:rgba(255,255,255,.03);color:#e2e8f0;font-weight:700;border-bottom:2px solid rgba(255,255,255,.06)}
  .docs-content td{padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.04);color:#94a3b8}
  .docs-content .note{padding:14px 18px;background:rgba(139,77,255,.06);border-left:3px solid rgba(139,77,255,.3);border-radius:0 8px 8px 0;margin-bottom:20px;font-size:.84rem;color:#c4a0ff}
  .docs-content .ok{color:#34d399;font-weight:700}
  .docs-content .no{color:#f87171;font-weight:700}
`;

export const DocsIntegrations = component(() => (
  <div class="docs-layout">
    <style>{s}</style>
    <DocSidebar />
    <main class="docs-main">
      <div class="docs-content">
        <h1>{i18n.t('sb.integrations')}</h1>
        <p>{i18n.t('ig.h.a')}<strong>{i18n.t('ig.h.b')}</strong>{i18n.t('ig.h.c')}<strong>{i18n.t('ig.h.d')}</strong>{i18n.t('ig.h.e')}</p>

        <h2 id="tailwind">Tailwind CSS</h2>
        <p>{i18n.t('ig.tail.a')}<code>class</code>{i18n.t('ig.tail.b')}</p>

        <h3>{i18n.t('ig.tw4.title')}</h3>
        <p>{i18n.t('ig.tw4.p')}</p>
        <CodeBlock code={`// vite.config.ts
import { defineConfig } from 'vite';
import astra from 'astrajs.dev/compiler';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    astra(),          // JSX → DOM compiler
    tailwindcss(),    // Tailwind v4
  ],
});`} commentsKey="integrations.tailwind-vite" />
        <CodeBlock code={`/* src/main.css */
@import "tailwindcss";

/* in your entry: */
import './main.css';`} commentsKey="integrations.tailwind-css" />

        <h3>{i18n.t('ig.tw3.title')}</h3>
        <CodeBlock code={`// tailwind.config.js — also scans your .tsx
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
};

// postcss.config.js
export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};`} commentsKey="integrations.tailwind-config" />

        <h3>{i18n.t('ig.use.title')}</h3>
        <CodeBlock code={`export const Card = component(() => (
  <div class="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10">
    <h2 class="text-xl font-bold text-white">Title</h2>
    <p class="text-sm text-slate-400 leading-relaxed">Description</p>
  </div>
));`} />

        <h3>{i18n.t('ig.dyn.title')}</h3>
        <p>{i18n.t('ig.dyn.a')}<code>class</code>{i18n.t('ig.dyn.b')}</p>
        <CodeBlock code={`import { component, store, classes } from 'astrajs.dev/core';

const state = store({ active: false });

export const Button = component(() => (
  <button
    class={classes(
      'px-4 py-2 rounded-lg transition-colors',
      state.active ? 'bg-pink-600 text-white' : 'bg-slate-700 text-slate-200'
    )}
    onclick={() => { state.active = !state.active; }}
  >
    {state.active ? 'Active' : 'Inactive'}
  </button>
));`} />

        <div class="note">
          <strong>{i18n.t('lbl.tip')}:</strong> {i18n.t('ig.note.a')}<code>css</code>{i18n.t('ig.note.b')}<code>.card {'{@apply p-6 rounded-2xl;}'}</code>{i18n.t('ig.note.c')}
        </div>

        <h2 id="mui">Material UI (MUI)</h2>
        <p>{i18n.t('ig.mui.a')}<strong>{i18n.t('ig.mui.b')}</strong>{i18n.t('ig.mui.c')}<code>@mui/material</code>{i18n.t('ig.mui.d')}<code>&lt;Button&gt;</code>{i18n.t('ig.mui.e')}<strong>{i18n.t('ig.mui.f')}</strong>.</p>
        <p>{i18n.t('ig.mui.p2')}</p>

        <h3>{i18n.t('ig.mw.title')}</h3>
        <p><strong>Material Web</strong> {i18n.t('ig.mw.a')}<code>@material/web</code>{i18n.t('ig.mw.b')}<strong>{i18n.t('ig.mw.c')}</strong>{i18n.t('ig.mw.d')}</p>
        <CodeBlock code={`// npm install @material/web
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/textfield/filled-text-field.js';

export const Form = component(() => (
  <div class="flex flex-col gap-4 p-8">
    <md-filled-text-field label="Email" type="email" />
    <md-filled-text-field label="Password" type="password" />
    <div class="flex gap-3">
      <md-filled-button onclick={() => console.log('Save')}>Save</md-filled-button>
      <md-outlined-button>Cancel</md-outlined-button>
    </div>
  </div>
));`} commentsKey="integrations.material-web" />

        <h3>{i18n.t('ig.wc.title')}</h3>
        <p>{i18n.t('ig.wc.a')}<strong>Shoelace</strong>{i18n.t('ig.wc.b')}<strong>Carbon Web Components</strong>{i18n.t('ig.wc.c')}<strong>Spectrum</strong>{i18n.t('ig.wc.d')}<strong>Fluent</strong>{i18n.t('ig.wc.e')}</p>
        <CodeBlock code={`// Shoelace
import '@shoelace-style/shoelace/dist/components/button/button.js';

<sl-button variant="primary" onclick={save}>Save</sl-button>`} commentsKey="integrations.shoelace" />

        <div class="note">
          <strong>{i18n.t('lbl.note')}:</strong> {i18n.t('ig.wcn.a')}<code>mounted()</code>{i18n.t('ig.wcn.b')}
        </div>

        <h2 id="graficos">{i18n.t('ig.charts.title')}</h2>
        <p>{i18n.t('ig.ch.a')}<code>canvas</code>{i18n.t('ig.ch.b')}<code>SVG</code>{i18n.t('ig.ch.c')}<code>mounted()</code>{i18n.t('ig.ch.d')}</p>
        <CodeBlock code={`import Chart from 'chart.js/auto';

export const SalesChart = component(() => {
  mounted(() => {
    const canvas = document.querySelector('#sales-chart') as HTMLCanvasElement;
    const chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr'],
        datasets: [{ label: 'Sales', data: [12, 19, 8, 24] }],
      },
    });

    // automatic cleanup when the component unmounts
    return () => chart.destroy();
  });

  return <canvas id="sales-chart" />;
});`} commentsKey="integrations.charts" />

        <h2 id="utilidades">{i18n.t('sb.intUtils')}</h2>
        <p>{i18n.t('ig.utils.p')}</p>
        <CodeBlock code={`import { formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';

<span>{formatDistance(new Date(), post.date, { addSuffix: true, locale: es })}</span>`} />

        <h2 id="animaciones">{i18n.t('sb.intAnim')}</h2>
        <p>{i18n.t('ig.anim.p')}</p>
        <CodeBlock code={`import { animate } from 'motion';

mounted(() => {
  const el = document.querySelector('.card');
  animate(el, { opacity: [0, 1], y: [24, 0] }, { duration: 0.4 });
});`} />

        <h2 id="tabla">{i18n.t('sb.intTable')}</h2>
        <table>
          <tr><th>{i18n.t('ig.th1')}</th><th>{i18n.t('ig.th2')}</th><th>{i18n.t('ig.th3')}</th><th>{i18n.t('ig.th4')}</th></tr>
          <tr><td><strong>Tailwind CSS</strong></td><td>{i18n.t('ig.cell.css')}</td><td class="ok"><Icon name="check" size={12} /> {i18n.t('ig.ok')}</td><td>{i18n.t('ig.n0.a')}<code>classes()</code></td></tr>
          <tr><td><strong>Bootstrap / Bulma / UnoCSS</strong></td><td>{i18n.t('ig.cell.fw')}</td><td class="ok"><Icon name="check" size={12} /> {i18n.t('ig.ok')}</td><td>{i18n.t('ig.n1')}</td></tr>
          <tr><td><strong>MUI (@mui/material)</strong></td><td>{i18n.t('ig.cell.react')}</td><td class="no"><Icon name="x" size={12} /> {i18n.t('ig.no')}</td><td>{i18n.t('ig.n2')}</td></tr>
          <tr><td><strong>Material Web / Shoelace / Carbon / Fluent</strong></td><td>{i18n.t('ig.cell.wc')}</td><td class="ok"><Icon name="check" size={12} /> {i18n.t('ig.ok')}</td><td>{i18n.t('ig.n3')}</td></tr>
          <tr><td><strong>Chart.js / ECharts / D3</strong></td><td>{i18n.t('ig.cell.canvas')}</td><td class="ok"><Icon name="check" size={12} /> {i18n.t('ig.ok')}</td><td>{i18n.t('ig.n4.a')}<code>mounted()</code>{i18n.t('ig.n4.b')}</td></tr>
          <tr><td><strong>date-fns / dayjs / zod</strong></td><td>{i18n.t('ig.cell.pure')}</td><td class="ok"><Icon name="check" size={12} /> {i18n.t('ig.ok')}</td><td>{i18n.t('ig.n5')}</td></tr>
          <tr><td><strong>Motion One / anime.js</strong></td><td>{i18n.t('ig.cell.anim')}</td><td class="ok"><Icon name="check" size={12} /> {i18n.t('ig.ok')}</td><td>{i18n.t('ig.n6')}</td></tr>
          <tr><td><strong>i18next / formatjs</strong></td><td>{i18n.t('ig.cell.i18n')}</td><td class="ok"><Icon name="layers" size={12} /> {i18n.t('ig.bridge')}</td><td>{i18n.t('ig.n7.a')}<code>astrajs.dev/i18n</code></td></tr>
        </table>

        <h2 id="regla">{i18n.t('ig.rule.title')}</h2>
        <ul>
          <li><strong>{i18n.t('ig.r1.a')}</strong>{i18n.t('ig.r1.b')}</li>
          <li><strong>{i18n.t('ig.r2.a')}</strong>{i18n.t('ig.r2.b')}</li>
          <li><strong>{i18n.t('ig.r3.a')}</strong>{i18n.t('ig.r3.b')}<code>mounted()</code>{i18n.t('ig.r3.c')}<code>return cleanup</code>{i18n.t('ig.r3.d')}</li>
        </ul>
      </div>
    </main>
    <DocRightToc items={[
      { href: '/docs/integrations#tailwind', label: 'Tailwind CSS' },
      { href: '/docs/integrations#mui', label: 'Material UI (MUI)' },
      { href: '/docs/integrations#graficos', k: 'ig.charts.title' },
      { href: '/docs/integrations#utilidades', k: 'sb.intUtils' },
      { href: '/docs/integrations#animaciones', k: 'sb.intAnim' },
      { href: '/docs/integrations#tabla', k: 'sb.intTable' },
    ]} />
  </div>
));
