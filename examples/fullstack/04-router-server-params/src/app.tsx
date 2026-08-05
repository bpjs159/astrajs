/**
 * Fullstack 04 — Router + Server · App Entry
 */
import { RouterServerDemo } from './main.js';

const style = document.createElement('style');
style.textContent = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,-apple-system,sans-serif;background:#0f172a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:40px 20px}

.card{background:#1e293b;border:1px solid #334155;border-radius:20px;max-width:520px;width:100%;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.3),0 8px 32px rgba(0,0,0,.15)}
.header{padding:28px 32px 20px;border-bottom:1px solid #334155;background:linear-gradient(135deg,rgba(99,102,241,.06) 0%,transparent 60%)}
.header h1{font-size:1.3rem;font-weight:700;color:#f1f5f9;margin-bottom:5px;letter-spacing:-.01em}
.header p{font-size:.8rem;color:#64748b;line-height:1.5}
.header code{background:rgba(99,102,241,.15);color:#818cf8;padding:1px 7px;border-radius:4px;font-size:.78rem;font-weight:500}
.body{padding:24px 32px 28px}

.hint{color:#64748b;font-size:.84rem}
.error{color:#f87171;font-size:.84rem;font-weight:500}

.list{display:flex;flex-direction:column;gap:8px}
.row{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;background:#0f172a;border:1px solid #334155;border-radius:10px;text-decoration:none;transition:border-color .2s,background .2s}
.row:hover{border-color:#475569;background:#111827}
.rowName{color:#f1f5f9;font-weight:600;font-size:.88rem}
.rowPrice{color:#818cf8;font-weight:700;font-size:.9rem}

.detail h2{color:#f1f5f9;font-size:1.1rem;margin:14px 0 6px}
.back{padding:7px 14px;border:1px solid #334155;border-radius:8px;background:transparent;color:#94a3b8;font-size:.78rem;font-weight:500;cursor:pointer;transition:border-color .15s,color .15s}
.back:hover{border-color:#64748b;color:#cbd5e1}
`;
document.head.appendChild(style);
document.getElementById('app')!.appendChild(RouterServerDemo({}) as Node);
