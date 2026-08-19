/**
 * Static SSR page renderer used ONLY by the build-time prerender
 * (scripts/prerender.mjs). Produces the same markup classes as the SPA
 * pages, but from plain in-memory data — no dynamic bindings, no RPC.
 */
import { HeaderStatic, FooterStatic } from './components/layout.js';
import { ProductCard } from './components/product-card.js';
import type { ProductCardData } from './components/product-card.js';
import { HomeView } from './pages/home.js';
import { CatalogView } from './pages/catalog.js';
import { ProductView } from './pages/product.js';
import { AboutView } from './pages/about.js';
import { PRODUCTS, findProduct } from './db.js';
import type { Product } from './db.js';
import { l10nProductName, l10nProductDesc, l10nCategory } from './catalog-i18n.js';

// In the SSR bundle pre-build calls stay as passthrough functions, so the
// static renderer reads featured products straight from the catalog data.
const featuredData = PRODUCTS.filter((p) => p.featured).map(localize) as ProductCardData[];
const catalogData = PRODUCTS.map(localize) as ProductCardData[];

/** Localized view of a product (prerender uses the default 'es' locale). */
function localize(p: Product): Product {
  return {
    ...p,
    name: l10nProductName(p.id, 'es', p.name),
    description: l10nProductDesc(p.id, 'es', p.description),
    category: l10nCategory(p.category, 'es'),
  };
}

function NotFound(): JSX.Element {
  return (
    <section class="block">
      <h2>404</h2>
      <p class="notice bad">Page not found.</p>
    </section>
  );
}

function renderPath(path: string): JSX.Element {
  if (path === '/' || path === '') {
    return HomeView(featuredData, catalogData.slice(0, 8));
  }
  if (path === '/products') {
    return CatalogView(catalogData);
  }
  if (path.startsWith('/categories/')) {
    const slug = path.slice('/categories/'.length).split('/')[0]!;
    const list = catalogData.filter((p) => PRODUCTS.find((b) => b.id === p.id)?.category === slug) as ProductCardData[];
    return CatalogView(list);
  }
  if (path.startsWith('/products/')) {
    const id = path.slice('/products/'.length).split('/')[0]!;
    const product = findProduct(id);
    return product ? ProductView(localize(product)) : NotFound();
  }
  if (path === '/about') return AboutView();
  return NotFound();
}

export function renderStaticPage(path: string): JSX.Element {
  return (
    <div>
      {HeaderStatic(0)}
      <main class="site-main">{renderPath(path)}</main>
      {FooterStatic()}
    </div>
  );
}
