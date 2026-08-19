/**
 * astra-dash — entrada del cliente.
 *
 * El prerender sirve HTML estático para crawlers y visitas directas; el
 * bundle del cliente monta la app interactiva encima (SSG + CSR, como
 * astra-store). La isla de resumabilidad se inyecta con el mismo markup
 * que viaja en el HTML prerenderizado.
 */
import { App } from './app.js';

const appEl = document.getElementById('app')!;
appEl.innerHTML = '';

const nodes = App() as unknown as Node | Node[];
for (const n of Array.isArray(nodes) ? nodes : [nodes]) {
  appEl.appendChild(n);
}
