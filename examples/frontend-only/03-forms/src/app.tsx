/**
 * 03 — Forms · @bpjs159/form Controller
 *
 * Demonstrates reactive form metadata (errors, touched, isDirty, isValid)
 * powered by the browser's native Constraint Validation API — no custom
 * validation loops, no schema libraries. Data lives in a core store;
 * metadata is auto-managed by the form controller.
 *
 * This file handles DOM mounting and global styles.
 */
import { Form } from './main.js';
const style = document.createElement('style');
style.textContent = `*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh}.form-card{background:#1e293b;border:1px solid #334155;border-radius:16px;padding:36px;width:440px}h1{font-size:1.5rem;margin-bottom:4px}.subtitle{color:#64748b;font-size:.85rem;margin-bottom:24px}.field{margin-bottom:16px}label{display:block;font-size:.85rem;font-weight:600;color:#94a3b8;margin-bottom:6px}input,textarea,select{width:100%;padding:10px 14px;border:1px solid #475569;border-radius:8px;background:#0f172a;color:#e2e8f0;font-size:.9rem;font-family:inherit;transition:border-color .2s}input:focus,textarea:focus,select:focus{outline:none;border-color:#6366f1}input[data-astra-touched]:invalid:not(:focus){border-color:#ef4444!important;box-shadow:0 0 0 1px rgba(239,68,68,.3)}.error-summary{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);border-radius:10px;padding:14px 18px;margin-bottom:20px}.error-summary strong{color:#fca5a5;font-size:.8rem;display:block;margin-bottom:8px}.error-summary ul{list-style:disc;padding-left:20px;margin:0}.error-summary li{color:#f87171;font-size:.78rem;padding:2px 0}.error-summary li code{background:rgba(239,68,68,.15);padding:1px 6px;border-radius:4px;font-size:.72rem;color:#fca5a5}.btn-submit{width:100%;padding:12px;background:#6366f1;color:#fff;border:none;border-radius:10px;font-size:1rem;font-weight:600;cursor:pointer;margin-top:4px;transition:background .2s}.btn-submit:hover{background:#4f46e5}.btn-submit:disabled{opacity:.5;cursor:not-allowed}.success{text-align:center;color:#34d399;font-weight:600;margin-top:12px}.badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:.65rem;font-weight:700;margin-left:6px}.badge-async{background:rgba(99,102,241,.2);color:#818cf8}.badge-cross{background:rgba(16,185,129,.2);color:#34d399}.badge-builtin{background:rgba(245,158,11,.15);color:#fbbf24}.badge-auto{background:rgba(236,72,153,.15);color:#f472b6}.live-preview{background:#0f172a;border-radius:10px;padding:16px;margin-top:20px}.live-preview h3{font-size:.8rem;color:#64748b;margin-bottom:8px;text-transform:uppercase;letter-spacing:.05em}.preview-item{display:flex;justify-content:space-between;padding:4px 0;font-size:.85rem}.preview-item span:first-child{color:#64748b}`;
document.head.appendChild(style);
document.getElementById('app')!.appendChild(Form({}) as Node);

