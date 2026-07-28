/**
 * 04 — Routing · Declarative Routing with @astrajs/router
 *
 * Demonstrates file-system–style routing with reactive guards:
 * `route(path)` returns a boolean, `params` is a reactive proxy,
 * and `navigate()` enables programmatic navigation. No router config
 * files — just function calls in JSX.
 *
 * This file handles DOM mounting and global styles.
 */
import { RouterDemo } from './main.js';

const root = document.getElementById('app')!;
// Guard against HMR double-mount
if (!root.hasChildNodes()) {
  const style = document.createElement('style');
  s.textContent = `*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;min-height:100vh}.shell{display:flex;min-height:100vh}nav{width:220px;background:#1e293b;padding:24px 16px;border-right:1px solid #334155;flex-shrink:0}nav h2{font-size:1.1rem;margin-bottom:20px;color:#818cf8}nav a{display:block;padding:10px 14px;border-radius:8px;color:#94a3b8;text-decoration:none;font-weight:500;margin-bottom:4px;transition:all .15s}nav a:hover{background:#334155;color:#e2e8f0}nav a.active{background:rgba(99,102,241,.2);color:#818cf8}main{flex:1;padding:40px;display:flex;align-items:flex-start;justify-content:center;isolation:isolate}.page{text-align:center;width:440px}.page .emoji{font-size:5rem;margin-bottom:16px}.page h1{font-size:2rem;margin-bottom:8px}.page p{color:#64748b;margin:0 auto 8px}.page .hint{font-size:.8rem;color:#475569}.page .badge{display:inline-block;background:#6366f1;color:#fff;padding:4px 12px;border-radius:20px;font-size:.75rem;font-weight:600;margin-top:12px}.page code{background:#1e293b;padding:2px 8px;border-radius:4px;font-size:.85rem;color:#818cf8}.product-grid{display:grid;grid-template-columns:200px 200px;gap:12px;margin-top:20px;text-align:left}.product-card{background:#1e293b;border:1px solid #334155;border-radius:10px;padding:14px 16px;height:72px;color:#94a3b8}.product-card strong{display:block;font-size:.9rem;margin-bottom:4px}.product-card .price{color:#818cf8;font-weight:600;margin-right:10px}.stock-ok{color:#34d399;font-size:.75rem}.stock-low{color:#f87171;font-size:.75rem}.feature-list{margin-top:20px;display:flex;flex-wrap:wrap;gap:10px;justify-content:center}.feature{background:#1e293b;border:1px solid #334155;border-radius:8px;padding:8px 16px;font-size:.85rem;color:#94a3b8}.btn-back{background:#334155;color:#e2e8f0;border:none;padding:8px 20px;border-radius:8px;cursor:pointer;font-size:.85rem;transition:background .15s}.btn-back:hover{background:#475569}`;
  document.head.appendChild(style);
  root.appendChild(RouterDemo({}) as Node);
}
