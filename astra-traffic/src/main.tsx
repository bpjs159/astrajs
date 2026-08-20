/**
 * astra-traffic — entrada del cliente.
 *
 * El prerender sirve HTML estático para visitas directas; el bundle del
 * cliente monta la app interactiva encima (SSG + CSR, como astra-dash).
 */
import { App } from './app.js';

const appEl = document.getElementById('app')!;
appEl.innerHTML = '';

const nodes = App() as unknown as Node | Node[];
for (const n of Array.isArray(nodes) ? nodes : [nodes]) {
  appEl.appendChild(n);
}
