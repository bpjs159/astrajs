import { component, dynamic } from '@astrajs/core';
import { DocSidebar } from '../../components/docs-sidebar.js';
import { DocRightToc } from '../../components/doc-right-toc.js';
import { i18n } from '../../i18n.js';
import { CodeBlock } from '../../components/code-block.js';

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

export const DocsServerData = component(() => (
  <div class="docs-layout">
    <style>{s}</style>
    <DocSidebar />
    <main class="docs-main">
      <div class="docs-content">
        <h1>Server &amp; Data</h1>
        <p>{i18n.t('sd.hero')}</p>

        <h2 id="server">server</h2>
        <p>{i18n.t('sd.a')}<strong>{i18n.t('sd.b')}</strong>{i18n.t('sd.c')}<code>fetch</code>{i18n.t('sd.d')}</p>

        <h3>{i18n.t('sd.basic.title')}</h3>
        <CodeBlock code={`import { server } from '@astrajs/server';

// Defines la funcion UNA VEZ
export const getUsers = server({
  tags: ['users'],
  maxAge: 300, // cache TTL en segundos
}, async (role?: string) => {
  const users = await db.user.findMany({
    where: role ? { role } : undefined,
  });
  return users;
});

// En el CLIENTE — se ve como una llamada async normal
const admins = await getUsers('admin');
// ↑ Esto es un fetch a /api/astra/getUsers?args=["admin"]
// Los tipos se infieren automaticamente — admins es User[]`} />

        <h3>{i18n.t('sd.compiler.title')}</h3>
        <ol>
          <li><strong>{i18n.t('lbl.client')}:</strong> {i18n.t('sd.ol1.a')}<code>fetch()</code>{i18n.t('sd.ol1.b')}<code>/api/astra/getUsers</code>{i18n.t('sd.ol1.c')}</li>
          <li><strong>{i18n.t('lbl.server')}:</strong> {i18n.t('sd.ol2')}</li>
          <li><strong>{i18n.t('lbl.types')}:</strong> {i18n.t('sd.ol3')}</li>
        </ol>

        <h3>{i18n.t('sd.config.title')}</h3>
        <CodeBlock code={`interface ServerConfig {
  // Tipo de ejecucion
  type?: 'pre-build' | 'dynamic';  // default: 'dynamic'
  
  // Cache
  tags?: string[];      // Etiquetas para invalidacion quirurgica
  maxAge?: number;      // TTL en segundos (0 = sin cache)
  
  // Sincronizacion en tiempo real
  autoSync?: boolean;           // Polling con ETags
  autoSyncInterval?: number;    // Intervalo en ms (default: 3000)
  
  // Transformacion
  transform?: (data: T) => U;   // Transforma datos antes de enviar al cliente
}`} />

        <h2 id="tipos-server">{i18n.t('sb.serverTypes')}</h2>
        <p>{i18n.t('sd.when.a')}<strong>{i18n.t('sd.when.b')}</strong>{i18n.t('sd.when.c')}</p>

        <h3>pre-build</h3>
        <p>{i18n.t('sd.pre.a')}<strong>{i18n.t('sd.pre.b')}</strong>{i18n.t('sd.pre.c')}</p>
        <CodeBlock code={`// Ideal para: menus, configuraciones, contenido estatico
const siteNav = server(
  { type: 'pre-build', tags: ['navigation'] },
  () => db.menu.findMany({ orderBy: { position: 'asc' } })
);

// En build time: db.menu.findMany() → resultado serializado en HTML
// En el cliente: siteNav() → datos ya disponibles, sin fetch
// Se re-genera en cada build o con ISR`} />

        <h3>dynamic</h3>
        <p>{i18n.t('sd.dyn.a')}<strong>{i18n.t('sd.dyn.b')}</strong>{i18n.t('sd.dyn.c')}</p>
        <CodeBlock code={`// Ideal para: sesiones, datos de usuario, busquedas
const userDashboard = server(
  { type: 'dynamic', maxAge: 60 },
  async (userId: string) => {
    const [stats, notifications] = await Promise.all([
      db.stats.forUser(userId),
      db.notifications.unread(userId),
    ]);
    return { stats, notifications };
  }
);`} />

        <h2 id="caching">{i18n.t('sb.caching')}</h2>
        <p>{i18n.t('sd.cache.a')}<strong>{i18n.t('sd.cache.b')}</strong>{i18n.t('sd.cache.c')}</p>

        <h3>{i18n.t('sd.cache.tags.title')}</h3>
        <CodeBlock code={`// Servicios con tags
const getProducts = server(
  { tags: ['products'], maxAge: 3600 },
  () => db.product.findMany()
);

const getProductById = server(
  { tags: ['products', 'product-detail'], maxAge: 600 },
  (id: string) => db.product.findUnique({ where: { id } })
);

const getCategories = server(
  { tags: ['categories'], maxAge: 86400 },
  () => db.category.findMany()
);`} />

        <h3>{i18n.t('sd.inv.title')}</h3>
        <CodeBlock code={`import { revalidate } from '@astrajs/server';

// Despues de crear un producto:
await db.product.create({ data: newProduct });

// Solo se revalidan las queries con estos tags
await revalidate(['products']);
// ↑ getProducts se revalida (tiene tag 'products')
// ↑ getProductById se revalida (tiene tag 'products')
// getCategories NO se revalida (no tiene 'products')

// Despues de actualizar una categoria:
await db.category.update({ where: { id }, data: update });
await revalidate(['categories']);
// ↑ Solo getCategories se revalida`} />

        <div class="note">
          <strong>{i18n.t('lbl.best')}:</strong> {i18n.t('sd.note.a')}<code>'products'</code>{i18n.t('sd.note.b')}<code>'users'</code>{i18n.t('sd.note.c')}<code>'product-detail'</code>{i18n.t('sd.note.d')}<code>'user-profile'</code>{i18n.t('sd.note.e')}
        </div>

        <h2 id="autosync">{i18n.t('sb.autosync')}</h2>
        <p>{i18n.t('sd.auto.a')}<code>autoSync</code>{i18n.t('sd.auto.b')}<strong>{i18n.t('sd.auto.c')}</strong>{i18n.t('sd.auto.d')}</p>

        <h3>{i18n.t('sd.auto.how')}</h3>
        <ol>
          <li>{i18n.t('sd.auto.ol1')}</li>
          <li>{i18n.t('sd.auto.ol2.a')}<code>If-None-Match</code>{i18n.t('sd.auto.ol2.b')}</li>
          <li>{i18n.t('sd.auto.ol3.a')}<code>304 Not Modified</code>{i18n.t('sd.auto.ol3.b')}</li>
          <li>{i18n.t('sd.auto.ol4')}</li>
          <li>{i18n.t('sd.auto.ol5')}</li>
        </ol>

        <CodeBlock code={`// Datos que se auto-sincronizan cada 3 segundos
const liveStats = server(
  { 
    autoSync: true, 
    autoSyncInterval: 3000,
    tags: ['live-stats']
  },
  () => db.dashboard.liveStats()
);

// En el componente:
<div>
  <h3>Real-time sales</h3>
  <p>\${liveStats.totalSales}</p>
  {/* ↑ Se actualiza solo cuando el servidor devuelve datos nuevos */}
  {/* Sin polling manual, sin useEffect, sin suscripciones */}
</div>`} />

        <h3>{i18n.t('sd.auto.vs')}</h3>
        <ul>
          <li><strong>autoSync</strong>: {i18n.t('sd.auto.vs1')}</li>
          <li><strong>revalidate</strong>: {i18n.t('sd.auto.vs2')}</li>
        </ul>

        <h2>{i18n.t('sd.mut.title')}</h2>
        <p>{i18n.t('sd.mut.a')}<code>server()</code>{i18n.t('sd.mut.b')}</p>
        <CodeBlock code={`const createProduct = server(
  { tags: ['products'] }, // tags a revalidar tras la mutacion
  async (data: CreateProductInput) => {
    const product = await db.product.create({ data });
    return product;
  }
);

// En el componente:
async function handleCreate(formData: CreateProductInput) {
  const newProduct = await createProduct(formData);
  // ↑ La mutacion se ejecuta en el servidor
  // ↑ Los tags ['products'] se revalidan automaticamente tras la mutacion
  // ↑ La UI se actualiza sin codigo adicional
}`} />
      </div>
    </main>
    <DocRightToc items={[
      { href: '/docs/server-data#server', label: 'server' },
      { href: '/docs/server-data#tipos-server', k: 'sb.serverTypes' },
      { href: '/docs/server-data#caching', k: 'sb.caching' },
      { href: '/docs/server-data#autosync', k: 'sb.autosync' },
    ]} />
  </div>
));
