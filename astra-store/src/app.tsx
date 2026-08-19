/**
 * astra-store — app shell + router.
 *
 * The page block is a dynamic getter over `clientState.path` (and the
 * current locale) — navigation re-runs it and swaps the page in O(1).
 */
import { dynamic } from 'astrajs.dev/core';
import { clientState } from './client-state.js';
import { currentLocale, t } from './i18n.js';
import { Header, Footer } from './components/layout.js';
import { HomePage } from './pages/home.js';
import { CatalogPage } from './pages/catalog.js';
import { ProductPage } from './pages/product.js';
import { CartPage } from './pages/cart.js';
import { CheckoutPage } from './pages/checkout.js';
import { OrdersPage } from './pages/orders.js';
import { AboutPage } from './pages/about.js';

function NotFound(): JSX.Element {
  return (
    <section class="block">
      <h2>404</h2>
      <p class="notice bad">{t('common.notFound')}</p>
    </section>
  );
}

function pageForPath(path: string): JSX.Element {
  if (path === '/' || path === '') return HomePage();
  if (path === '/products' || path === '/products/') return CatalogPage('all');
  if (path.startsWith('/categories/')) {
    const slug = path.slice('/categories/'.length).split('/')[0]!;
    return slug ? CatalogPage(slug) : CatalogPage('all');
  }
  if (path.startsWith('/products/')) {
    const id = path.slice('/products/'.length).split('/')[0]!;
    return id ? ProductPage(id) : CatalogPage('all');
  }
  if (path === '/cart') return CartPage();
  if (path === '/checkout') return CheckoutPage();
  if (path === '/orders') return OrdersPage();
  if (path === '/about') return AboutPage();
  return NotFound();
}

export function App(): JSX.Element {
  return (
    <div>
      {Header()}
      <main class="site-main">
        {dynamic(() => {
          void currentLocale(); // locale changes re-render the page block
          return pageForPath(clientState.path);
        })}
      </main>
      {Footer()}
    </div>
  );
}
