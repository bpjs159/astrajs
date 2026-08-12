import { component, dynamic } from '@astrajs/core';
import { DocSidebar } from '../../components/docs-sidebar.js';

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
        <h1>Avanzado</h1>
        <p>Conceptos avanzados para entender a fondo como funciona AstraJS internamente y como aprovechar al maximo sus capacidades.</p>

        <h2 id="compilador">Compilador AST</h2>
        <p>El compilador de AstraJS es un plugin de Vite que analiza tu codigo TypeScript usando el AST parser nativo de TypeScript. Opera en <strong>tres fases</strong> durante el build:</p>

        <h3>Fase 1: JSX → DOM nativo</h3>
        <p>Cada elemento JSX se transforma en llamadas a <code>document.createElement</code>. Las expresiones reactivas (<code>{'{store.value}'}</code>) se convierten en efectos de grano fino (<code>effect(() =&gt; {'{'} textNode.nodeValue = store.value {'}'})</code>). No hay fabrica virtual, no hay fiber, no hay reconciliacion.</p>
        <pre><code>{`// Entrada (JSX):
<span class="greeting">Hola {name}</span>

// Salida del compilador (aproximado):
const span = document.createElement('span');
span.className = 'greeting';
const t1 = document.createTextNode('Hola ');
const t2 = document.createTextNode('');
span.append(t1, t2);
effect(() => { t2.nodeValue = String(name); });`}</code></pre>

        <h3>Fase 2: Extraccion de CSS</h3>
        <p>Los templates <code>css``</code> se extraen del codigo, se les genera un identificador unico (hash), y se inyectan en el documento. En produccion, se extraen a archivos CSS separados con content-hash en el nombre para caching inmutable.</p>
        <pre><code>{`// Entrada:
const styles = css\`.card { padding: 16px; }\`;

// Salida:
// 1. Se extrae el CSS a un archivo: assets/card-a1b2c3.css
// 2. Se reemplaza el template por una referencia:
const styles = 'card_a1b2c3';
// 3. En el HTML: <link rel="stylesheet" href="/assets/card-a1b2c3.css">`}</code></pre>

        <h3>Fase 3: server() → RPC</h3>
        <p>Las funciones <code>server()</code> se dividen en dos partes: un stub para el cliente (fetch wrapper) y un handler para el servidor. El compilador analiza los tipos de TypeScript para garantizar type safety extremo a extremo.</p>
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

        <h3>Modos del compilador</h3>
        <p>El plugin de Vite acepta un parametro <code>transformMode</code>:</p>
        <ul>
          <li><strong><code>'dynamic'</code> (default)</strong> — Envuelve todas las expresiones JSX en <code>dynamic()</code>. La reactividad es completamente transparente para el desarrollador. Ideal para aplicaciones interactivas.</li>
          <li><strong><code>'vanilla'</code></strong> — Genera DOM nativo sin wrappers de reactividad. Usa <code>bindText</code>, <code>bindAttr</code>, etc. directamente. Ideal para paginas de contenido estatico con minima interactividad.</li>
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

        <h2 id="inferencia">Inferencia de tipos</h2>
        <p>AstraJS logra <strong>100% de inferencia de tipos de extremo a extremo</strong> sin codegen, sin duplicacion de tipos, y sin anotaciones redundantes. Esto es posible gracias a tres mecanismos:</p>

        <h3>1. Tipos inferidos de store()</h3>
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

        <h3>2. Tipos inferidos de server()</h3>
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

        <h3>3. Tipos entre cliente y servidor</h3>
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

        <h2 id="vite">Integracion con Vite</h2>
        <p>AstraJS funciona como un plugin de Vite, lo que significa que hereda todas las capacidades del ecosistema Vite: HMR instantaneo, code splitting automatico, optimizacion de dependencias con esbuild, y compatibilidad con plugins de la comunidad.</p>

        <h3>Configuracion minima</h3>
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

        <h3>HMR (Hot Module Replacement)</h3>
        <p>Los cambios en componentes, stores, y estilos se reflejan instantaneamente sin perder el estado. El HMR de Vite funciona nativamente con AstraJS porque los componentes producen DOM real — Vite puede reemplazar modulos sin romper la aplicacion.</p>

        <div class="note">
          <strong>Tip:</strong> Si editas el codigo fuente del compilador (<code>packages/compiler/src/</code>), necesitas ejecutar <code>npm run build</code> en ese paquete. El plugin de Vite siempre carga desde <code>dist/</code>, no desde <code>src/</code>.
        </div>

        <h2 id="despliegue">Despliegue</h2>
        <p>AstraJS genera una carpeta <code>dist/</code> lista para produccion que contiene:</p>
        <ul>
          <li><strong>HTML estatico</strong> — Paginas SSG/ISR pre-renderizadas.</li>
          <li><strong>Server handlers</strong> — Funciones server compiladas como endpoints HTTP.</li>
          <li><strong>Assets optimizados</strong> — JS con tree-shaking, CSS con content-hash, imports dinamicos.</li>
        </ul>

        <h3>Plataformas soportadas</h3>
        <table>
          <tr><th>Plataforma</th><th>SSR</th><th>SSG/ISR</th><th>server()</th></tr>
          <tr><td><strong>Node.js</strong></td><td>✅</td><td>✅</td><td>✅</td></tr>
          <tr><td><strong>Vercel</strong></td><td>✅</td><td>✅</td><td>✅ Serverless</td></tr>
          <tr><td><strong>Netlify</strong></td><td>✅</td><td>✅</td><td>✅ Functions</td></tr>
          <tr><td><strong>Cloudflare Workers</strong></td><td>✅</td><td>✅</td><td>✅ Workers</td></tr>
          <tr><td><strong>AWS Lambda</strong></td><td>✅</td><td>✅</td><td>✅ Lambda</td></tr>
          <tr><td><strong>Docker</strong></td><td>✅</td><td>✅</td><td>✅</td></tr>
        </table>

        <h3>Build para produccion</h3>
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
