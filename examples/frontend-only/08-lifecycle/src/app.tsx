/**
 * 08 — Lifecycle · Bootstrap
 *
 * Just mounts the app. All logic is in main.tsx.
 */
import { LifecycleDemo } from './main.js';

// Global reset & component styles (minimal, inlined for the demo)
const s = document.createElement('style');
s.textContent = `*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh}.card{background:#1e293b;border:1px solid #334155;border-radius:16px;padding:36px;width:440px}h1{font-size:1.5rem;margin-bottom:4px}.subtitle{color:#64748b;font-size:.85rem;margin-bottom:24px}.timer{font-size:3rem;font-weight:700;color:#818cf8;text-align:center;font-variant-numeric:tabular-nums;margin-bottom:8px}.btn{display:inline-block;padding:10px 20px;border:none;border-radius:8px;font-size:.85rem;font-weight:600;cursor:pointer;margin:4px;transition:background .15s}.btn-toggle{background:#6366f1;color:#fff}.btn-toggle:hover{background:#4f46e5}.btn-reset{background:#334155;color:#94a3b8}.btn-reset:hover{background:#475569}.log{margin-top:20px;background:#0f172a;border-radius:10px;padding:16px;max-height:200px;overflow-y:auto;font-size:.8rem}.log div{padding:3px 0;color:#94a3b8;border-bottom:1px solid #1e293b}.log .tick{color:#818cf8;font-weight:600;border-bottom:1px solid #334155;margin-bottom:8px}`;
document.head.appendChild(s);

document.getElementById('app')!.appendChild(LifecycleDemo({}) as Node);
