/**
 * 06 — Pre-Build server$
 *
 * `server$({ type: 'pre-build' })` executes the function at BUILD TIME.
 * The result is INLINED into the HTML — 0 KB of JS shipped for that query.
 *
 * This demo simulates what pre-built data looks like after SSG compilation.
 */

import { store, mounted } from '@astrajs/core';

// ─── Simulated Pre-Build Data ────────────────────────────────────────────────
// In production, this would be:
//   const getProducts = server$({ type:'pre-build', tags:['products'] },
//     async () => db.products.findMany()
//   );
// At build time, the function is EXECUTED and the result is INLINED.
// The client receives this as a static JSON constant — NO fetch, NO JS.

const PREBUILT_PRODUCTS = [
  { id:'p1', name:'Wireless Headphones', price:299, stock:45, category:'Electronics' },
  { id:'p2', name:'Running Shoes', price:179, stock:120, category:'Sports' },
  { id:'p3', name:'Smart Watch', price:449, stock:32, category:'Electronics' },
  { id:'p4', name:'Matcha Tea', price:34, stock:200, category:'Food' },
  { id:'p5', name:'Office Chair', price:599, stock:15, category:'Furniture' },
  { id:'p6', name:'Mechanical Keyboard', price:159, stock:78, category:'Electronics' },
];

const products = store({ items: PREBUILT_PRODUCTS });

// ─── Computed stats ─────────────────────────────────────────────────────────
function totalValue(): number {
  return products.items.reduce((s, p) => s + p.price * p.stock, 0);
}
function totalStock(): number {
  return products.items.reduce((s, p) => s + p.stock, 0);
}

// ─── Mount ───────────────────────────────────────────────────────────────────
const app = document.getElementById('app')!;

function render(): void {
  app.innerHTML = `
    <div class="card">
      <h1>⚡ Pre-Build server$</h1>
      <p class="subtitle">
        <code style="background:#334155;padding:2px 6px;border-radius:4px;">server$({ type: 'pre-build' })</code>
        — executed at build time, result inlined in HTML
      </p>

      <div class="stats">
        <div class="stat">
          <div class="num">${products.items.length}</div>
          <div class="lbl">Products</div>
        </div>
        <div class="stat">
          <div class="num">${totalStock()}</div>
          <div class="lbl">Total Stock</div>
        </div>
        <div class="stat">
          <div class="num">$${totalValue().toLocaleString()}</div>
          <div class="lbl">Inventory Value</div>
        </div>
      </div>

      <table class="data-table">
        <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th></tr></thead>
        <tbody>
          ${products.items.map((p) => `
            <tr>
              <td>${p.name}</td>
              <td>${p.category}</td>
              <td>$${p.price}</td>
              <td>${p.stock}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <p style="margin-top:20px;font-size:.8rem;color:#64748b;">
        ✅ <span class="highlight">0 KB</span> of JavaScript shipped for this data<br>
        ✅ Data embedded as <code>astra-data</code> in HTML<br>
        ✅ Resumed on client via <code>deserializeState()</code>
      </p>
      <span class="badge badge-prebuilt">PRE-BUILD</span>
      <span class="badge badge-zero">ZERO JS</span>
    </div>
  `;
}

render();
(window as any).products = products;
