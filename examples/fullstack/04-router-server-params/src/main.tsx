// 04 — Router + Server · Server data loading driven by route params
import { component, store, mounted } from '@bpjs159/core';
import { route, fallbackRoute, params, navigate, Link, onRouteChange } from '@bpjs159/router';
import { server } from '@bpjs159/server';

interface Product { id: string; name: string; price: number; stock: number; }

const CATALOG: Product[] = [
  { id: 'p1', name: 'Mechanical Keyboard', price: 129, stock: 14 },
  { id: 'p2', name: 'Ultrawide Monitor', price: 549, stock: 3 },
  { id: 'p3', name: 'Noise-Cancelling Headset', price: 199, stock: 0 },
];

// Each server() call is ONE function: fetch wrapper on the client, handler on the server.
const listProducts = server(async () => CATALOG);

const getProduct = server(async (id: string) => {
  const product = CATALOG.find(p => p.id === id);
  if (!product) throw new Error(`Product "${id}" not found`);
  return product;
});

const ProductList = component(() => {
  const list = store({ items: [] as Product[], loading: true });
  listProducts().then(items => { list.items = items; list.loading = false; });

  return (
    <div class="list">
      {list.loading && <p class="hint">Loading catalog from server...</p>}
      {list.items.map(p => (
        <Link href={`/products/${p.id}`} class="row">
          <span class="rowName">{p.name}</span>
          <span class="rowPrice">${p.price}</span>
        </Link>
      ))}
    </div>
  );
});

// Components run ONCE — so re-fetching on navigation can't rely on a
// one-shot swr() call. `effect()` is an internal primitive, not meant
// for app code, so we re-fetch via the public `onRouteChange()` listener.
const ProductDetail = component(() => {
  const detail = store({
    loading: true,
    error: undefined as string | undefined,
    product: undefined as Product | undefined,
  });

  function load(id: string): void {
    detail.loading = true;
    detail.error = undefined;
    getProduct(id)
      .then(p => { detail.product = p; detail.loading = false; })
      .catch(e => { detail.error = e instanceof Error ? e.message : 'Unknown error'; detail.loading = false; });
  }

  mounted(() => {
    load(params.id); // fresh — route() already matched before this body ran
    let active = true;
    onRouteChange(({ pathname }) => {
      if (!active) return;
      // Read the id straight from the URL — `params` only updates on the
      // next reactive render, which hasn't happened yet at this point.
      const match = /^\/products\/([^/]+)$/.exec(pathname);
      if (match) load(match[1]!);
    });
    return () => { active = false; };
  });

  return (
    <div class="detail">
      <button class="back" onClick={() => navigate('/products')}>← Back to catalog</button>
      {detail.loading && <p class="hint">Fetching product {params.id} from server...</p>}
      {detail.error && <p class="error">{detail.error}</p>}
      {detail.product && (
        <div>
          <h2>{detail.product.name}</h2>
          <p class="rowPrice">${detail.product.price}</p>
          <p class="hint">{detail.product.stock > 0 ? `${detail.product.stock} in stock` : 'Out of stock'}</p>
        </div>
      )}
    </div>
  );
});

export const RouterServerDemo = component(() => (
  <div class="card">
    <div class="header">
      <h1>Router + Server</h1>
      <p><code>route()</code> + <code>params</code> trigger a fresh <code>server()</code> call per navigation</p>
    </div>
    <div class="body">
      {route('/products', { exact: true }) && <ProductList />}
      {route('/products/:id') && <ProductDetail />}
      {fallbackRoute() && <p class="hint">Navigate to /products.</p>}
    </div>
  </div>
));
