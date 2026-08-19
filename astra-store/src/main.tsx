/**
 * astra-store — client entry (SPA mount + client-side router).
 *
 * The SSR prerender ships static HTML for crawlers/direct visits; the
 * client bundle mounts the interactive app on top (classic SSG+CSR).
 */
import { App } from './app.js';
import { clientState } from './client-state.js';
import { getCart } from './server/store.server.js';

const appEl = document.getElementById('app')!;
appEl.innerHTML = '';

const nodes = App() as unknown as Node | Node[];
for (const n of Array.isArray(nodes) ? nodes : [nodes]) {
  appEl.appendChild(n);
}

// Client-side navigation: keep the reactive route in sync with the URL.
window.addEventListener('popstate', () => {
  clientState.path = window.location.pathname;
});

// Live cart badge — poll the server cart every 5s.
async function pollCart(): Promise<void> {
  try {
    const r = await getCart(clientState.cartId);
    clientState.cartCount = r.count;
    clientState.cartTotal = r.total;
  } catch {
    /* server unreachable — keep last known badge */
  }
}
void pollCart();
window.setInterval(() => void pollCart(), 5000);
