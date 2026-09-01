import { component, dynamic } from 'astrajs.dev/core';
import { navigate } from 'astrajs.dev/router';
import { DocSidebar } from '../../components/docs-sidebar.js';
import { Icon } from '../../components/icon.js';
import { i18n } from '../../i18n.js';
import { CodeBlock } from '../../components/code-block.js';

const docLayoutStyle = `
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
  .docs-hero-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(139,77,255,.1);border:1px solid rgba(139,77,255,.2);border-radius:20px;padding:4px 14px;font-size:.72rem;font-weight:600;color:#b84cff;margin-bottom:20px}
  .docs-hero-text{font-size:.92rem;color:#94a3b8;max-width:600px;line-height:1.7;margin-bottom:28px}
  .docs-buttons{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:40px}
  .docs-btn-primary{display:inline-flex;align-items:center;gap:6px;font-size:.82rem;font-weight:600;color:#fff;background:linear-gradient(135deg,#8d4dff,#4d7cff);padding:10px 24px;border-radius:8px;transition:opacity .15s,transform .15s;cursor:pointer;border:none;text-decoration:none}
  .docs-btn-primary:hover{opacity:.9;transform:translateY(-1px)}
  .docs-btn-ghost{display:inline-flex;align-items:center;gap:6px;font-size:.82rem;font-weight:600;color:#e2e8f0;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);padding:10px 24px;border-radius:8px;transition:background .15s;text-decoration:none}
  .docs-btn-ghost:hover{background:rgba(255,255,255,.1)}
  .feature-pills{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:40px}
  .feature-pill{background:rgba(139,77,255,.06);border:1px solid rgba(139,77,255,.12);border-radius:8px;padding:16px 20px;min-width:0;text-align:center}
  .feature-pill-icon{margin-bottom:6px;display:flex;justify-content:center}
  @media(max-width:600px){.feature-pills{grid-template-columns:1fr}}
  .feature-pill-label{font-size:.72rem;font-weight:700;color:#f7f7ff}
  .feature-pill-desc{font-size:.66rem;color:#94a3b8;margin-top:2px}
  .code-demo{background:#060b14;border:1px solid rgba(255,255,255,.07);border-radius:12px;overflow:hidden;margin-bottom:28px}
  .code-demo-header{padding:10px 20px;display:flex;gap:20px;border-bottom:1px solid rgba(255,255,255,.06);font-size:.72rem;font-weight:600;background:rgba(255,255,255,.015)}
  .code-demo-tab{color:#475569;cursor:pointer;padding:8px 0 10px;border-bottom:2px solid transparent}
  .code-demo-tab.active{color:#b84cff;border-bottom-color:#b84cff}
  .code-demo-body{padding:24px}
  .code-demo-body pre{font-size:.76rem;line-height:1.85;color:#cbd5e1;font-family:'JetBrains Mono',monospace;white-space:pre;margin:0;background:none;border:none;padding:0}
  .code-demo-result{padding:16px 24px;border-top:1px solid rgba(255,255,255,.06);display:flex;align-items:center;gap:16px;flex-wrap:wrap;background:rgba(255,255,255,.01);font-size:.72rem;color:#94a3b8}
  .steps-list{counter-reset:step;margin-top:24px}
  .steps-list-item{display:flex;gap:16px;align-items:flex-start;margin-bottom:24px}
  .steps-list-num{width:36px;height:36px;border-radius:50%;background:rgba(139,77,255,.1);border:1px solid rgba(139,77,255,.2);display:flex;align-items:center;justify-content:center;font-size:.82rem;font-weight:800;color:#b84cff;flex-shrink:0}
  .steps-list-text h4{font-size:.88rem;font-weight:700;color:#f7f7ff;margin-bottom:4px}
  .steps-list-text p{font-size:.8rem;color:#94a3b8;line-height:1.6;margin:0}
  .promo-card{background:linear-gradient(135deg,rgba(139,77,255,.08),rgba(0,223,255,.04));border:1px solid rgba(139,77,255,.15);border-radius:12px;padding:24px;margin-top:32px}
  .promo-card h4{font-size:.9rem;font-weight:700;color:#f7f7ff;margin-bottom:8px}
  .promo-card p{font-size:.8rem;color:#94a3b8;margin-bottom:12px;line-height:1.6}
  .promo-card a{font-size:.78rem;font-weight:600;color:#b84cff}
  .docs-right{position:fixed;top:64px;right:0;width:280px;padding:48px 36px;display:none}
  @media(min-width:1280px){.docs-right{display:block}}
  .toc-label{font-size:.64rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.1em;margin-bottom:12px}
  .toc-item{display:block;font-size:.76rem;color:#94a3b8;padding:5px 0 5px 12px;font-weight:500;transition:color .12s;border-left:2px solid transparent;text-decoration:none}
  .toc-item:hover{color:#e2e8f0}
  .toc-item.active{color:#b84cff;border-left-color:#b84cff}
`;

const demoCode = `import { store } from 'astrajs.dev/core';

const state = store({ count: 0 });

export default function Counter() {
    return (
        <button astra-on:click={() => state.count++}>
            Count: {state.count}
        </button>
    );
}`;

