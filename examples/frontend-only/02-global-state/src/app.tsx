/**
 * 02 — Global State · App Entry
 */
import { LikesDislikes } from './main.js';

const style = document.createElement('style');
style.textContent = *{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;min-height:100vh}.shell{max-width:720px;margin:0 auto;padding:40px 20px}h1{font-size:2rem;margin-bottom:4px;text-align:center}.subtitle{text-align:center;color:#64748b;margin-bottom:32px;font-size:.9rem}.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}.card{background:#1e293b;border:1px solid #334155;border-radius:14px;padding:24px}.card h3{font-size:1rem;color:#94a3b8;margin-bottom:12px}.value{font-size:2.5rem;font-weight:800;color:#818cf8}button{padding:8px 18px;border:none;border-radius:8px;font-weight:600;font-size:.85rem;cursor:pointer;transition:all .15s;margin:4px}.btn-up{background:#6366f1;color:#fff}.btn-up:hover{background:#4f46e5}.btn-down{background:#ef4444;color:#fff}.btn-down:hover{background:#dc2626}.total-box{grid-column:1/-1;text-align:center;padding:32px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:14px}.total-box .value{color:#fff;font-size:3.5rem}.total-box h3{color:rgba(255,255,255,.7)};
document.head.appendChild(style);
document.getElementById('app')!.innerHTML = '<div class="shell"><h1>Global State</h1><p class="subtitle">One store — shared by all components</p><div class="grid" id="grid"></div></div>';
LikesDislikes({});
