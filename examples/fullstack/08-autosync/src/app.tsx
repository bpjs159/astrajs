/**
 * Fullstack 08 — AutoSync · App Entry
 */
import { AutoSyncDemo } from './main.js';

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

.stock{display:flex;align-items:baseline;gap:8px;margin-bottom:6px}
.stockValue{font-size:2.6rem;font-weight:800;color:#f1f5f9;letter-spacing:-.02em}
.stockLabel{font-size:.84rem;color:#64748b;font-weight:600}

.hint{font-size:.76rem;color:#64748b;line-height:1.5;margin-bottom:14px}

.buyBtn{width:100%;padding:12px;border:1px solid #334155;border-radius:10px;background:rgba(99,102,241,.1);color:#818cf8;font-weight:700;font-size:.86rem;cursor:pointer;transition:border-color .15s,background .15s,transform .1s;margin-bottom:6px}
.buyBtn:hover{border-color:#6366f1;background:rgba(99,102,241,.18)}
.buyBtn:active{transform:scale(.98)}

.log{display:flex;flex-direction:column;gap:6px;margin-top:14px}
.logRow{font-size:.74rem;color:#94a3b8;font-family:ui-monospace,monospace;padding:8px 12px;background:#0f172a;border:1px solid #334155;border-radius:8px}
`;
document.head.appendChild(style);
document.getElementById('app')!.appendChild(AutoSyncDemo({}) as Node);
