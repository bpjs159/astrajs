/**
 * 04 — Static Deploy (SSG) · App
 *
 * Every value on this page was computed at BUILD TIME.
 * The shipped JS contains zero fetch() calls and zero async data code.
 */
import { component } from 'astrajs.dev/core';
import { getProducts, type Product } from './server.js';

const css = `
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:system-ui,-apple-system,sans-serif;background:#0f172a;color:#e2e8f0;padding:48px 20px}
  .wrap{max-width:720px;margin:0 auto}
  h1{font-size:1.4rem;font-weight:800;letter-spacing:-.02em;margin-bottom:6px}
  .sub{font-size:.84rem;color:#64748b;margin-bottom:28px}
  .sub code{background:rgba(16,185,129,.15);color:#34d399;padding:1px 7px;border-radius:4px}
  .stats{display:flex;gap:14px;margin-bottom:24px}
  .stat{flex:1;background:#1e293b;border:1px solid #334155;border-radius:14px;padding:18px;text-align:center}
  .num{font-size:1.5rem;font-weight:800;color:#818cf8}
  .lbl{font-size:.7rem;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-top:4px}
  table{width:100%;border-collapse:collapse;background:#1e293b;border:1px solid #334155;border-radius:14px;overflow:hidden}
  th{text-align:left;padding:12px 16px;font-size:.7rem;text-transform:uppercase;letter-spacing:.05em;color:#64748b;border-bottom:1px solid #334155;background:#162032}
  td{padding:12px 16px;border-bottom:1px solid rgba(51,65,85,.5);font-size:.86rem}
  tr:last-child td{border-bottom:none}
  .stock{font-size:.76rem;padding:2px 10px;border-radius:20px;font-weight:700}
  .ok{background:rgba(16,185,129,.15);color:#34d399}
  .low{background:rgba(245,158,11,.15);color:#f59e0b}
  .note{margin-top:24px;padding:16px 20px;background:rgba(16,185,129,.06);border:1px solid rgba(16,185,129,.12);border-radius:12px;font-size:.78rem;color:#94a3b8;line-height:1.7}
  .note strong{color:#34d399}
`;

export const StaticApp = component(() => {
  // `getProducts` is a folded JSON constant (no async, no fetch).
  const products = getProducts as unknown as Product[];
  const stats = {
    count: products.length,
    totalStock: products.reduce((sum, p) => sum + p.stock, 0),
    categories: new Set(products.map((p) => p.category)).size,
  };

  return (
    <div class="wrap">
      <style>{css}</style>
      <h1>Static Deploy — SSG</h1>
      <p class="sub">
        Every row below was folded into the bundle by <code>server({'{ type: \'pre-build\' }'})</code> — zero runtime data code.
      </p>

      <div class="stats">
        <div class="stat"><div class="num">{String(stats.count)}</div><div class="lbl">Products</div></div>
        <div class="stat"><div class="num">{String(stats.totalStock)}</div><div class="lbl">Total stock</div></div>
        <div class="stat"><div class="num">{String(stats.categories)}</div><div class="lbl">Categories</div></div>
      </div>

      <table>
        <tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th></tr>
        {products.map((p) => (
          <tr>
            <td>{p.name}</td>
            <td>{p.category}</td>
            <td>${String(p.price)}</td>
            <td><span class={p.stock < 40 ? 'stock low' : 'stock ok'}>{String(p.stock)}</span></td>
          </tr>
        ))}
      </table>

      <div class="note">
        <strong>Deploy:</strong> upload <code>dist/</code> to GitHub Pages, S3, Netlify or any CDN.
        The output is pure static files — no server, no runtime, no cold starts.
      </div>
    </div>
  );
});
