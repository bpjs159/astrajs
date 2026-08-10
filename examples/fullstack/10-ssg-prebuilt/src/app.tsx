/**
 * Fullstack 10 — SSG Pre-Built · App Entry
 */
import { PreBuildDemo } from './main.js';

const style = document.createElement('style');
style.textContent = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,-apple-system,sans-serif;background:#0f172a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:40px 20px}

.card{background:#1e293b;border:1px solid #334155;border-radius:20px;max-width:680px;width:100%;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.3),0 8px 32px rgba(0,0,0,.15)}
.header{padding:28px 32px 20px;border-bottom:1px solid #334155;background:linear-gradient(135deg,rgba(16,185,129,.06) 0%,transparent 60%)}
.header h1{font-size:1.3rem;font-weight:700;color:#f1f5f9;margin-bottom:5px;letter-spacing:-.01em}
.header p{font-size:.8rem;color:#64748b;line-height:1.5}
.header code{background:rgba(16,185,129,.15);color:#34d399;padding:1px 7px;border-radius:4px;font-size:.78rem;font-weight:500}
.body{padding:24px 32px 28px}

.stats{display:flex;gap:16px;margin-bottom:24px}
.stat{flex:1;background:#0f172a;border:1px solid #334155;border-radius:12px;padding:18px 20px;text-align:center}
.statNum{font-size:1.5rem;font-weight:800;color:#818cf8}
.statLbl{font-size:.72rem;color:#64748b;margin-top:3px;text-transform:uppercase;letter-spacing:.04em}

.table{width:100%;border-collapse:collapse}
.table th{text-align:left;padding:10px 14px;color:#64748b;font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #334155}
.table td{padding:10px 14px;border-bottom:1px solid rgba(51,65,85,.5);font-size:.86rem;color:#e2e8f0}
.table tr:hover td{background:rgba(99,102,241,.04)}

.footer{margin-top:24px;padding:16px 20px;background:rgba(16,185,129,.06);border:1px solid rgba(16,185,129,.12);border-radius:12px;font-size:.78rem;color:#94a3b8;line-height:1.6}
.footer strong{color:#34d399}

.badges{display:flex;gap:8px;margin-top:12px}
.badge{padding:3px 12px;border-radius:20px;font-size:.68rem;font-weight:700;letter-spacing:.03em}
.badge-prebuilt{background:rgba(16,185,129,.15);color:#34d399}
.badge-zero{background:rgba(99,102,241,.15);color:#818cf8}
`;
document.head.appendChild(style);
document.getElementById('app')!.appendChild(PreBuildDemo({}) as Node);