export const DocsIntroduction = component(() => (
  <div class="docs-layout">
    <style>{docLayoutStyle}</style>
    <DocSidebar />
    <main class="docs-main">
      <div class="docs-content">
        <div class="docs-hero-badge">v0.1.8</div>
        <h1 id="que-es-astrajs">{i18n.t('d.welcome')}</h1>
        <p class="docs-hero-text">
          {i18n.t('d.hero')}
        </p>
        <div class="docs-buttons">
          <a class="docs-btn-primary" href="/docs/introduction#instalacion">{i18n.t('d.installNow')} →</a>
          <a class="docs-btn-ghost" href="https://github.com/bpjs159/astrajs" target="_blank" rel="noopener">{i18n.t('d.github')}</a>
        </div>
        <div class="feature-pills">
          <div class="feature-pill"><div class="feature-pill-icon"><Icon name="bolt" size={24} /></div><div class="feature-pill-label">Zero-VDOM</div><div class="feature-pill-desc">{i18n.t('d2.pill1.desc')}</div></div>
          <div class="feature-pill"><div class="feature-pill-icon"><Icon name="wrench" size={24} /></div><div class="feature-pill-label">Zero Config</div><div class="feature-pill-desc">{i18n.t('d2.pill2.desc')}</div></div>
          <div class="feature-pill"><div class="feature-pill-icon"><Icon name="layers" size={24} /></div><div class="feature-pill-label">Full-Stack</div><div class="feature-pill-desc">{i18n.t('d2.pill3.desc')}</div></div>
          <div class="feature-pill"><div class="feature-pill-icon"><Icon name="code" size={24} /></div><div class="feature-pill-label">100% TypeScript</div><div class="feature-pill-desc">{i18n.t('d2.pill4.desc')}</div></div>
        </div>
        <h2 id="primer-componente">{i18n.t('d.first.title')}</h2>
        <p>{i18n.t('d2.first.a')}<strong>{i18n.t('d2.first.b')}</strong>{i18n.t('d2.first.c')}</p>
        <div class="code-demo">
          <div class="code-demo-header"><span class="code-demo-tab active">Counter.tsx</span></div>
          <div class="code-demo-body"><CodeBlock code={demoCode} bare /></div>
          <div class="code-demo-result"><Icon name="bolt" size={13} /> {i18n.t('d2.cr1')}<code>TextNode</code>{i18n.t('d2.cr2')}<code>state.count</code>{i18n.t('d2.cr3')}<strong>{i18n.t('d2.cr4')}</strong>{i18n.t('d2.cr5')}</div>
        </div>
        <h2 id="como-funciona">{i18n.t('d.how.title')}</h2>
        <p>{i18n.t('d2.how.p1')}<code>server()</code>{i18n.t('d2.how.p2')}</p>
        <div class="steps-list">
          <div class="steps-list-item"><div class="steps-list-num">1</div><div class="steps-list-text"><h4>{i18n.t('d.how.1.title')}</h4><p>{i18n.t('d2.step1.a')}<code>store()</code>, <code>server()</code>{i18n.t('d2.step1.b')}</p></div></div>
          <div class="steps-list-item"><div class="steps-list-num">2</div><div class="steps-list-text"><h4>{i18n.t('d.how.2.title')}</h4><p>{i18n.t('d2.step2.a')}<code>document.createElement</code>{i18n.t('d2.step2.b')}</p></div></div>
          <div class="steps-list-item"><div class="steps-list-num">3</div><div class="steps-list-text"><h4>{i18n.t('d.how.3.title')}</h4><p>{i18n.t('d2.step3.a')}<code>server()</code>{i18n.t('d2.step3.b')}</p></div></div>
          <div class="steps-list-item"><div class="steps-list-num">4</div><div class="steps-list-text"><h4>{i18n.t('d.how.4.title')}</h4><p>{i18n.t('d2.step4.a')}<strong>{i18n.t('d2.step4.b')}</strong>{i18n.t('d2.step4.c')}</p></div></div>
          <div class="steps-list-item"><div class="steps-list-num">5</div><div class="steps-list-text"><h4>{i18n.t('d.how.5.title')}</h4><p>{i18n.t('d2.step5.a')}<strong>{i18n.t('d2.step5.b')}</strong>{i18n.t('d2.step5.c')}</p></div></div>
        </div>
        <h2>{i18n.t('d.why.title')}</h2>
        <p>{i18n.t('d2.why.p')}</p>
        <ol>
          <li><strong>{i18n.t('d2.ol1.name')}</strong> — {i18n.t('d2.ol1.text')}</li>
          <li><strong>{i18n.t('d2.ol2.name')}</strong> — {i18n.t('d2.ol2.text')}</li>
          <li><strong>{i18n.t('d2.ol3.name')}</strong> — {i18n.t('d2.ol3.text')}</li>
        </ol>
        <p>{i18n.t('d2.why.a')}<strong>{i18n.t('d2.why.b')}</strong>{i18n.t('d2.why.c')}</p>
        <p>{i18n.t('d.why.2a')}<strong>O(1)</strong>{i18n.t('d2.why2b')}</p>
        <h2>{i18n.t('d2.arch.title')}</h2>
        <p>{i18n.t('d2.arch.p')}</p>
        <ul>
          <li><strong>astrajs.dev/core</strong> (~3KB) — {i18n.t('d2.pkg.core')}</li>
          <li><strong>astrajs.dev/compiler</strong> — {i18n.t('d2.pkg.compiler')}</li>
          <li><strong>astrajs.dev/server</strong> — {i18n.t('d2.pkg.server')}</li>
          <li><strong>astrajs.dev/router</strong> — {i18n.t('d2.pkg.router')}</li>
          <li><strong>astrajs.dev/ssr</strong> — {i18n.t('d2.pkg.ssr')}</li>
          <li><strong>astrajs.dev/form</strong> — {i18n.t('d2.pkg.form')}</li>
        </ul>
        <h2 id="instalacion">{i18n.t('sb.install')}</h2>
        <p>{i18n.t('d2.install1')}</p>
        <CodeBlock code={`npx astrajs.dev@latest my-app`} />
        <p>{i18n.t('d2.install2')}</p>
        <CodeBlock code={`pnpm add astrajs.dev

// vite.config.ts
import astra from 'astrajs.dev/compiler';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [astra()],
});`} commentsKey="introduction.vite" />
        <p>{i18n.t('d2.tsconfig')}</p>
        <CodeBlock code={`{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "astrajs.dev/core"
  }
}`} />
        <h2 id="primeros-pasos">{i18n.t('sb.gettingStarted')}</h2>
        <p>{i18n.t('d2.getting')}</p>
        <CodeBlock code={`import { component, store } from 'astrajs.dev/core';

export const Hello = component(() => {
  const name = store({ value: 'AstraJS' });
  
  return (
    <div>
      <h1>Hello, {name.value}!</h1>
      <input 
        value={name.value}
        onInput={(e) => { name.value = e.target.value; }}
      />
    </div>
  );
});`} />
        <p>{i18n.t('d2.each')}</p>
        <ul>
          <li><code>name.value</code>{i18n.t('d2.each1')}</li>
          <li>{i18n.t('d2.each2.a')}<code>TextNode</code>{i18n.t('d2.each2.b')}<code>&lt;h1&gt;</code>{i18n.t('d2.each2.c')}</li>
          <li>{i18n.t('d2.each3.a')}<strong>{i18n.t('d2.each3.b')}</strong>{i18n.t('d2.each3.c')}</li>
          <li>{i18n.t('d2.each4.a')}<strong>{i18n.t('d2.each4.b')}</strong>{i18n.t('d2.each4.c')}</li>
        </ul>
        <h2 id="conceptos-clave">{i18n.t('d.concepts.title')}</h2>
        <ul>
          <li><strong>store()</strong> — {i18n.t('d2.c1')}</li>
          <li><strong>component()</strong> — {i18n.t('d2.c2.a')}<strong>{i18n.t('d2.c2.b')}</strong>{i18n.t('d2.c2.c')}</li>
          <li><strong>server()</strong> — {i18n.t('d2.c3')}</li>
          <li><strong>route()</strong> — {i18n.t('d2.c4')}</li>
          <li><strong>css``</strong> — {i18n.t('d2.c5')}</li>
        </ul>
        <div class="promo-card">
          <h4>{i18n.t('d.promo1.title')}</h4>
          <p>{i18n.t('d2.promo1.text')}</p>
          <a href="/docs/advanced" onClick={(e: Event) => { e.preventDefault(); navigate('/docs/advanced'); }}>{i18n.t('d.promo1.link')} →</a>
        </div>
        <div class="promo-card" style="margin-top:16px;background:linear-gradient(135deg,rgba(0,223,255,.06),rgba(139,77,255,.04));border-color:rgba(0,223,255,.15)">
          <h4><Icon name="play" size={15} /> {i18n.t('d2.promo2.title')}</h4>
          <p>{i18n.t('d2.promo2.text')}</p>
          <a href="/docs/fundamentals" onClick={(e: Event) => { e.preventDefault(); navigate('/docs/fundamentals'); }}>{i18n.t('d2.promo2.link')} →</a>
        </div>
      </div>
    </main>
    <aside class="docs-right">
      <div class="toc-label">{i18n.t('d.toc')}</div>
      <a href="/docs/introduction#primer-componente" class="toc-item">{i18n.t('d.first.title')}</a>
      <a href="/docs/introduction#como-funciona" class="toc-item">{i18n.t('d.how.title')}</a>
      <a href="/docs/introduction#instalacion" class="toc-item">{i18n.t('sb.install')}</a>
      <a href="/docs/introduction#primeros-pasos" class="toc-item">{i18n.t('sb.gettingStarted')}</a>
      <a href="/docs/introduction#conceptos-clave" class="toc-item">{i18n.t('d.concepts.title')}</a>
    </aside>
  </div>
));
