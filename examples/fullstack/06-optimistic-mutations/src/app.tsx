/**
 * Fullstack 06 — Optimistic Mutations · App Entry
 */
import { OptimisticDemo } from './main.js';

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

.errorSlot{min-height:51px}.error{color:#f87171;font-size:.8rem;font-weight:500;margin-bottom:14px;padding:10px 14px;background:rgba(248,113,113,.12);border:1px solid rgba(248,113,113,.22);border-radius:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

.list{display:flex;flex-direction:column;gap:8px}
.row{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;background:#0f172a;border:1px solid #334155;border-radius:10px}
.rowName{color:#f1f5f9;font-weight:600;font-size:.86rem}
.likeBtn{padding:7px 16px;border:1px solid #334155;border-radius:8px;background:transparent;color:#818cf8;font-weight:700;font-size:.84rem;cursor:pointer;transition:border-color .15s,background .15s,transform .1s}
.likeBtn:hover{border-color:#6366f1;background:rgba(99,102,241,.08)}
.likeBtn:active{transform:scale(.95)}
.likeBtn:disabled{opacity:.5;cursor:not-allowed;transform:none}
`;
document.head.appendChild(style);
document.getElementById('app')!.appendChild(OptimisticDemo({}) as Node);
