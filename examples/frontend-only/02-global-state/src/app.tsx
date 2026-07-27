/**
 * 02 — Global State · App Entry
 *
 * Two separate components share the same store.
 * Mutations in LikesDislikes instantly update TotalBox — and vice versa.
 */
import { LikesDislikes } from './likes.js';
import { TotalBox } from './total.js';

const style = document.createElement('style');
style.textContent = `*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;min-height:100vh}.shell{max-width:720px;margin:0 auto;padding:40px 20px}h1{font-size:2rem;margin-bottom:4px;text-align:center}.subtitle{text-align:center;color:#64748b;margin-bottom:32px;font-size:.9rem}.footer{text-align:center;color:#64748b;font-size:.75rem;margin-top:24px}code{background:#334155;padding:2px 6px;border-radius:4px;color:#818cf8}`;
document.head.appendChild(style);

const app = document.getElementById('app')!;
app.innerHTML = `
  <div class="shell">
    <h1>Global State</h1>
    <p class="subtitle">Two components · One shared <code>store()</code></p>
    <div id="likes-container"></div>
    <div id="total-container"></div>
    <p class="footer">LikesDislikes.tsx ↔ TotalBox.tsx share <code>appStore</code></p>
  </div>
`;

document.getElementById('likes-container')!.appendChild(LikesDislikes({}));
document.getElementById('total-container')!.appendChild(TotalBox({}));
