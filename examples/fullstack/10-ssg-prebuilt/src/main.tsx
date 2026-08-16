/**
 * Fullstack 10 — SSG Pre-Built · Component
 *
 * `server({ type: 'pre-build' })` executes the function at BUILD TIME
 * and INLINES the result into the client bundle. Zero KB of JS shipped
 * for the data query — the client receives a static JSON constant.
 */

import { component } from 'astrajs.dev/core';
import { server } from 'astrajs.dev/server';

// ─── Pre-Build Server Call ───────────────────────────────────────────────────
//
// `server({ type: 'pre-build' })` tells the compiler: "execute this
// function at build time and inline the result." The compiler extracts
// the function body, runs it in Node.js during the build, and replaces
// the entire `server(...)` expression with the JSON result.
//
// In dev mode, the function is executed at transform time on every
// file change. In production, it's executed once during SSG.
//
// The client receives this:
//   const getProducts = [{"id":"p1","name":"Wireless Headphones",...}];
// No fetch. No async. No runtime JS cost.

const getProducts = server({ type: 'pre-build' }, async () => {
  return [
    { id: 'p1', name: 'Wireless Headphones', price: 299, stock: 45, category: 'Electronics' },
    { id: 'p2', name: 'Running Shoes', price: 179, stock: 120, category: 'Sports' },
    { id: 'p3', name: 'Smart Watch', price: 449, stock: 32, category: 'Electronics' },
    { id: 'p4', name: 'Matcha Tea', price: 34, stock: 200, category: 'Food' },
    { id: 'p5', name: 'Office Chair', price: 599, stock: 15, category: 'Furniture' },
    { id: 'p6', name: 'Mechanical Keyboard', price: 159, stock: 78, category: 'Electronics' },
  ];
});

// ─── The pre-built data is available as a synchronous constant ───────────────
type Product = { id: string; name: string; price: number; stock: number; category: string };
const products = getProducts as unknown as Product[];

function totalValue(): number {
  return products.reduce((s, p) => s + p.price * p.stock, 0);
}

function totalStock(): number {
  return products.reduce((s, p) => s + p.stock, 0);
}

export const PreBuildDemo = component(() => (
  <div class="card">
    <div class="header">
      <h1>⚡ SSG Pre-Build</h1>
      <p>
        <code>server({'{ type: \'pre-build\' }'})</code>
        {' '}— executed at build time, result inlined in HTML
      </p>
    </div>
    <div class="body">
      <div class="stats">
        <div class="stat">
          <div class="statNum">{products.length}</div>
          <div class="statLbl">Products</div>
        </div>
        <div class="stat">
          <div class="statNum">{totalStock()}</div>
          <div class="statLbl">Total Stock</div>
        </div>
        <div class="stat">
          <div class="statNum">${totalValue().toLocaleString()}</div>
          <div class="statLbl">Inventory Value</div>
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>${p.price}</td>
              <td>{p.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div class="footer">
        <p>
          ✅ <strong>0 KB</strong> of JS shipped — result inlined at build time<br />
          ✅ <code>server({'{} type: \'pre-build\' {}'})</code> executes in Node during SSG<br />
          ✅ Client receives a static JSON constant — no fetch, no async
        </p>
        <div class="badges">
          <span class="badge badge-prebuilt">PRE-BUILD</span>
          <span class="badge badge-zero">ZERO JS</span>
        </div>
      </div>
    </div>
  </div>
));
