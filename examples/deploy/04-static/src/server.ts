/**
 * 04 — Static Deploy (SSG)
 *
 * `server({ type: 'pre-build' })` runs at BUILD TIME and inlines the
 * result into the client bundle. No server process exists at runtime:
 * the `dist/` folder is pure static HTML + JS, uploadable to any CDN.
 *
 * In dev mode the function re-executes on every file change.
 * In production it executes once, during `astra build`.
 *
 * NOTE: each pre-build call must be self-contained — the compiler extracts
 * the function body and executes it in isolation, so it cannot reference
 * other module-scope bindings. After folding, `getProducts` becomes a
 * plain array constant (no async, no fetch).
 */
import { server } from '@astrajs/server';

// Executed at build time — the client receives the result as a JSON constant.
export const getProducts = server({ type: 'pre-build' }, async () => {
  return [
    { id: 'p1', name: 'Wireless Headphones', price: 299, stock: 45, category: 'Electronics' },
    { id: 'p2', name: 'Running Shoes', price: 179, stock: 120, category: 'Sports' },
    { id: 'p3', name: 'Smart Watch', price: 449, stock: 32, category: 'Electronics' },
    { id: 'p4', name: 'Matcha Tea', price: 34, stock: 200, category: 'Food' },
    { id: 'p5', name: 'Office Chair', price: 599, stock: 15, category: 'Furniture' },
    { id: 'p6', name: 'Mechanical Keyboard', price: 159, stock: 78, category: 'Electronics' },
  ];
});

/** Shape of a folded product row (the inlined constant). */
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}
