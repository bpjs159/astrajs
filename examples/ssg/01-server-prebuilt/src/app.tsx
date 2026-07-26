/**
 * SSG 01 — Pre-Build Server$ · App Entry
 */
import { PreBuildDemo } from './main.js';
const s = document.createElement('style');
s.textContent = `*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh}.card{background:#1e293b;border:1px solid #334155;border-radius:16px;padding:40px;max-width:600px;text-align:center}h1{font-size:1.8rem;margin-bottom:8px}.subtitle{color:#64748b;margin-bottom:28px;font-size:.9rem}.data-table{width:100%;border-collapse:collapse;margin:20px 0}.data-table th{text-align:left;padding:10px 14px;color:#64748b;font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #334155}.data-table td{padding:10px 14px;border-bottom:1px solid #1e293b;font-size:.9rem}.data-table tr:hover td{background:#0f172a}.badge{padding:3px 10px;border-radius:20px;font-size:.7rem;font-weight:600}.badge-prebuilt{background:#10b981;color:#fff}.badge-zero{background:#6366f1;color:#fff}.stats{display:flex;gap:16px;justify-content:center;margin:24px 0}.stat{background:#0f172a;border-radius:10px;padding:16px 24px}.stat .num{font-size:1.5rem;font-weight:800;color:#818cf8}.stat .lbl{font-size:.7rem;color:#64748b;margin-top:2px}.highlight{color:#34d399;font-weight:600}`;
document.head.appendChild(s);
document.getElementById('app')!.appendChild(PreBuildDemo({}));
