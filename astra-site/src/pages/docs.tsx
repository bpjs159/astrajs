import { component, dynamic } from '@bpjs159/core';
import { Link } from '@bpjs159/router';
import { DocSidebar } from '../components/docs-sidebar.js';
import { Icon } from '../components/icon.js';
import { i18n } from '../i18n.js';
import { CodeBlock } from '../components/code-block.js';

export const DocsPage = component(() => {
  /** Divide claves con <br/> en líneas para renderizarlas con salto real. */
  const br = (key: string) => i18n.t(key).split('<br/>');
  const style = `
    .docs-layout{display:flex;min-height:100vh}
    .docs-main{flex:1;min-width:0;margin-left:260px;padding:48px 56px;max-width:900px}
    .docs-right{position:fixed;top:64px;right:0;width:280px;padding:48px 36px;display:none}
    @media(min-width:1280px){.docs-right{display:block}}
    @media(max-width:960px){.docs-main{margin-left:0;padding:32px 24px}}

    /* === DOCS CONTENT STYLES === */
    .docs-content h1{font-size:2rem;font-weight:800;color:#f7f7ff;margin-bottom:12px;letter-spacing:-.02em}
    .docs-content h2{font-size:1.3rem;font-weight:700;color:#f7f7ff;margin:48px 0 16px;padding-top:24px;border-top:1px solid rgba(255,255,255,.06);letter-spacing:-.01em}
    .docs-content h2:first-of-type{border-top:none;margin-top:32px}
    .docs-content h3{font-size:1.05rem;font-weight:700;color:#f7f7ff;margin:32px 0 12px}
    .docs-content p{font-size:.88rem;color:#94a3b8;line-height:1.75;margin-bottom:16px}
    .docs-content strong{color:#e2e8f0}
    .docs-content a{color:#b84cff;font-weight:500}
    .docs-content a:hover{color:#d09fff}
    .docs-content ul,.docs-content ol{padding-left:24px;margin-bottom:16px}
    .docs-content li{font-size:.88rem;color:#94a3b8;line-height:1.75;margin-bottom:4px}
    .docs-content code{background:rgba(139,77,255,.1);color:#c4a0ff;padding:2px 7px;border-radius:4px;font-size:.8rem;font-weight:500;font-family:'JetBrains Mono',monospace}
    .docs-content pre{background:#060b14;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:0;overflow-x:auto;margin-bottom:24px;position:relative}
    .docs-content pre::before{content:'TS';position:absolute;top:0;right:16px;font-size:.62rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.08em;padding:8px 0}
    .docs-content pre code{display:block;background:none;color:#cbd5e1;padding:20px 24px;font-size:.76rem;line-height:1.85;border-radius:0;overflow-x:auto;white-space:pre;tab-size:2}
    .docs-content pre code .kw{color:#b84cff}
    .docs-content pre code .str{color:#00dfff}
    .docs-content pre code .fn{color:#4d7cff}
    .docs-content pre code .cmt{color:#475569}
    .docs-content pre code .num{color:#f59e0b}
    .docs-content pre code .op{color:#94a3b8}

    .docs-hero-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(139,77,255,.1);border:1px solid rgba(139,77,255,.2);border-radius:20px;padding:4px 14px;font-size:.72rem;font-weight:600;color:#b84cff;margin-bottom:20px}
    .docs-hero-text{font-size:.92rem;color:#64748b;max-width:600px;line-height:1.7;margin-bottom:28px}

    .docs-buttons{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:40px}
    .docs-btn-primary{display:inline-flex;align-items:center;gap:6px;font-size:.82rem;font-weight:600;color:#fff;background:linear-gradient(135deg,#8d4dff,#4d7cff);padding:10px 24px;border-radius:8px;transition:opacity .15s,transform .15s;cursor:pointer;border:none}
    .docs-btn-primary:hover{opacity:.9;transform:translateY(-1px)}
    .docs-btn-ghost{display:inline-flex;align-items:center;gap:6px;font-size:.82rem;font-weight:600;color:#e2e8f0;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);padding:10px 24px;border-radius:8px;transition:background .15s}
    .docs-btn-ghost:hover{background:rgba(255,255,255,.1)}

    .feature-pills{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:40px}
    .feature-pill{background:rgba(139,77,255,.06);border:1px solid rgba(139,77,255,.12);border-radius:8px;padding:16px 20px;min-width:0;text-align:center}
    .feature-pill-icon{margin-bottom:6px;display:flex;justify-content:center}
    @media(max-width:600px){.feature-pills{grid-template-columns:1fr}}
    .feature-pill-label{font-size:.72rem;font-weight:700;color:#f7f7ff}
    .feature-pill-desc{font-size:.66rem;color:#64748b;margin-top:2px}

    .code-demo{background:#060b14;border:1px solid rgba(255,255,255,.07);border-radius:12px;overflow:hidden;margin-bottom:28px}
    .code-demo-header{padding:10px 20px;display:flex;gap:20px;border-bottom:1px solid rgba(255,255,255,.06);font-size:.72rem;font-weight:600;background:rgba(255,255,255,.015)}
    .code-demo-tab{color:#475569;cursor:pointer;padding:8px 0 10px;border-bottom:2px solid transparent;transition:color .15s,border-color .15s}
    .code-demo-tab.active{color:#b84cff;border-bottom-color:#b84cff}
    .code-demo-body{padding:24px}
    .code-demo-body pre{font-size:.76rem;line-height:1.85;color:#cbd5e1;font-family:'JetBrains Mono',monospace;white-space:pre;margin:0;background:none;border:none;border-radius:0;padding:0}
    .code-demo-result{padding:16px 24px;border-top:1px solid rgba(255,255,255,.06);display:flex;align-items:center;gap:16px;flex-wrap:wrap;background:rgba(255,255,255,.01)}
    .code-demo-result-label{font-size:.68rem;color:#475569;font-weight:600;text-transform:uppercase;letter-spacing:.04em}
    .code-demo-counter{font-size:1.3rem;font-weight:800;color:#f7f7ff}
    .code-demo-note{font-size:.72rem;color:#64748b;margin-left:auto}

    .steps-list{counter-reset:step;margin-top:24px}
    .steps-list-item{display:flex;gap:16px;align-items:flex-start;margin-bottom:24px}
    .steps-list-num{width:36px;height:36px;border-radius:50%;background:rgba(139,77,255,.1);border:1px solid rgba(139,77,255,.2);display:flex;align-items:center;justify-content:center;font-size:.82rem;font-weight:800;color:#b84cff;flex-shrink:0}
    .steps-list-text h4{font-size:.88rem;font-weight:700;color:#f7f7ff;margin-bottom:4px}
    .steps-list-text p{font-size:.8rem;color:#64748b;line-height:1.6;margin:0}

    .promo-card{background:linear-gradient(135deg,rgba(139,77,255,.08),rgba(0,223,255,.04));border:1px solid rgba(139,77,255,.15);border-radius:12px;padding:24px;margin-top:32px}
    .promo-card h4{font-size:.9rem;font-weight:700;color:#f7f7ff;margin-bottom:8px}
    .promo-card p{font-size:.8rem;color:#94a3b8;margin-bottom:12px;line-height:1.6}
    .promo-card a{font-size:.78rem;font-weight:600;color:#b84cff}

    /* === RIGHT SIDEBAR === */
    .toc-label{font-size:.64rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.1em;margin-bottom:12px}
    .toc-item{display:block;font-size:.76rem;color:#64748b;padding:5px 0;font-weight:500;transition:color .12s;border-left:2px solid transparent;padding-left:12px}
    .toc-item:hover{color:#e2e8f0}
    .toc-item.active{color:#b84cff;border-left-color:#b84cff}
  `;

  const demoCode = `import { store } from '@bpjs159/core';

const state = store({ count: 0 });

export default function Counter() {
    return (
        <button astra-on:click={() => state.count++}>
            Count: {state.count}
        </button>
    );
}`;

  return (
    <div class="docs-layout">
      <style>{style}</style>

      <DocSidebar />

      {/* ── MAIN CONTENT ── */}
      <main class="docs-main">
        <div class="docs-content">
          <div class="docs-hero-badge">v1.0.0</div>
          <h1>{i18n.t('d.welcome')}</h1>
          <p class="docs-hero-text">
            {i18n.t('d.hero')}
          </p>

          <div class="docs-buttons">
            <a class="docs-btn-primary" href="/docs#primeros-pasos">
              {i18n.t('d.start')} →
            </a>
            <a class="docs-btn-ghost" href="https://github.com" target="_blank" rel="noopener">
              {i18n.t('d.github')}
            </a>
          </div>

          <div class="feature-pills">
            <div class="feature-pill">
              <div class="feature-pill-icon"><Icon name="bolt" size={24} /></div>
              <div class="feature-pill-label">Zero-VDOM</div>
              <div class="feature-pill-desc">{br('d.pill1.desc')[0]}<br/>{br('d.pill1.desc')[1]}</div>
            </div>
            <div class="feature-pill">
              <div class="feature-pill-icon"><Icon name="wrench" size={24} /></div>
              <div class="feature-pill-label">Zero Config</div>
              <div class="feature-pill-desc">{br('d.pill2.desc')[0]}<br/>{br('d.pill2.desc')[1]}</div>
            </div>
            <div class="feature-pill">
              <div class="feature-pill-icon"><Icon name="layers" size={24} /></div>
              <div class="feature-pill-label">Full-Stack</div>
              <div class="feature-pill-desc">{br('d.pill3.desc')[0]}<br/>{br('d.pill3.desc')[1]}</div>
            </div>
            <div class="feature-pill">
              <div class="feature-pill-icon"><Icon name="code" size={24} /></div>
              <div class="feature-pill-label">100% TypeScript</div>
              <div class="feature-pill-desc">{br('d.pill4.desc')[0]}<br/>{br('d.pill4.desc')[1]}</div>
            </div>
          </div>

          {/* ── Primer componente ── */}
          <h2 id="tu-primer-componente">{i18n.t('d.first.title')}</h2>
          <p>{i18n.t('d.first.text')} <strong>AstraJS</strong></p>

          <div class="code-demo">
            <div class="code-demo-header">
              <span class="code-demo-tab active">Counter.tsx</span>
              <span class="code-demo-tab">TSX</span>
              <span class="code-demo-tab">JS</span>
              <span class="code-demo-tab">HTML</span>
            </div>
            <div class="code-demo-body">
              <CodeBlock code={demoCode} bare />
            </div>
            <div class="code-demo-result">
              <span class="code-demo-result-label">{i18n.t('d.first.result')}</span>
              <span class="code-demo-counter">Count: 0</span>
              <span class="code-demo-note">{i18n.t('d.first.note')}</span>
            </div>
          </div>

          {/* ── Cómo funciona ── */}
          <h2 id="como-funciona">{i18n.t('d.how.title')}</h2>
          <p>{i18n.t('d.how.sub')}</p>

          <div class="steps-list">
            <div class="steps-list-item">
              <div class="steps-list-num">1</div>
              <div class="steps-list-text">
                <h4>{i18n.t('d.how.1.title')}</h4>
                <p>{i18n.t('d.how.1.text')}</p>
              </div>
            </div>
            <div class="steps-list-item">
              <div class="steps-list-num">2</div>
              <div class="steps-list-text">
                <h4>{i18n.t('d.how.2.title')}</h4>
                <p>{i18n.t('d.how.2.text')}</p>
              </div>
            </div>
            <div class="steps-list-item">
              <div class="steps-list-num">3</div>
              <div class="steps-list-text">
                <h4>{i18n.t('d.how.3.title')}</h4>
                <p>{i18n.t('d.how.3.text')}</p>
              </div>
            </div>
            <div class="steps-list-item">
              <div class="steps-list-num">4</div>
              <div class="steps-list-text">
                <h4>{i18n.t('d.how.4.title')}</h4>
                <p>{i18n.t('d.how.4.text')}</p>
              </div>
            </div>
            <div class="steps-list-item">
              <div class="steps-list-num">5</div>
              <div class="steps-list-text">
                <h4>{i18n.t('d.how.5.title')}</h4>
                <p>{i18n.t('d.how.5.text')}</p>
              </div>
            </div>
          </div>

          {/* ── ¿Por qué sin Virtual DOM? ── */}
          <h2 id="por-que-sin-virtual-dom">{i18n.t('d.why.title')}</h2>
          <p>
            {i18n.t('d.why.1a')}
            <strong>{i18n.t('d.why.1b')}</strong>
          </p>
          <p>
            {i18n.t('d.why.2a')}<strong>O(1)</strong>{i18n.t('d.why.2b')}
          </p>

          {/* ── Características principales ── */}
          <h2 id="caracteristicas-principales">{i18n.t('d.features.title')}</h2>
          <ul>
            <li><strong>{i18n.t('d.f1.name')}</strong> — {i18n.t('d.f1.text')}</li>
            <li><strong>{i18n.t('d.f2.name')}</strong> — {i18n.t('d.f2.text')}</li>
            <li><strong>{i18n.t('d.f3.name')}</strong> — {i18n.t('d.f3.text')}</li>
            <li><strong>{i18n.t('d.f4.name')}</strong> — {i18n.t('d.f4.text')}</li>
            <li><strong>{i18n.t('d.f5.name')}</strong> — {i18n.t('d.f5.text')}</li>
            <li><strong>{i18n.t('d.f6.name')}</strong> — {i18n.t('d.f6.text')}</li>
            <li><strong>{i18n.t('d.f7.name')}</strong> — {i18n.t('d.f7.text')}</li>
            <li><strong>{i18n.t('d.f8.name')}</strong> — {i18n.t('d.f8.text')}</li>
          </ul>

          {/* ── Promo card ── */}
          <div class="promo-card">
            <h4><Icon name="bolt" size={15} /> {i18n.t('d.promo1.title')}</h4>
            <p>{i18n.t('d.promo1.text')}</p>
            <a href="/docs#compilador">{i18n.t('d.promo1.link')} →</a>
          </div>

          <div class="promo-card" style="margin-top:16px;background:linear-gradient(135deg,rgba(0,223,255,.06),rgba(139,77,255,.04));border-color:rgba(0,223,255,.15)">
            <h4><Icon name="play" size={15} /> {i18n.t('d.promo2.title')}</h4>
            <p>{i18n.t('d.promo2.text')}</p>
            <a href="/docs#primeros-pasos">{i18n.t('d.promo2.link')} →</a>
          </div>

          {/* Placeholder sections for sidebar nav */}
          <h2 id="instalacion">{i18n.t('sb.install')}</h2>
          <p>{i18n.t('d.install1')}</p>
          <CodeBlock code={`npx @bpjs159/cli@latest`} />
          <p>{i18n.t('d.install2')}</p>
          <CodeBlock code={`pnpm add @bpjs159/core @bpjs159/compiler
// vite.config.ts
import astra from '@bpjs159/compiler';

export default {
  plugins: [astra()],
};`} />

          <h2 id="primeros-pasos">{i18n.t('sb.gettingStarted')}</h2>
          <p>{i18n.t('d.getting')}</p>
          <CodeBlock code={`import { component, store } from '@bpjs159/core';

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
          <p>
            {i18n.t('d.getting2a')}
            <strong>{i18n.t('d.getting2b')} <code>&lt;h1&gt;</code> {i18n.t('d.getting2c')}</strong>
            {i18n.t('d.getting2d')}
          </p>

          <h2 id="conceptos-clave">{i18n.t('d.concepts.title')}</h2>
          <ul>
            <li><strong>store()</strong> — {i18n.t('d.c1')}</li>
            <li><strong>component()</strong> — {i18n.t('d.c2')}</li>
            <li><strong>server()</strong> — {i18n.t('d.c3')}</li>
            <li><strong>route()</strong> — {i18n.t('d.c4')}</li>
            <li><strong>css``</strong> — {i18n.t('d.c5')}</li>
          </ul>

          <h2 id="componentes">{i18n.t('sb.components')}</h2>
          <p>{i18n.t('d.components.p')}</p>
          <CodeBlock code={`// Sin estado → función pura
function Greeting({ name }: { name: string }) {
  return <h2>Hello, {name}</h2>;
}

// Con estado → component()
export const Counter = component(() => {
  const state = store({ count: 0 });
  return (
    <button onclick={() => state.count++}>
      {state.count}
    </button>
  );
});`} />

          <h2 id="reactividad">{i18n.t('sb.reactivity')}</h2>
          <p>{i18n.t('d.reactivity.p')}</p>
          <CodeBlock code={`const user = store({
  name: 'Ada',
  profile: { bio: 'Dev' }
});

// Lectura → suscripción automática
// user.name → suscribe solo al TextNode de "name"
// user.profile.bio → suscribe solo al TextNode de "bio"

// Escritura → notificación quirúrgica
user.name = 'Grace';     
// → solo se actualiza el nodo de "name", nada más`} />

          <h2 id="jsx-sin-vdom">{i18n.t('sb.jsx')}</h2>
          <p>{i18n.t('d.jsx.p')}</p>
          <CodeBlock code={`// Escribes:
<span>Hello {name}</span>

// El compilador genera:
const span = document.createElement('span');
const text1 = document.createTextNode('Hello ');
const text2 = document.createTextNode('');
span.append(text1, text2);
effect(() => { text2.nodeValue = String(name); });`} />
          <p><strong>{i18n.t('d.jsx.note')}</strong></p>

          <h2 id="server">server</h2>
          <p>{i18n.t('d.server.p')}</p>
          <CodeBlock code={`import { server } from '@bpjs159/server';

export const getUsers = server({
  tags: ['users'],
  maxAge: 300,
}, async (role?: string) => {
  const users = await db.user.findMany({
    where: role ? { role } : undefined,
  });
  return users;
});

// En el cliente:
const admins = await getUsers('admin');
// ↑ RPC tipado. getUsers se ejecuta en el servidor.`} />

          <h2 id="resumibilidad">{i18n.t('sb.resumability')}</h2>
          <p>{i18n.t('d.resum.p1')}</p>
          <p>{i18n.t('d.resum.p2')}</p>

          <h2 id="estilos">{i18n.t('sb.css')}</h2>
          <p>{i18n.t('d.css.p')}</p>
          <CodeBlock code={`import { css } from '@bpjs159/core';

const card = css\`
  background: #0f172a;
  border-radius: 12px;
  padding: 24px;
  &:hover { border-color: #818cf8; }
\`;

function Card() {
  return <div class={card}>...</div>;
}`} />

          <h2 id="eventos">{i18n.t('sb.events')}</h2>
          <p>{i18n.t('d.events.p')}</p>
          <CodeBlock code={`<button astra-on:click={handler}>
  Click me
</button>`} />

          <h2 id="tipos-server">{i18n.t('sb.serverTypes')}</h2>
          <p><strong>pre-build</strong>: {i18n.t('d.types.p1')}</p>
          <p><strong>dynamic</strong>: {i18n.t('d.types.p2')}</p>
          <CodeBlock code={`// pre-build: ejecutado en build time
const menu = server({ type: 'pre-build' }, () => db.menu.findMany());

// dynamic: ejecutado en cada request  
const session = server({ type: 'dynamic' }, (req) => getSession(req));`} />

          <h2 id="caching">{i18n.t('sb.caching')}</h2>
          <p>{i18n.t('d.caching.p')}</p>
          <CodeBlock code={`// Definir con tags
const products = server({ tags: ['products'] }, () => db.product.findMany());

// Invalidar quirúrgicamente
import { revalidate } from '@bpjs159/server';
await revalidate(['products']);`} />

          <h2 id="autosync">{i18n.t('sb.autosync')}</h2>
          <p>{i18n.t('d.autosync.p')}</p>
          <CodeBlock code={`const liveData = server(
  { autoSync: true, autoSyncInterval: 3000 },
  () => db.stats.latest()
);`} />

          <h2 id="rutas">{i18n.t('sb.routes')}</h2>
          <p>{i18n.t('d.routes.p')}</p>
          <CodeBlock code={`import { route, Outlet } from '@bpjs159/router';

function Layout() {
  return (
    <div>
      <nav>...</nav>
      <Outlet />
    </div>
  );
}`} />

          <h2 id="layouts">{i18n.t('sb.layouts')}</h2>
          <p>{i18n.t('d.layouts.p')}</p>

          <h2 id="navegacion">{i18n.t('sb.navigation')}</h2>
          <p>{i18n.t('d.nav.p')}</p>
          <CodeBlock code={`import { Link, navigate } from '@bpjs159/router';

<Link href="/products">Products</Link>
<button onclick={() => navigate('/cart')}>Cart</button>`} />

          <h2 id="view-transitions">View Transitions API</h2>
          <p>{i18n.t('d.vt.p')}</p>

          <h2 id="ssr">SSR (Server-Side Rendering)</h2>
          <p>{i18n.t('d.ssr.p')}</p>

          <h2 id="ssg">SSG (Static Site Generation)</h2>
          <p>{i18n.t('d.ssg.p')}</p>

          <h2 id="isr">ISR (Incremental Static Regeneration)</h2>
          <p>{i18n.t('d.isr.p')}</p>

          <h2 id="compilador">{i18n.t('sb.advCompiler')}</h2>
          <p>{i18n.t('d.compiler.p')}</p>
          <ol>
            <li><strong>JSX → native DOM</strong>: {i18n.t('d.compiler.1')}</li>
            <li><strong>{i18n.t('d.compiler.2.name')}</strong>: {i18n.t('d.compiler.2')}</li>
            <li><strong>server → RPC</strong>: {i18n.t('d.compiler.3')}</li>
          </ol>

          <h2 id="inferencia">{i18n.t('sb.advInference')}</h2>
          <p>{i18n.t('d.inference.p')}</p>

          <h2 id="vite">{i18n.t('sb.advVite')}</h2>
          <p>{i18n.t('d.vite.p')}</p>
          <CodeBlock code={`// vite.config.ts
import astra from '@bpjs159/compiler';

export default defineConfig({
  plugins: [astra()],
});`} />

          <h2 id="despliegue">{i18n.t('sb.advDeploy')}</h2>
          <p>{i18n.t('d.deploy.p')}</p>
          <CodeBlock code={`pnpm build
# Output: dist/ con HTML estático + server handlers`} />
        </div>
      </main>

      {/* ── RIGHT SIDEBAR ── */}
      <aside class="docs-right">
        <div class="toc-label">{i18n.t('d.toc')}</div>
        <a href="/docs#tu-primer-componente" class="toc-item">{i18n.t('d.first.title')}</a>
        <a href="/docs#como-funciona" class="toc-item">{i18n.t('d.how.title')}</a>
        <a href="/docs#por-que-sin-virtual-dom" class="toc-item">{i18n.t('d.why.title')}</a>
        <a href="/docs#caracteristicas-principales" class="toc-item">{i18n.t('d.features.title')}</a>

        <div class="promo-card" style="margin-top:32px">
          <h4>{i18n.t('d.promo1.title')}</h4>
          <p>{i18n.t('d.promo1.text')}</p>
          <a href="/docs#compilador">{i18n.t('d.promo1.link')} →</a>
        </div>

        <div class="promo-card" style="margin-top:12px;background:linear-gradient(135deg,rgba(0,223,255,.06),rgba(139,77,255,.04));border-color:rgba(0,223,255,.15)">
          <h4>{i18n.t('d.promo2.title')}</h4>
          <p>{i18n.t('d.promo2.text')}</p>
          <a href="/docs#primeros-pasos">{i18n.t('d.promo2.link')} →</a>
        </div>
      </aside>
    </div>
  );
});
