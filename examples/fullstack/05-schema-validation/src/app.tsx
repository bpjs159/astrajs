/**
 * Fullstack 05 — Schema Validation · App Entry
 */
import { SchemaValidationDemo } from './main.js';

const style = document.createElement('style');
style.textContent = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,-apple-system,sans-serif;background:#0f172a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:40px 20px}

.card{background:#1e293b;border:1px solid #334155;border-radius:20px;max-width:480px;width:100%;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.3),0 8px 32px rgba(0,0,0,.15)}
.header{padding:28px 32px 20px;border-bottom:1px solid #334155;background:linear-gradient(135deg,rgba(99,102,241,.06) 0%,transparent 60%)}
.header h1{font-size:1.3rem;font-weight:700;color:#f1f5f9;margin-bottom:5px;letter-spacing:-.01em}
.header p{font-size:.8rem;color:#64748b;line-height:1.5}
.header code{background:rgba(99,102,241,.15);color:#818cf8;padding:1px 7px;border-radius:4px;font-size:.78rem;font-weight:500}
.body{padding:24px 32px 28px}

.field{margin-bottom:18px}
.field label{display:block;font-size:.8rem;font-weight:600;color:#94a3b8;margin-bottom:6px}
.field input{width:100%;padding:10px 14px;border:1px solid #334155;border-radius:10px;background:#0f172a;color:#f1f5f9;font-size:.88rem;font-family:inherit;outline:none;transition:border-color .2s,box-shadow .2s}
.field input:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.15)}

.error{color:#f87171;font-size:.76rem;margin-top:5px;font-weight:500}
.error.server{color:#f59e0b}
.success{color:#6ee7b7;font-size:.84rem;font-weight:500;margin-top:16px;text-align:center}

.btnSubmit{width:100%;padding:12px;border:none;border-radius:10px;font-size:.88rem;font-weight:600;cursor:pointer;background:#6366f1;color:#fff;transition:filter .15s;margin-top:8px}
.btnSubmit:hover{filter:brightness(1.12)}
.btnSubmit:disabled{opacity:.6;cursor:not-allowed;filter:none}
`;
document.head.appendChild(style);
document.getElementById('app')!.appendChild(SchemaValidationDemo({}) as Node);
