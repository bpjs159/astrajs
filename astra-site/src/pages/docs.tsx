import { component, dynamic } from '@astrajs/core';
import { Link } from '@astrajs/router';
import { DocSidebar } from '../components/docs-sidebar.js';

export const DocsPage = component(() => {
  const style = `
    .docs-layout{display:flex;min-height:100vh}
    .docs-main{flex:1;margin-left:260px;padding:48px 56px;max-width:900px}
    .docs-right{position:fixed;top:64px;right:0;width:240px;padding:48px 32px;display:none}
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

    .feature-pills{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:40px}
    .feature-pill{background:rgba(139,77,255,.06);border:1px solid rgba(139,77,255,.12);border-radius:8px;padding:14px 20px;min-width:140px;text-align:center}
    .feature-pill-icon{font-size:1.1rem;margin-bottom:4px}
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

  const demoCode = `import { store } from '@astrajs/core';

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
          <h1>Bienvenido a AstraJS</h1>
          <p class="docs-hero-text">
            El framework full-stack que elimina el Virtual DOM. AstraJS compila tu código TypeScript 
            a mutaciones directas del DOM usando un avanzado compilador AST. Más rápido, más ligero 
            y sin configuraciones.
          </p>

          <div class="docs-buttons">
            <a class="docs-btn-primary" href="/docs#primeros-pasos">
              Comenzar ahora →
            </a>
            <a class="docs-btn-ghost" href="https://github.com" target="_blank" rel="noopener">
              Ver en GitHub
            </a>
          </div>

          <div class="feature-pills">
            <div class="feature-pill">
              <div class="feature-pill-icon">⚡</div>
              <div class="feature-pill-label">Zero-VDOM</div>
              <div class="feature-pill-desc">Mutaciones quirúrgicas<br/>directas al DOM.</div>
            </div>
            <div class="feature-pill">
              <div class="feature-pill-icon">🔧</div>
              <div class="feature-pill-label">Zero Config</div>
              <div class="feature-pill-desc">Funciona out-of-the-box.<br/>Tú escribes, Astra compila.</div>
            </div>
            <div class="feature-pill">
              <div class="feature-pill-icon">🌐</div>
              <div class="feature-pill-label">Full-Stack</div>
              <div class="feature-pill-desc">SSR, SSG, ISR y RPC<br/>integrados.</div>
            </div>
            <div class="feature-pill">
              <div class="feature-pill-icon">🔮</div>
              <div class="feature-pill-label">100% TypeScript</div>
              <div class="feature-pill-desc">Inferencia extrema de<br/>tipos de extremo a extremo.</div>
            </div>
          </div>

          {/* ── Primer componente ── */}
          <h2 id="tu-primer-componente">Tu primer componente</h2>
          <p>Escribe JSX. <strong>AstraJS se encarga del resto.</strong></p>

          <div class="code-demo">
            <div class="code-demo-header">
              <span class="code-demo-tab active">Counter.tsx</span>
              <span class="code-demo-tab">TSX</span>
              <span class="code-demo-tab">JS</span>
              <span class="code-demo-tab">HTML</span>
            </div>
            <div class="code-demo-body">
              <pre>{demoCode}</pre>
            </div>
            <div class="code-demo-result">
              <span class="code-demo-result-label">Resultado en el DOM</span>
              <span class="code-demo-counter">Count: 0</span>
              <span class="code-demo-note">Actualización quirúrgica: Solo se actualiza el nodo de texto. Sin re-renderizar el componente.</span>
            </div>
          </div>

          {/* ── Cómo funciona ── */}
          <h2 id="como-funciona">¿Cómo funciona?</h2>
          <p>AstraJS transforma tu código en tiempo de compilación.</p>

          <div class="steps-list">
            <div class="steps-list-item">
              <div class="steps-list-num">1</div>
              <div class="steps-list-text">
                <h4>Escribes</h4>
                <p>Usas TypeScript, JSX, stores, server y el Router.</p>
              </div>
            </div>
            <div class="steps-list-item">
              <div class="steps-list-num">2</div>
              <div class="steps-list-text">
                <h4>Compila (AST)</h4>
                <p>Astra Compiler transforma a DOM nativo y extrae CSS.</p>
              </div>
            </div>
            <div class="steps-list-item">
              <div class="steps-list-num">3</div>
              <div class="steps-list-text">
                <h4>Build / Pre-build</h4>
                <p>Evalúa lo estático en build time (pre-build) y genera HTML.</p>
              </div>
            </div>
            <div class="steps-list-item">
              <div class="steps-list-num">4</div>
              <div class="steps-list-text">
                <h4>Entrega</h4>
                <p>HTML + CSS + JS mínimo. Listo para navegador.</p>
              </div>
            </div>
            <div class="steps-list-item">
              <div class="steps-list-num">5</div>
              <div class="steps-list-text">
                <h4>Interactividad JIT</h4>
                <p>JS se descarga solo cuando el usuario interactúa.</p>
              </div>
            </div>
          </div>

          {/* ── ¿Por qué sin Virtual DOM? ── */}
          <h2 id="por-que-sin-virtual-dom">¿Por qué sin Virtual DOM?</h2>
          <p>
            Los Virtual DOM introducen overhead innecesario: diffing, reconciliación y re-renders en cascada.
            AstraJS elimina todo eso. <strong>Cada expresión reactiva se compila en una micro-suscripción 
            que actualiza exactamente el nodo del DOM que necesita cambiar.</strong>
          </p>
          <p>
            El resultado es un rendimiento <strong>O(1)</strong> por cambio — 
            sin importar cuán grande sea tu aplicación. No hay diffing, no hay VDOM tree, 
            no hay re-ejecución de componentes.
          </p>

          {/* ── Características principales ── */}
          <h2 id="caracteristicas-principales">Características principales</h2>
          <ul>
            <li><strong>Compilador AST</strong> — Transforma JSX → DOM nativo en tiempo de build.</li>
            <li><strong>Reactivity basada en Proxy</strong> — Suscripciones de grano fino O(1).</li>
            <li><strong>server RPC</strong> — Funciones tipadas end-to-end entre cliente y servidor.</li>
            <li><strong>SSR / SSG / ISR</strong> — Renderizado híbrido sin configuración adicional.</li>
            <li><strong>Router isomórfico</strong> — Navegación SPA con layouts persistentes y View Transitions API.</li>
            <li><strong>Inferencia de tipos 100%</strong> — Tipos compartidos entre cliente y servidor sin anotaciones extra.</li>
            <li><strong>Zero configuración</strong> — Solo necesitas el plugin de Vite. Sin webpack, sin babel extra.</li>
            <li><strong>Resumibilidad</strong> — El HTML renderizado en servidor se hidrata instantáneamente sin re-ejecutar.</li>
          </ul>

          {/* ── Promo card ── */}
          <div class="promo-card">
            <h4>⚡ Compila en tiempo de build. Ejecuta a máxima velocidad.</h4>
            <p>Cero JavaScript innecesario en el navegador.</p>
            <a href="/docs#compilador">Más sobre el compilador →</a>
          </div>

          <div class="promo-card" style="margin-top:16px;background:linear-gradient(135deg,rgba(0,223,255,.06),rgba(139,77,255,.04));border-color:rgba(0,223,255,.15)">
            <h4>🚀 ¿Nuevo aquí?</h4>
            <p>Sigue la guía paso a paso y construye tu primera app en minutos.</p>
            <a href="/docs#primeros-pasos">Ir a Primeros pasos →</a>
          </div>

          {/* Placeholder sections for sidebar nav */}
          <h2 id="instalacion">Instalación</h2>
          <p>Para crear un nuevo proyecto AstraJS, ejecuta:</p>
          <pre><code>pnpm create astra@latest</code></pre>
          <p>O añade AstraJS a un proyecto Vite existente:</p>
          <pre><code>pnpm add @astrajs/core @astrajs/compiler
{`// vite.config.ts
import astra from '@astrajs/compiler';

export default {
  plugins: [astra()],
};`}</code></pre>

          <h2 id="primeros-pasos">Primeros pasos</h2>
          <p>Una vez instalado, crea tu primer componente:</p>
          <pre><code>{`import { component, store } from '@astrajs/core';

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
});`}</code></pre>
          <p>Cada vez que el usuario escribe en el input, <strong>solo el texto dentro del <code>&lt;h1&gt;</code> se actualiza</strong>. El componente no se re-ejecuta.</p>

          <h2 id="conceptos-clave">Conceptos clave</h2>
          <ul>
            <li><strong>store()</strong> — Estado reactivo basado en Proxy. Suscripciones automáticas O(1).</li>
            <li><strong>component()</strong> — Envuelve una función que retorna JSX. Se ejecuta una sola vez.</li>
            <li><strong>server()</strong> — RPC tipado. Escribe una función, se ejecuta en el servidor.</li>
            <li><strong>route()</strong> — Guard booleano reactivo. Sin wrappers, sin HOCs.</li>
            <li><strong>css``</strong> — CSS con ámbito de componente, extraído en build time.</li>
          </ul>

          <h2 id="componentes">Componentes</h2>
          <p>En AstraJS, un componente es una función que retorna elementos del DOM real. No hay Virtual DOM: lo que retornas se inserta directamente en el documento.</p>
          <pre><code>{`// Sin estado → función pura
function Greeting({ name }: { name: string }) {
  return <h2>Hola, {name}</h2>;
}

// Con estado → component()
export const Counter = component(() => {
  const state = store({ count: 0 });
  return (
    <button onclick={() => state.count++}>
      {state.count}
    </button>
  );
});`}</code></pre>

          <h2 id="reactividad">Reactividad con store</h2>
          <p><code>store()</code> crea un proxy de ES6 que rastrea accesos a propiedades y notifica solo a los suscriptores exactos.</p>
          <pre><code>{`const user = store({
  name: 'Ada',
  profile: { bio: 'Dev' }
});

// Lectura → suscripción automática
// user.name → suscribe solo al TextNode de "name"
// user.profile.bio → suscribe solo al TextNode de "bio"

// Escritura → notificación quirúrgica
user.name = 'Grace';     
// → solo se actualiza el nodo de "name", nada más`}</code></pre>

          <h2 id="jsx-sin-vdom">JSX sin VDOM</h2>
          <p>El compilador de AstraJS transforma JSX en operaciones directas del DOM:</p>
          <pre><code>{`// Escribes:
<span>Hola {name}</span>

// El compilador genera:
const span = document.createElement('span');
const text1 = document.createTextNode('Hola ');
const text2 = document.createTextNode('');
span.append(text1, text2);
effect(() => { text2.nodeValue = String(name); });`}</code></pre>
          <p><strong>No hay diffing. No hay reconciliación. Solo actualizaciones quirúrgicas.</strong></p>

          <h2 id="server">server</h2>
          <p>Define una función que se ejecuta en el servidor con tipos completos compartidos:</p>
          <pre><code>{`import { server } from '@astrajs/server';

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
// ↑ RPC tipado. getUsers se ejecuta en el servidor.`}</code></pre>

          <h2 id="resumibilidad">Resumibilidad</h2>
          <p>AstraJS soporta resumibilidad: el HTML generado en el servidor incluye toda la información necesaria para que el cliente continúe la ejecución sin re-renderizar.</p>
          <p>Esto significa que una página puede ser completamente interactiva sin enviar JavaScript hasta que el usuario interactúe con ella — y cuando lo hace, solo se carga el código necesario para ese elemento específico.</p>

          <h2 id="estilos">Estilos con css</h2>
          <p>AstraJS ofrece un macro <code>css</code> para estilos con ámbito de componente, extraídos en tiempo de compilación.</p>
          <pre><code>{`import { css } from '@astrajs/core';

const card = css\`
  background: #0f172a;
  border-radius: 12px;
  padding: 24px;
  &:hover { border-color: #818cf8; }
\`;

function Card() {
  return <div class={card}>...</div>;
}`}</code></pre>

          <h2 id="eventos">Eventos resumibles</h2>
          <p>Los manejadores de eventos en AstraJS son resumibles: el HTML incluye referencias a los handlers, y el código JS solo se descarga cuando el usuario interactúa con el elemento.</p>
          <pre><code>{`<button astra-on:click={handler}>
  Click me
</button>`}</code></pre>

          <h2 id="tipos-server">Tipos pre-build vs dynamic</h2>
          <p><strong>pre-build</strong>: La función se ejecuta en tiempo de build. El resultado se incrusta en el HTML. Ideal para datos que no cambian frecuentemente.</p>
          <p><strong>dynamic</strong>: La función se ejecuta en cada request. Ideal para datos personalizados por usuario o en tiempo real.</p>
          <pre><code>{`// pre-build: ejecutado en build time
const menu = server({ type: 'pre-build' }, () => db.menu.findMany());

// dynamic: ejecutado en cada request  
const session = server({ type: 'dynamic' }, (req) => getSession(req));`}</code></pre>

          <h2 id="caching">Revalidate & Caching</h2>
          <p>AstraJS ofrece invalidación quirúrgica de caché mediante etiquetas (<code>tags</code>). Cuando mutas datos, solo las queries afectadas se revalidan.</p>
          <pre><code>{`// Definir con tags
const products = server({ tags: ['products'] }, () => db.product.findMany());

// Invalidar quirúrgicamente
import { revalidate } from '@astrajs/server';
await revalidate(['products']);`}</code></pre>

          <h2 id="autosync">autoSync y ETAGS</h2>
          <p>Con <code>autoSync: true</code>, AstraJS mantiene los datos del cliente sincronizados con el servidor mediante ETags. Solo se transfieren datos cuando hay cambios reales.</p>
          <pre><code>{`const liveData = server(
  { autoSync: true, autoSyncInterval: 3000 },
  () => db.stats.latest()
);`}</code></pre>

          <h2 id="rutas">Rutas y &lt;Outlet /&gt;</h2>
          <p>El router de AstraJS usa guards booleanos reactivos. Sin wrappers, sin HOCs, sin componentes de orden superior.</p>
          <pre><code>{`import { route, Outlet } from '@astrajs/router';

function Layout() {
  return (
    <div>
      <nav>...</nav>
      <Outlet />
    </div>
  );
}`}</code></pre>

          <h2 id="layouts">Layouts anidados</h2>
          <p>AstraJS soporta layouts anidados con <code>&lt;Outlet /&gt;</code>. El estado se preserva entre navegaciones y funciona con View Transitions API.</p>

          <h2 id="navegacion">Navegación</h2>
          <p>Usa <code>Link</code> para navegación declarativa o <code>navigate()</code> para navegación programática.</p>
          <pre><code>{`import { Link, navigate } from '@astrajs/router';

<Link href="/products">Products</Link>
<button onclick={() => navigate('/cart')}>Cart</button>`}</code></pre>

          <h2 id="view-transitions">View Transitions API</h2>
          <p>AstraJS integra la View Transitions API del navegador para animaciones fluidas entre rutas, sin configuración adicional.</p>

          <h2 id="ssr">SSR (Server-Side Rendering)</h2>
          <p>Renderiza tu aplicación en el servidor. El HTML se envía completamente formado, listo para el navegador. La hidratación es instantánea gracias al sistema de resumibilidad.</p>

          <h2 id="ssg">SSG (Static Site Generation)</h2>
          <p>Genera HTML estático en tiempo de build. Ideal para páginas de contenido, blogs y documentación. Cero JavaScript en el cliente.</p>

          <h2 id="isr">ISR (Incremental Static Regeneration)</h2>
          <p>Combina lo mejor de SSG y SSR: páginas estáticas que se regeneran incrementalmente en el servidor cuando los datos cambian.</p>

          <h2 id="compilador">Compilador AST</h2>
          <p>El compilador de AstraJS analiza tu código TypeScript y lo transforma en tres fases:</p>
          <ol>
            <li><strong>JSX → DOM nativo</strong>: Convierte cada elemento JSX en <code>document.createElement</code>.</li>
            <li><strong>Extracción de CSS</strong>: Separa los estilos y los optimiza.</li>
            <li><strong>server → RPC</strong>: Divide las funciones server en cliente (fetch) y servidor (handler).</li>
          </ol>

          <h2 id="inferencia">Inferencia de tipos</h2>
          <p>AstraJS infiere tipos 100% de extremo a extremo. Los tipos de <code>server()</code> se comparten automáticamente entre cliente y servidor. Sin anotaciones redundantes, sin codegen.</p>

          <h2 id="vite">Integración con Vite</h2>
          <p>AstraJS se integra como un plugin de Vite. Solo necesitas añadirlo a tu configuración:</p>
          <pre><code>{`// vite.config.ts
import astra from '@astrajs/compiler';

export default defineConfig({
  plugins: [astra()],
});`}</code></pre>

          <h2 id="despliegue">Despliegue</h2>
          <p>AstraJS es compatible con cualquier plataforma que soporte Node.js o serverless functions: Vercel, Netlify, Cloudflare Workers, AWS Lambda, y servidores tradicionales con Node.js.</p>
          <pre><code>{`pnpm build
# Output: dist/ con HTML estático + server handlers`}</code></pre>
        </div>
      </main>

      {/* ── RIGHT SIDEBAR ── */}
      <aside class="docs-right">
        <div class="toc-label">EN ESTA PÁGINA</div>
        <a href="/docs#tu-primer-componente" class="toc-item">Tu primer componente</a>
        <a href="/docs#como-funciona" class="toc-item">Cómo funciona</a>
        <a href="/docs#por-que-sin-virtual-dom" class="toc-item">¿Por qué sin Virtual DOM?</a>
        <a href="/docs#caracteristicas-principales" class="toc-item">Características principales</a>

        <div class="promo-card" style="margin-top:32px">
          <h4>⚡ Compila en tiempo<br/>de build. Ejecuta<br/>a máxima velocidad.</h4>
          <p>Cero JavaScript innecesario en el navegador.</p>
          <a href="/docs#compilador">Más sobre el compilador →</a>
        </div>

        <div class="promo-card" style="margin-top:12px;background:linear-gradient(135deg,rgba(0,223,255,.06),rgba(139,77,255,.04));border-color:rgba(0,223,255,.15)">
          <h4>🚀 ¿NUEVO AQUÍ?</h4>
          <p>Sigue la guía paso a paso y construye tu primera app en minutos.</p>
          <a href="/docs#primeros-pasos">Ir a Primeros pasos →</a>
        </div>
      </aside>
    </div>
  );
});
