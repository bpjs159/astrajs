/**
 * 02 — Global State · Shared Store Across Components
 *
 * Demonstrates that a single `store()` imported by multiple components
 * acts as shared reactive state. When any component mutates the store,
 * all components reading from it update automatically.
 *
 * This file handles DOM mounting and global styles.
 */
import { component } from '@astrajs/core';
import { LikesDislikes } from './likes.js';
import { TotalBox } from './total.js';

const style = document.createElement('style');
style.textContent = `*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;min-height:100vh}.shell{max-width:720px;margin:0 auto;padding:40px 20px}h1{font-size:2rem;margin-bottom:4px;text-align:center}.subtitle{text-align:center;color:#64748b;margin-bottom:32px;font-size:.9rem}.footer{text-align:center;color:#64748b;font-size:.75rem;margin-top:24px}code{background:#334155;padding:2px 6px;border-radius:4px;color:#818cf8}`;
document.head.appendChild(style);

const App = component(() => (
  <div class="shell">
    <h1>Global State</h1>
    <p class="subtitle">Two components · One shared <code>store()</code></p>
    <LikesDislikes />
    <TotalBox />
    <p class="footer">LikesDislikes.tsx ↔ TotalBox.tsx share <code>appStore</code></p>
  </div>
));

document.getElementById('app')!.appendChild(App({}) as Node);
