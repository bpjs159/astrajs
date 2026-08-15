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

export const DocsRouter = component(() => (
  <div class="docs-layout">
    <style>{s}</style>
    <DocSidebar />
    <main class="docs-main">
      <div class="docs-content">
        <h1>Router</h1>
        <p>{i18n.t('rt.hero.a')}<code>true</code>{i18n.t('rt.hero.b')}<code>false</code>{i18n.t('rt.hero.c')}</p>

        <h2 id="rutas">{i18n.t('sb.routes')}</h2>
        <p><code>route()</code> {i18n.t('rt.a1')}<code>window.location</code>{i18n.t('rt.a2')}<code>true</code>{i18n.t('rt.a3')}<code>store()</code>{i18n.t('rt.a4')}</p>
        <CodeBlock code={`import { route, fallbackRoute } from '@astrajs/router';

// routes.ts — an object with reactive getters
export const routes = {
  get home()      { return route('/', { exact: true }); },
  get products()  { return route('/products'); },
  get productId() { return route('/products/:id'); },
  get cart()      { return route('/cart'); },
  get fallback()  { return fallbackRoute(); },
};

// In your layout:
function App() {
  return (
    <main>
      {routes.home      && <HomePage />}
      {routes.products  && <ProductsPage />}
      {routes.productId && <ProductDetail id={params.id} />}
      {routes.cart      && <CartPage />}
      {routes.fallback  && <NotFound />}
    </main>
  );
}`} commentsKey="router.routes" />
        <p>{i18n.t('rt.g.a')}<code>navigate('/products')</code>{i18n.t('rt.g.b')}<code>window.history.pushState</code>{i18n.t('rt.g.c')}</p>

        <h3>{i18n.t('rt.patterns.title')}</h3>
        <CodeBlock code={`route('/')                  // exact match: only "/"
route('/products')          // prefix match: "/products", "/products/123"
route('/products/:id')      // parameter: "/products/42" → params.id = "42"
route('/blog/:slug')        // parameter: "/blog/hello-world" → params.slug
route('/users/:uid/posts/:pid') // multiple params`} commentsKey="router.patterns" />

        <h3>{i18n.t('rt.exact.title')}</h3>
        <CodeBlock code={`route('/', { exact: true })    // only "/"
route('/products')              // without exact → "/products", "/products/42"
route('/products/:id')          // "/products/42", "/products/42/reviews"
route('/products/:id', { exact: true })  // only "/products/42"`} commentsKey="router.exact" />

        <h2>params</h2>
        <p>{i18n.t('rt.p.a')}<code>:id</code>{i18n.t('rt.p.b')}<code>:slug</code>{i18n.t('rt.p.c')}<code>params</code>{i18n.t('rt.p.d')}</p>
        <CodeBlock code={`import { route, params } from '@astrajs/router';

// Ruta: /products/:id
export const routes = {
  get productDetail() { return route('/products/:id'); },
};

function ProductPage() {
  // params.id holds the :id segment value
  const productId = params.id; // string
  
  // Use it with server() to load data
  const product = await getProductById(productId);
  
  return <h1>Product: {product.name}</h1>;
}`} commentsKey="router.params" />

        <h2 id="navegacion">{i18n.t('sb.navigation')}</h2>
        <p>{i18n.t('rt.nav.a')}<code>&lt;Link&gt;</code>{i18n.t('rt.nav.b')}<code>navigate()</code>{i18n.t('rt.nav.c')}</p>

        <h3>{i18n.t('rt.link.title')}</h3>
        <CodeBlock code={`import { Link } from '@astrajs/router';

// Basic navigation
<Link href="/products">Products</Link>

// With classes and styles
<Link href="/cart" class="nav-link active">Cart</Link>

// With children (works like <a>)
<Link href="/dashboard">
  <span class="icon">📊</span>
  Dashboard
</Link>`} commentsKey="router.link" />

        <h3>{i18n.t('rt.navigate.title')}</h3>
        <CodeBlock code={`import { navigate } from '@astrajs/router';

// After an action
async function handleCreate() {
  await createProduct(data);
  navigate('/products'); // redirects to the list
}

// In event handlers
<button onclick={() => navigate('/cart')}>
  Go to cart
</button>

// With a hash for scrolling
<button onclick={() => navigate('/docs#instalacion')}>
  View installation
</button>`} commentsKey="router.navigate" />

        <h2 id="layouts">{i18n.t('sb.layouts')}</h2>
        <p><code>&lt;Outlet /&gt;</code> {i18n.t('rt.l.a')}</p>
        <CodeBlock code={`import { Outlet } from '@astrajs/router';

function DashboardLayout() {
  return (
    <div class="dashboard">
      <Sidebar />
      <main>
        <Outlet />
        {/* Child routes render here */}
        {/* The sidebar is NOT re-created on navigation */}
      </main>
    </div>
  );
}

// Child routes:
// /dashboard/overview  → OverviewPage in <Outlet />
// /dashboard/analytics → AnalyticsPage in <Outlet />
// /dashboard/settings  → SettingsPage in <Outlet />`} commentsKey="router.outlet" />

        <h2 id="view-transitions">View Transitions API</h2>
        <p>{i18n.t('rt.vt.p')}</p>
        <CodeBlock code={`// Activates automatically with navigate() and <Link>
// The browser does:
//   1. Captures a screenshot of the current page
//   2. Renders the new page
//   3. Cross-fades between the two

// Customization with CSS:
::view-transition-old(root) {
  animation: fade-out .3s ease;
}
::view-transition-new(root) {
  animation: fade-in .3s ease;
}`} commentsKey="router.viewtransitions" />

        <h2>onRouteChange</h2>
        <p>{i18n.t('rt.onroute.p')}</p>
        <CodeBlock code={`import { onRouteChange } from '@astrajs/router';

onRouteChange((path) => {
  // Analytics
  analytics.pageView(path);
  
  // Scroll to top on navigation
  window.scrollTo(0, 0);
  
  // Update the title
  document.title = \`AstraJS — \${path}\`;
});`} commentsKey="router.onroute" />
      </div>
    </main>
    <DocRightToc items={[
      { href: '/docs/router#rutas', k: 'sb.routes' },
      { href: '/docs/router#layouts', k: 'sb.layouts' },
      { href: '/docs/router#navegacion', k: 'sb.navigation' },
      { href: '/docs/router#view-transitions', label: 'View Transitions API' },
    ]} />
  </div>
));
