/**
 * 06 — Batch & Memo · Atomic Updates + Lazy Derived Values
 *
 * Demonstrates `batch()` for grouping multiple mutations into a single
 * reactive notification, and `memo()` for lazy derived values that
 * only recalculate when their tracked dependencies change.
 *
 * This file handles DOM mounting and global styles.
 */
import { BatchMemoDemo } from './main.js';
const style = document.createElement('style');
s.textContent = `*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh}.card{background:#1e293b;border:1px solid #334155;border-radius:16px;padding:36px;max-width:640px;width:100%}h1{font-size:1.6rem;margin-bottom:4px}.subtitle{color:#64748b;font-size:.85rem;margin-bottom:24px}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:20px}.panel{background:#0f172a;border-radius:12px;padding:20px}.panel h3{font-size:.95rem;margin-bottom:12px;display:flex;align-items:center;gap:8px}.panel .val{font-size:2rem;font-weight:800;color:#818cf8}.panel .desc{font-size:.75rem;color:#64748b;margin-top:4px}.btn{padding:8px 16px;border:none;border-radius:6px;font-size:.8rem;font-weight:600;cursor:pointer;margin:4px 2px;transition:all .15s}.btn-up{background:#6366f1;color:#fff}.btn-up:hover{background:#4f46e5}.btn-batch{background:#10b981;color:#fff}.btn-batch:hover{background:#059669}.log{font-family:monospace;font-size:.75rem;color:#94a3b8;margin-top:8px}.batch{color:#34d399}.single{color:#fbbf24}.highlight{color:#818cf8}`;
document.head.appendChild(style);
document.getElementById('app')!.appendChild(BatchMemoDemo({}));
