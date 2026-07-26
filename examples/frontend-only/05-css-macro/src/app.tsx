/**
 * 05 — CSS Macro · App Entry
 */
import { CSSDemo } from './main.js';
const s = document.createElement('style');
s.textContent = `*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh}.container{max-width:700px;padding:40px}h1{font-size:2rem;margin-bottom:8px;text-align:center}.subtitle{text-align:center;color:#64748b;margin-bottom:32px}.demo-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}.box{padding:24px;border-radius:14px;text-align:center;transition:all .2s}.box-primary{background:linear-gradient(135deg,#6366f1,#8b5cf6)}.box-success{background:linear-gradient(135deg,#10b981,#34d399)}.box-warning{background:linear-gradient(135deg,#f59e0b,#fbbf24)}.box-danger{background:linear-gradient(135deg,#ef4444,#f87171)}.box h3{font-size:1.2rem;margin-bottom:8px;color:#fff}.box p{font-size:.85rem;color:rgba(255,255,255,.8)}.box:hover{transform:translateY(-4px);box-shadow:0 8px 24px rgba(0,0,0,.3)}.code-block{background:#1e293b;border:1px solid #334155;border-radius:12px;margin-top:32px;padding:20px;overflow-x:auto}.code-block pre{font-family:'JetBrains Mono','Fira Code',monospace;font-size:.85rem;color:#94a3b8;line-height:1.6}.kw{color:#818cf8}.str{color:#34d399}.fn{color:#fbbf24}.highlight{color:#f472b6}`;
document.head.appendChild(s);
document.getElementById('app')!.innerHTML = '<div class="container"><h1>CSS Macro</h1><p class="subtitle"><code>css`...`</code> extracts styles at build time — <strong>zero runtime cost</strong></p><div id="css-demo"></div></div>';
CSSDemo({});
