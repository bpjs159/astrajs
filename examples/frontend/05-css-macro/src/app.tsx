/**
 * 05 — CSS Macro · Native Dark Mode with CSS Custom Properties
 *
 * Demonstrates the `css\`...\`` tagged template macro with CSS custom
 * properties for light/dark theming. Uses `prefers-color-scheme` for
 * system mode — zero JavaScript needed for OS preference detection.
 *
 * This file handles DOM mounting and global styles.
 */
import { CSSDemo } from './main.js';
const style = document.createElement('style');
style.textContent = `*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh}h1{font-size:2rem;margin-bottom:8px;text-align:center}.subtitle{text-align:center;color:#64748b;margin-bottom:32px}.demo-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}.card{padding:32px;border-radius:16px;text-align:center;transition:background .3s,color .3s,box-shadow .3s;cursor:pointer;--bg:#fff;--text:#1e293b;--text-secondary:#64748b;--accent:#6366f1;--border:#e2e8f0;background:var(--bg);color:var(--text);border:1px solid var(--border)}.card[data-theme="dark"]{--bg:#1e293b;--text:#f1f5f9;--text-secondary:#94a3b8;--accent:#818cf8;--border:#334155}@media(prefers-color-scheme:dark){.card[data-theme="system"]{--bg:#1e293b;--text:#f1f5f9;--text-secondary:#94a3b8;--accent:#818cf8;--border:#334155}}.card:hover{box-shadow:0 4px 24px rgba(0,0,0,.12)}.card h2{font-size:1.4rem;margin-bottom:4px;color:var(--text)}.card .badge{display:inline-block;background:var(--accent);color:#fff;padding:4px 14px;border-radius:20px;font-size:.75rem;font-weight:600;margin-bottom:12px}.card p{font-size:.9rem;color:var(--text-secondary)}.card code{background:rgba(0,0,0,.08);padding:1px 6px;border-radius:4px;font-size:.85em}[data-theme="dark"] .card code,.card[data-theme="dark"] code{background:rgba(255,255,255,.08)}.code-block{background:#1e293b;border:1px solid #334155;border-radius:14px;padding:24px;overflow-x:auto;display:flex;align-items:center}.code-block pre{font-family:'JetBrains Mono','Fira Code',monospace;font-size:.82rem;color:#94a3b8;line-height:1.7;margin:0}.kw{color:#818cf8}.str{color:#34d399}.fn{color:#fbbf24}.prop{color:#f472b6}.comment{color:#64748b}`;
document.head.appendChild(style);
document.getElementById('app')!.appendChild(CSSDemo({}) as Node);
