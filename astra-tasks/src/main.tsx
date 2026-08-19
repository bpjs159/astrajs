/**
 * astra-tasks — entrada del cliente.
 * El prerender sirve HTML estático; el bundle monta la app interactiva encima.
 */
import { App } from './app.js';

const appEl = document.getElementById('app')!;
appEl.innerHTML = '';

const nodes = App() as unknown as Node | Node[];
for (const n of Array.isArray(nodes) ? nodes : [nodes]) {
  appEl.appendChild(n);
}
