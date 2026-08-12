import { component, dynamic } from '@astrajs/core';
import { Link } from '@astrajs/router';
import { DocSidebar } from '../../components/docs-sidebar.js';

const docLayoutStyle = `
  .docs-layout{display:flex;min-height:100vh}
  .docs-main{flex:1;margin-left:260px;padding:48px 56px;max-width:860px}
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
  .docs-hero-text{font-size:.92rem;color:#64748b;max-width:600px;line-height:1.7;margin-bottom:28px}
  .docs-buttons{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:40px}
  .docs-btn-primary{display:inline-flex;align-items:center;gap:6px;font-size:.82rem;font-weight:600;color:#fff;background:linear-gradient(135deg,#8d4dff,#4d7cff);padding:10px 24px;border-radius:8px;transition:opacity .15s,transform .15s;cursor:pointer;border:none;text-decoration:none}
  .docs-btn-primary:hover{opacity:.9;transform:translateY(-1px)}
  .docs-btn-ghost{display:inline-flex;align-items:center;gap:6px;font-size:.82rem;font-weight:600;color:#e2e8f0;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);padding:10px 24px;border-radius:8px;transition:background .15s;text-decoration:none}
  .docs-btn-ghost:hover{background:rgba(255,255,255,.1)}
  .feature-pills{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:40px}
  .feature-pill{background:rgba(139,77,255,.06);border:1px solid rgba(139,77,255,.12);border-radius:8px;padding:14px 20px;min-width:140px;text-align:center}
  .feature-pill-icon{font-size:1.1rem;margin-bottom:4px}
  .feature-pill-label{font-size:.72rem;font-weight:700;color:#f7f7ff}
  .feature-pill-desc{font-size:.66rem;color:#64748b;margin-top:2px}
  .code-demo{background:#060b14;border:1px solid rgba(255,255,255,.07);border-radius:12px;overflow:hidden;margin-bottom:28px}
  .code-demo-header{padding:10px 20px;display:flex;gap:20px;border-bottom:1px solid rgba(255,255,255,.06);font-size:.72rem;font-weight:600;background:rgba(255,255,255,.015)}
  .code-demo-tab{color:#475569;cursor:pointer;padding:8px 0 10px;border-bottom:2px solid transparent}
  .code-demo-tab.active{color:#b84cff;border-bottom-color:#b84cff}
  .code-demo-body{padding:24px}
  .code-demo-body pre{font-size:.76rem;line-height:1.85;color:#cbd5e1;font-family:'JetBrains Mono',monospace;white-space:pre;margin:0;background:none;border:none;padding:0}
  .code-demo-result{padding:16px 24px;border-top:1px solid rgba(255,255,255,.06);display:flex;align-items:center;gap:16px;flex-wrap:wrap;background:rgba(255,255,255,.01);font-size:.72rem;color:#64748b}
  .steps-list{counter-reset:step;margin-top:24px}
  .steps-list-item{display:flex;gap:16px;align-items:flex-start;margin-bottom:24px}
  .steps-list-num{width:36px;height:36px;border-radius:50%;background:rgba(139,77,255,.1);border:1px solid rgba(139,77,255,.2);display:flex;align-items:center;justify-content:center;font-size:.82rem;font-weight:800;color:#b84cff;flex-shrink:0}
  .steps-list-text h4{font-size:.88rem;font-weight:700;color:#f7f7ff;margin-bottom:4px}
  .steps-list-text p{font-size:.8rem;color:#64748b;line-height:1.6;margin:0}
  .promo-card{background:linear-gradient(135deg,rgba(139,77,255,.08),rgba(0,223,255,.04));border:1px solid rgba(139,77,255,.15);border-radius:12px;padding:24px;margin-top:32px}
  .promo-card h4{font-size:.9rem;font-weight:700;color:#f7f7ff;margin-bottom:8px}
  .promo-card p{font-size:.8rem;color:#94a3b8;margin-bottom:12px;line-height:1.6}
  .promo-card a{font-size:.78rem;font-weight:600;color:#b84cff}
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

export const DocsIntroduction = component(() => (
  <div class="docs-layout">
    <style>{docLayoutStyle}</style>
    <DocSidebar />
    <main class="docs-main">
      <div class="docs-content">
        <div class="docs-hero-badge">v1.0.0</div>
        <h1>Bienvenido a AstraJS</h1>
        <p class="docs-hero-text">
          El framework full-stack que elimina el Virtual DOM. AstraJS compila tu codigo TypeScript 
          a mutaciones directas del DOM usando un avanzado compilador AST. Mas rapido, mas ligero 
          y sin configuraciones.
        </p>
        <div class="docs-buttons">
          <a class="docs-btn-primary" href="/docs/introduction">Comenzar ahora →</a>
          <a class="docs-btn-ghost" href="https://github.com" target="_blank" rel="noopener">Ver en GitHub</a>
        </div>
        <div class="feature-pills">
          <div class="feature-pill"><div class="feature-pill-icon">⚡</div><div class="feature-pill-label">Zero-VDOM</div><div class="feature-pill-desc">Mutaciones quirurgicas directas al DOM.</div></div>
          <div class="feature-pill"><div class="feature-pill-icon">🔧</div><div class="feature-pill-label">Zero Config</div><div class="feature-pill-desc">Funciona out-of-the-box.</div></div>
          <div class="feature-pill"><div class="feature-pill-icon">🌐</div><div class="feature-pill-label">Full-Stack</div><div class="feature-pill-desc">SSR, SSG, ISR y RPC integrados.</div></div>
          <div class="feature-pill"><div class="feature-pill-icon">🔮</div><div class="feature-pill-label">100% TypeScript</div><div class="feature-pill-desc">Inferencia extrema de tipos.</div></div>
        </div>
        <h2>Tu primer componente</h2>
        <p>Escribe JSX. <strong>AstraJS se encarga del resto.</strong> El compilador AST transforma tu codigo en operaciones directas del DOM — sin Virtual DOM, sin diffing, sin reconciliacion. Cada expresion reactiva se convierte en una micro-suscripcion que actualiza unicamente el nodo del DOM que necesita cambiar.</p>
        <div class="code-demo">
          <div class="code-demo-header"><span class="code-demo-tab active">Counter.tsx</span></div>
          <div class="code-demo-body"><pre>{demoCode}</pre></div>
          <div class="code-demo-result">⚡ Solo se actualiza el <code>TextNode</code> de <code>state.count</code>. El componente <strong>no se re-ejecuta</strong>. Sin diffing, sin VDOM.</div>
        </div>
        <h2>Como funciona?</h2>
        <p>El compilador de AstraJS procesa tu codigo TypeScript en tres fases principales durante el build, transformando JSX en operaciones nativas del DOM, extrayendo estilos, y dividiendo las funciones <code>server()</code> en stubs para el cliente y handlers para el servidor.</p>
        <div class="steps-list">
          <div class="steps-list-item"><div class="steps-list-num">1</div><div class="steps-list-text"><h4>Escribes</h4><p>Usas TypeScript, JSX, <code>store()</code>, <code>server()</code> y el Router. Todo con tipos inferidos 100% de extremo a extremo.</p></div></div>
          <div class="steps-list-item"><div class="steps-list-num">2</div><div class="steps-list-text"><h4>Compila (AST)</h4><p>El compilador analiza tu AST, transforma JSX en <code>document.createElement</code>, extrae CSS con ambito, y optimiza las queries de servidor.</p></div></div>
          <div class="steps-list-item"><div class="steps-list-num">3</div><div class="steps-list-text"><h4>Build / Pre-build</h4><p>Evalua funciones <code>server()</code> con tipo pre-build en build time, inyecta el resultado en el HTML, y genera bundles ultra-ligeros.</p></div></div>
          <div class="steps-list-item"><div class="steps-list-num">4</div><div class="steps-list-text"><h4>Entrega</h4><p>HTML renderizado en servidor + CSS minimo + JS Just-In-Time. Paginas estaticas con <strong>0 KB de JavaScript</strong>.</p></div></div>
          <div class="steps-list-item"><div class="steps-list-num">5</div><div class="steps-list-text"><h4>Interactividad JIT</h4><p>Los event handlers y chunks de JS se cargan <strong>solo cuando el usuario interactua</strong>. Resumibilidad instantanea sin hidratacion pesada.</p></div></div>
        </div>
        <h2>Por que sin Virtual DOM?</h2>
        <p>Los frameworks basados en Virtual DOM introducen tres fuentes de overhead:</p>
        <ol>
          <li><strong>Diffing</strong> — Comparar el VDOM anterior con el nuevo para encontrar diferencias consume CPU en cada actualizacion.</li>
          <li><strong>Reconciliacion</strong> — Traducir las diferencias encontradas a operaciones del DOM real requiere logica compleja y costosa.</li>
          <li><strong>Re-renders en cascada</strong> — Un cambio de estado en un componente puede desencadenar la re-ejecucion de todo su sub-arbol.</li>
        </ol>
        <p>AstraJS elimina los tres. <strong>Cada expresion reactiva se compila en un effect independiente que actualiza exactamente un nodo del DOM.</strong> Cuando <code>state.count</code> cambia, solo el <code>TextNode</code> que muestra ese valor se actualiza. Nada mas. El componente no se re-ejecuta, los hijos no se re-renderizan, y no hay arbol virtual que comparar.</p>
        <p>El resultado es un rendimiento <strong>O(1)</strong> por cambio — sin importar cuan profundo este el componente en el arbol o cuan grande sea tu aplicacion.</p>
        <h2>Arquitectura de paquetes</h2>
        <p>AstraJS esta organizado en paquetes independientes bajo <code>@astrajs/*</code>. Solo importas lo que necesitas:</p>
        <ul>
          <li><strong>@astrajs/core</strong> (~3KB) — <code>store()</code>, <code>component()</code>, bindings al DOM, <code>memo()</code>, <code>dynamic()</code>.</li>
          <li><strong>@astrajs/compiler</strong> — Plugin de Vite. Transforma JSX → DOM, extrae CSS, genera RPC stubs.</li>
          <li><strong>@astrajs/server</strong> — <code>server()</code>, <code>revalidate()</code>, <code>autoSync</code>, cache con tags.</li>
          <li><strong>@astrajs/router</strong> — <code>route()</code>, <code>Link</code>, <code>navigate()</code>, <code>Outlet</code>, <code>params</code>.</li>
          <li><strong>@astrajs/ssr</strong> — Renderizado en servidor, SSG, ISR, resumibilidad.</li>
          <li><strong>@astrajs/form</strong> — Manejo reactivo de formularios con validacion nativa.</li>
        </ul>
        <h2 id="instalacion">Instalacion</h2>
        <p>La forma mas rapida de empezar es con el CLI:</p>
        <pre><code>pnpm create astra@latest</code></pre>
        <p>Esto crea un proyecto con Vite, TypeScript, y todos los paquetes de AstraJS configurados. Alternativamente, puedes anadir AstraJS a un proyecto Vite existente:</p>
        <pre><code>pnpm add @astrajs/core @astrajs/compiler

{`// vite.config.ts
import astra from '@astrajs/compiler';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [astra()],
});`}</code></pre>
        <p>Asegurate de configurar el JSX en <code>tsconfig.json</code>:</p>
        <pre><code>{`{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@astrajs/core"
  }
}`}</code></pre>
        <h2 id="primeros-pasos">Primeros pasos</h2>
        <p>Crea tu primer componente reactivo. Observa como <code>store()</code> y <code>component()</code> trabajan juntos:</p>
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
        <p>Cada vez que el usuario escribe en el input:</p>
        <ul>
          <li><code>name.value</code> se actualiza via el Proxy de ES6.</li>
          <li>Solo el <code>TextNode</code> dentro del <code>&lt;h1&gt;</code> se actualiza.</li>
          <li>El input mantiene su valor y el foco — <strong>no se re-crea</strong>.</li>
          <li>El componente <strong>no se re-ejecuta</strong>. La funcion <code>Hello</code> corrio una sola vez.</li>
        </ul>
        <h2 id="conceptos-clave">Conceptos clave</h2>
        <ul>
          <li><strong>store()</strong> — Crea un proxy reactivo de ES6. Cada acceso a una propiedad se registra como dependencia. Cada escritura notifica solo a los suscriptores exactos de esa propiedad. O(1) updates.</li>
          <li><strong>component()</strong> — Envuelve una funcion que retorna JSX. La funcion se ejecuta <strong>una sola vez</strong>. El DOM resultante es real, no virtual. La reactividad viene de los bindings individuales que el compilador inyecta.</li>
          <li><strong>server()</strong> — Define una funcion que se ejecuta en el servidor. El compilador genera automaticamente el stub RPC para el cliente y registra el handler en el servidor. Tipos compartidos extremo a extremo.</li>
          <li><strong>route()</strong> — Guard booleano reactivo. Retorna <code>true</code> si la URL actual coincide con el patron. Sin wrappers, sin HOCs, sin contexto magico.</li>
          <li><strong>css``</strong> — Template literal tag para CSS con ambito de componente. El compilador extrae y optimiza los estilos en build time.</li>
        </ul>
        <div class="promo-card">
          <h4>⚡ Compila en tiempo de build. Ejecuta a maxima velocidad.</h4>
          <p>El compilador AST de AstraJS transforma tu codigo en operaciones nativas del DOM. Sin overhead en runtime.</p>
          <Link href="/docs/advanced">Mas sobre el compilador →</Link>
        </div>
        <div class="promo-card" style="margin-top:16px;background:linear-gradient(135deg,rgba(0,223,255,.06),rgba(139,77,255,.04));border-color:rgba(0,223,255,.15)">
          <h4>🚀 Listo para construir?</h4>
          <p>Aprende los fundamentos: componentes, reactividad, estilos y eventos.</p>
          <Link href="/docs/fundamentals">Ir a Fundamentos →</Link>
        </div>
      </div>
    </main>
  </div>
));
