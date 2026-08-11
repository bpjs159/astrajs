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

export const DocsServerData = component(() => (
  <div class="docs-layout">
    <style>{s}</style>
    <DocSidebar />
    <main class="docs-main">
      <div class="docs-content">
        <h1>Server & Data</h1>
        <p>Comunicacion tipada entre cliente y servidor sin friccion. Una funcion, dos contextos: el compilador se encarga de todo.</p>

        <h2>server</h2>
        <p>El corazon del data fetching en AstraJS. Escribe <strong>una funcion</strong> — el compilador la divide automaticamente en un stub para el cliente (RPC via <code>fetch</code>) y un handler para el servidor. Los tipos de TypeScript se comparten extremo a extremo sin codegen.</p>

        <h3>Funcionamiento basico</h3>
        <pre><code>{`import { server } from '@astrajs/server';

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
// Los tipos se infieren automaticamente — admins es User[]`}</code></pre>

        <h3>Que hace el compilador</h3>
        <ol>
          <li><strong>Cliente:</strong> Genera un wrapper que serializa los argumentos y hace <code>fetch()</code> al endpoint <code>/api/astra/getUsers</code>.</li>
          <li><strong>Servidor:</strong> Registra el handler original en el middleware de Vite (dev) o como serverless function (produccion).</li>
          <li><strong>Tipos:</strong> El tipo de retorno de la funcion se propaga automaticamente al cliente. Sin duplicacion, sin codegen.</li>
        </ol>

        <h3>Opciones de configuracion</h3>
        <pre><code>{`interface ServerConfig {
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
}`}</code></pre>

        <h2>Tipos pre-build vs dynamic</h2>
        <p>Controla <strong>cuando</strong> se ejecuta tu funcion server:</p>

        <h3>pre-build</h3>
        <p>La funcion se ejecuta <strong>en tiempo de build</strong>. El resultado se serializa e incrusta directamente en el HTML generado. La pagina se sirve con los datos ya incluidos — cero llamadas de red, cero loading states.</p>
        <pre><code>{`// Ideal para: menus, configuraciones, contenido estatico
const siteNav = server(
  { type: 'pre-build', tags: ['navigation'] },
  () => db.menu.findMany({ orderBy: { position: 'asc' } })
);

// En build time: db.menu.findMany() → resultado serializado en HTML
// En el cliente: siteNav() → datos ya disponibles, sin fetch
// Se re-genera en cada build o con ISR`}</code></pre>

        <h3>dynamic</h3>
        <p>La funcion se ejecuta <strong>en cada request</strong> del cliente. Ideal para datos personalizados, sesiones de usuario, o datos que cambian frecuentemente.</p>
        <pre><code>{`// Ideal para: sesiones, datos de usuario, busquedas
const userDashboard = server(
  { type: 'dynamic', maxAge: 60 },
  async (userId: string) => {
    const [stats, notifications] = await Promise.all([
      db.stats.forUser(userId),
      db.notifications.unread(userId),
    ]);
    return { stats, notifications };
  }
);`}</code></pre>

        <h2>Revalidate & Caching</h2>
        <p>AstraJS ofrece un sistema de cache con <strong>invalidacion quirurgica por etiquetas</strong>. Cuando mutas datos, solo las queries con las etiquetas afectadas se revalidan — nada de "invalidar todo".</p>

        <h3>Cache con tags</h3>
        <pre><code>{`// Servicios con tags
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
);`}</code></pre>

        <h3>Invalidacion quirurgica</h3>
        <pre><code>{`import { revalidate } from '@astrajs/server';

// Despues de crear un producto:
await db.product.create({ data: newProduct });

// Solo se revalidan las queries con estos tags
await revalidate(['products']);
// ↑ getProducts se revalida (tiene tag 'products')
// ↑ getProductById se revalida (tiene tag 'products')
// ✗ getCategories NO se revalida (no tiene 'products')

// Despues de actualizar una categoria:
await db.category.update({ where: { id }, data: update });
await revalidate(['categories']);
// ↑ Solo getCategories se revalida`}</code></pre>

        <div class="note">
          <strong>Mejor practica:</strong> Usa tags semanticos y granulares. Agrupa por entidad (<code>'products'</code>, <code>'users'</code>) y por contexto (<code>'product-detail'</code>, <code>'user-profile'</code>). Esto maximiza el cache hit rate y minimiza las revalidaciones innecesarias.
        </div>

        <h2>autoSync y ETAGS</h2>
        <p>Para datos que necesitan estar actualizados en tiempo real, <code>autoSync</code> mantiene el cliente sincronizado con el servidor mediante <strong>ETags</strong>. No es WebSocket, no es Server-Sent Events — es HTTP puro con polling inteligente.</p>

        <h3>Como funciona</h3>
        <ol>
          <li>El cliente hace un fetch inicial y recibe los datos + un ETag.</li>
          <li>En cada intervalo, el cliente envia el ETag en un header <code>If-None-Match</code>.</li>
          <li>Si los datos no cambiaron, el servidor responde <code>304 Not Modified</code> — sin cuerpo, sin transferencia de datos.</li>
          <li>Si los datos cambiaron, el servidor responde con los nuevos datos + un nuevo ETag.</li>
          <li>El DOM se actualiza automaticamente — sin codigo manual, sin suscripciones.</li>
        </ol>

        <pre><code>{`// Datos que se auto-sincronizan cada 3 segundos
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
  <h3>Ventas en tiempo real</h3>
  <p>${liveStats.totalSales}</p>
  {/* ↑ Se actualiza solo cuando el servidor devuelve datos nuevos */}
  {/* Sin polling manual, sin useEffect, sin suscripciones */}
</div>`}</code></pre>

        <h3>Cuanto usar autoSync vs revalidate</h3>
        <ul>
          <li><strong>autoSync</strong>: Datos que cambian frecuentemente y necesitas ver en tiempo real (dashboards, precios de mercado, notificaciones).</li>
          <li><strong>revalidate</strong>: Datos que cambian por acciones del usuario y necesitas refrescar despues de una mutacion (listas tras crear/editar/eliminar).</li>
        </ul>

        <h2>Mutaciones (server actions)</h2>
        <p>Asi como <code>server()</code> maneja lecturas, puedes usar el mismo patron para mutaciones. La unica diferencia es que las mutaciones tipicamente no tienen cache:</p>
        <pre><code>{`const createProduct = server(
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
}`}</code></pre>
      </div>
    </main>
  </div>
));
