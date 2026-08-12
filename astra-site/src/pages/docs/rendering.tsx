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
  .docs-content table{width:100%;border-collapse:collapse;margin-bottom:24px;font-size:.84rem}
  .docs-content th{text-align:left;padding:10px 14px;background:rgba(255,255,255,.03);color:#e2e8f0;font-weight:700;border-bottom:2px solid rgba(255,255,255,.06)}
  .docs-content td{padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.04);color:#94a3b8}
`;

export const DocsRendering = component(() => (
  <div class="docs-layout">
    <style>{s}</style>
    <DocSidebar />
    <main class="docs-main">
      <div class="docs-content">
        <h1>Renderizado</h1>
        <p>AstraJS soporta cuatro estrategias de renderizado que puedes combinar en una misma aplicacion, pagina por pagina. Sin configuracion adicional, sin plugins extra.</p>

        <h2 id="ssr">SSR (Server-Side Rendering)</h2>
        <p>El servidor renderiza el HTML en cada request. El cliente recibe la pagina completamente formada — SEO-friendly, fast First Contentful Paint, excelente para contenido dinamico.</p>

        <h3>Como funciona</h3>
        <ol>
          <li>El usuario solicita <code>/products</code>.</li>
          <li>El servidor ejecuta los componentes AstraJS y genera el HTML completo.</li>
          <li>Las funciones <code>server()</code> de tipo dynamic se ejecutan en cada request.</li>
          <li>El HTML se envia al navegador con los datos ya incluidos.</li>
          <li>El cliente "resume" el estado — sin re-ejecutar componentes, sin re-fetching de datos.</li>
        </ol>

        <pre><code>{`// SSR se activa por defecto en el servidor
// No necesitas configuracion especial

export default function ProductPage() {
  const product = await getProduct(params.id); // server()
  return (
    <article>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <span>${product.price}</span>
    </article>
  );
}`}</code></pre>

        <h2 id="ssg">SSG (Static Site Generation)</h2>
        <p>Las paginas se generan como HTML estatico <strong>en tiempo de build</strong>. Ideales para blogs, documentacion, landing pages — contenido que no cambia entre deploys. El resultado es HTML puro con <strong>0 KB de JavaScript</strong>.</p>

        <pre><code>{`// Las paginas SSG usan server({ type: 'pre-build' })
// El resultado se incrusta en el HTML durante el build

const posts = server(
  { type: 'pre-build', tags: ['blog-posts'] },
  () => db.post.findMany({ where: { published: true } })
);

// En build time: db.post.findMany() se ejecuta
// El HTML generado incluye los posts serializados
// En produccion: se sirve HTML estatico, sin consultas a BD`}</code></pre>

        <h2 id="isr">ISR (Incremental Static Regeneration)</h2>
        <p>Combina la velocidad del SSG con la frescura del SSR. Las paginas se generan estaticamente, pero se <strong>re-generan en el servidor</strong> cuando expira el TTL o cuando se invalidan sus tags. La primera persona que visita tras la expiracion recibe la pagina stale (rapida), y dispara una re-generacion en background. El siguiente visitante ya recibe la pagina actualizada.</p>

        <pre><code>{`// ISR: maxAge controla cada cuanto se re-genera
const featuredProducts = server(
  { 
    type: 'pre-build',   // generado en build
    tags: ['featured'],   // invalidable
    maxAge: 3600,         // re-generar cada hora (ISR)
  },
  () => db.product.findMany({ where: { featured: true } })
);

// Flujo ISR:
// t=0: Build → HTML con datos incluidos
// t=30min: Usuario visita → recibe HTML cacheado (rapido)
// t=61min: Cache expiro → se sirve stale + re-generacion en bg
// t=62min: Siguiente visita → HTML fresco con nuevos datos`}</code></pre>

        <h2>Comparativa de estrategias</h2>
        <table>
          <tr><th>Estrategia</th><th>Render</th><th>JS en cliente</th><th>Ideal para</th><th>Frescura datos</th></tr>
          <tr><td><strong>SSR</strong></td><td>Por request</td><td>Minimo (JIT)</td><td>Dashboards, datos de usuario</td><td>Tiempo real</td></tr>
          <tr><td><strong>SSG</strong></td><td>En build</td><td>0 KB</td><td>Blogs, docs, landing pages</td><td>Solo en deploy</td></tr>
          <tr><td><strong>ISR</strong></td><td>Build + re-gen</td><td>0 KB (stale) / Minimo</td><td>E-commerce, catalogos</td><td>TTL configurable</td></tr>
          <tr><td><strong>SPA</strong></td><td>Cliente</td><td>Mayor</td><td>Apps interactivas</td><td>Por request</td></tr>
        </table>

        <h2 id="resumibilidad">Resumibilidad</h2>
        <p>La resumibilidad es la alternativa de AstraJS a la hidratacion tradicional. En lugar de re-ejecutar todos los componentes en el cliente para "hidratar" el HTML del servidor, AstraJS serializa el estado minimo necesario en el HTML y <strong>reanuda</strong> la aplicacion exactamente donde el servidor la dejo.</p>

        <h3>Hidratacion tradicional vs Resumibilidad</h3>
        <ul>
          <li><strong>Hidratacion:</strong> El cliente descarga todo el JS, re-ejecuta cada componente, compara el VDOM con el HTML, y reconcilia diferencias. Costoso en CPU y tiempo.</li>
          <li><strong>Resumibilidad:</strong> El HTML incluye referencias a los stores y handlers. El cliente carga JS solo cuando interactuas. No hay re-ejecucion de componentes. El estado ya esta en el HTML.</li>
        </ul>

        <pre><code>{`// El HTML generado por el servidor incluye:
//   <div id="app">
//     <span data-astra-store="counter" data-astra-value="42">
//       Contador: 42
//     </span>
//     <button data-astra-handler="increment">
//       +
//     </button>
//   </div>

// Cuando el cliente "resume":
//   1. Lee data-astra-store → inicializa el store con valor 42
//   2. Lee data-astra-handler → sabe que hay un onclick pendiente
//   3. No ejecuta componentes, no hace diffing
//   4. El JS del handler se carga solo cuando haces clic en "+"`}</code></pre>
      </div>
    </main>
  </div>
));
