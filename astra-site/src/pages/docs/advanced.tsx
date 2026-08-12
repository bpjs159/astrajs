import { component, dynamic } from '@astrajs/core';
import { DocSidebar } from '../../components/docs-sidebar.js';
import { i18n } from '../../i18n.js';

const s = `
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
  .docs-content .note{padding:14px 18px;background:rgba(139,77,255,.06);border-left:3px solid rgba(139,77,255,.3);border-radius:0 8px 8px 0;margin-bottom:20px;font-size:.84rem;color:#c4a0ff}
`;

export const DocsAdvanced = component(() => (
  <div class="docs-layout">
    <style>{s}</style>
    <DocSidebar />
    <main class="docs-main">
      <div class="docs-content">
        <h1>{i18n.t('sb.advanced')}</h1>
        <p>{i18n.t('av.hero')}</p>

        <h2 id="compilador">{i18n.t('sb.advCompiler')}</h2>
        <p>{i18n.t('av.comp.a')}<strong>{i18n.t('av.comp.b')}</strong>{i18n.t('av.comp.c')}</p>

        <h3>{i18n.t('av.p1.title')}</h3>
        <p>{i18n.t('av.p1.a')}<code>document.createElement</code>{i18n.t('av.p1.b')}<code>{'{store.value}'}</code>{i18n.t('av.p1.c')}<code>effect(() =&gt; {'{'} textNode.nodeValue = store.value {'}'})</code>{i18n.t('av.p1.d')}</p>
        <pre><code>{`// Entrada (JSX):
<span class="greeting">Hola {name}</span>

// Salida del compilador (aproximado):
const span = document.createElement('span');
span.className = 'greeting';
const t1 = document.createTextNode('Hola ');
const t2 = document.createTextNode('');
span.append(t1, t2);
effect(() => { t2.nodeValue = String(name); });`}</code></pre>

        <h3>{i18n.t('av.p2.title')}</h3>
        <p>{i18n.t('av.p2.a')}<code>css</code>{i18n.t('av.p2.b')}</p>
        <pre><code>{`// Entrada:
const styles = css\`.card { padding: 16px; }\`;

// Salida:
// 1. Se extrae el CSS a un archivo: assets/card-a1b2c3.css
// 2. Se reemplaza el template por una referencia:
const styles = 'card_a1b2c3';
// 3. En el HTML: <link rel="stylesheet" href="/assets/card-a1b2c3.css">`}</code></pre>

        <h3>{i18n.t('av.p3.title')}</h3>
        <p>{i18n.t('av.p3.a')}<code>server()</code>{i18n.t('av.p3.b')}</p>
        <pre><code>{`// Entrada:
export const getUsers = server(
  { tags: ['users'] },
  async (role?: string) => {
    return db.user.findMany({ where: { role } });
  }
);

// Salida — Cliente (incluido en el bundle):
export const getUsers = (role?: string) =>
  fetch('/api/astra/getUsers', {
    method: 'POST',
    body: JSON.stringify([role]),
  }).then(r => r.json());

// Salida — Servidor (registrado en el middleware):
registerHandler('getUsers', async ([role]) => {
  return db.user.findMany({ where: { role } });
});`}</code></pre>

        <h3>{i18n.t('av.modes.title')}</h3>
        <p>{i18n.t('av.modes.a')}<code>transformMode</code>{i18n.t('av.modes.b')}</p>
        <ul>
          <li><strong><code>'dynamic'</code> (default)</strong> — {i18n.t('av.m1.a')}<code>dynamic()</code>{i18n.t('av.m1.b')}</li>
          <li><strong><code>'vanilla'</code></strong> — {i18n.t('av.m2.a')}<code>bindText</code>{i18n.t('av.m2.b')}<code>bindAttr</code>{i18n.t('av.m2.c')}</li>
        </ul>
        <pre><code>{`// vite.config.ts
import astra from '@astrajs/compiler';

export default defineConfig({
  plugins: [
    astra({
      transformMode: 'dynamic', // o 'vanilla'
      apiPrefix: '/api/astra',  // prefijo para endpoints RPC
    }),
  ],
});`}</code></pre>

        <h2 id="inferencia">{i18n.t('sb.advInference')}</h2>
        <p>{i18n.t('av.inf.a')}<strong>{i18n.t('av.inf.b')}</strong>{i18n.t('av.inf.c')}</p>

        <h3>{i18n.t('av.inf1.title')}</h3>
        <pre><code>{`const user = store({
  name: 'Ada',        // → string
  age: 28,            // → number
  profile: {          // → { bio: string; avatar: string }
    bio: 'Dev',
    avatar: '/a.jpg',
  },
  tags: ['ts', 'oss'], // → string[]
});

// user.name es string (inferido, no anotado)
// user.profile.bio es string (inferido en profundidad)
// user.tags es string[] (inferido del array inicial)`}</code></pre>

        <h3>{i18n.t('av.inf2.title')}</h3>
        <pre><code>{`const getProduct = server(
  { tags: ['products'] },
  async (id: string) => {
    // db.product.findUnique retorna Product | null
    return db.product.findUnique({ where: { id } });
  }
);

// El tipo de retorno se infiere y se propaga al cliente:
// const getProduct: (id: string) => Promise<Product | null>
// Sin anotaciones manuales, sin duplicacion`}</code></pre>

        <h3>{i18n.t('av.inf3.title')}</h3>
        <pre><code>{`// types/products.ts (compartido)
export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
}

// server/products.server.ts
export const listProducts = server(
  { tags: ['products'] },
  async (): Promise<Product[]> => {
    return db.product.findMany();
  }
);

// pages/products.tsx (cliente)
const products = await listProducts();
// ↑ products es Product[] — el tipo viaja del servidor al cliente
// automaticamente, sin codegen, sin duplicar definiciones`}</code></pre>

        <h2 id="vite">{i18n.t('sb.advVite')}</h2>
        <p>{i18n.t('av.vite.p')}</p>

        <h3>{i18n.t('av.config.title')}</h3>
        <pre><code>{`// vite.config.ts
import { defineConfig } from 'vite';
import astra from '@astrajs/compiler';
import path from 'path';

export default defineConfig({
  plugins: [
    astra({
      apiPrefix: '/api/astra',    // prefijo RPC
      transformMode: 'dynamic',   // modo del compilador
    }),
  ],
  resolve: {
    alias: {
      // Solo necesario en monorepo/dev
      '@astrajs/core': path.resolve(__dirname, '../packages/core/src'),
    },
  },
});`}</code></pre>

        <h3>{i18n.t('av.hmr.title')}</h3>
        <p>{i18n.t('av.hmr.p')}</p>

        <div class="note">
          <strong>{i18n.t('lbl.tip')}:</strong> {i18n.t('av.note.a')}<code>packages/compiler/src/</code>{i18n.t('av.note.b')}<code>npm run build</code>{i18n.t('av.note.c')}<code>dist/</code>{i18n.t('av.note.d')}<code>src/</code>{i18n.t('av.note.e')}
        </div>

        <h2 id="despliegue">{i18n.t('sb.advDeploy')}</h2>
        <p>{i18n.t('av.dep.a')}<code>dist/</code>{i18n.t('av.dep.b')}</p>
        <ul>
          <li><strong>{i18n.t('av.dep1.name')}</strong> — {i18n.t('av.dep1')}</li>
          <li><strong>{i18n.t('av.dep2.name')}</strong> — {i18n.t('av.dep2')}</li>
          <li><strong>{i18n.t('av.dep3.name')}</strong> — {i18n.t('av.dep3')}</li>
        </ul>

        <h3>{i18n.t('av.plat.title')}</h3>
        <table>
          <tr><th>{i18n.t('av.plat.th')}</th><th>SSR</th><th>SSG/ISR</th><th>server()</th></tr>
          <tr><td><strong>Node.js</strong></td><td>✅</td><td>✅</td><td>✅</td></tr>
          <tr><td><strong>Vercel</strong></td><td>✅</td><td>✅</td><td>✅ Serverless</td></tr>
          <tr><td><strong>Netlify</strong></td><td>✅</td><td>✅</td><td>✅ Functions</td></tr>
          <tr><td><strong>Cloudflare Workers</strong></td><td>✅</td><td>✅</td><td>✅ Workers</td></tr>
          <tr><td><strong>AWS Lambda</strong></td><td>✅</td><td>✅</td><td>✅ Lambda</td></tr>
          <tr><td><strong>Docker</strong></td><td>✅</td><td>✅</td><td>✅</td></tr>
        </table>

        <h3>{i18n.t('av.build.title')}</h3>
        <pre><code>{`# Desarrollo
pnpm dev

# Build de produccion
pnpm build
# → dist/
#   ├── index.html          (SSG)
#   ├── assets/             (JS, CSS, imagenes)
#   └── server/             (handlers server())

# Preview de produccion
pnpm preview`}</code></pre>
      </div>
    </main>
  </div>
));
