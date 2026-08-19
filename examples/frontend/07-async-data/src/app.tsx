/**
 * 07 — Async Data & SWR · App Entry
 */
import { AsyncDataDemo } from './main.js';

const style = document.createElement('style');
style.textContent = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,-apple-system,sans-serif;background:#0f172a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:40px 20px}

.card{background:#1e293b;border:1px solid #334155;border-radius:20px;padding:0;max-width:620px;width:100%;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.3),0 8px 32px rgba(0,0,0,.15)}
.header{padding:28px 32px 20px;border-bottom:1px solid #334155;background:linear-gradient(135deg,rgba(99,102,241,.06) 0%,transparent 60%)}
.header h1{font-size:1.3rem;font-weight:700;color:#f1f5f9;margin-bottom:5px;letter-spacing:-.01em}
.header p{font-size:.8rem;color:#64748b}
.header code{background:rgba(99,102,241,.15);color:#818cf8;padding:1px 7px;border-radius:4px;font-size:.78rem;font-weight:500}
.body{padding:24px 32px 28px}

.loadingBox{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 0;gap:14px;color:#64748b}
.spinner{width:40px;height:40px;border:3px solid #334155;border-top-color:#818cf8;border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.loadingBox p{font-size:.84rem;font-weight:500}

.staleBar{display:flex;align-items:center;gap:10px;padding:10px 14px;margin-bottom:14px;background:rgba(251,191,36,.12);border:1px solid rgba(251,191,36,.22);border-radius:10px;font-size:.76rem;font-weight:500;color:#fbbf24}
.spinnerSm{width:14px;height:14px;border:2px solid #fbbf24;border-top-color:transparent;border-radius:50%;animation:spin .6s linear infinite;flex-shrink:0}

.errorBox{text-align:center;padding:18px;background:rgba(248,113,113,.12);border:1px solid rgba(248,113,113,.22);border-radius:12px;margin-bottom:14px}
.errorBox p{color:#f87171;font-size:.84rem;font-weight:500;margin-bottom:12px}
.btnRetry{padding:7px 20px;border:none;border-radius:8px;font-size:.78rem;font-weight:600;cursor:pointer;background:#f87171;color:#fff;transition:filter .15s}
.btnRetry:hover{filter:brightness(1.15)}

.userList{display:flex;flex-direction:column;gap:8px;margin-bottom:18px}
.userCard{display:flex;align-items:center;gap:14px;padding:14px 16px;background:#0f172a;border:1px solid transparent;border-radius:12px;transition:border-color .2s,background .2s}
.userCard:hover{border-color:#334155;background:#111827}
.avatar{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:.82rem;font-weight:700;color:#fff;flex-shrink:0}
.av0{background:linear-gradient(135deg,#6366f1,#818cf8)}
.av1{background:linear-gradient(135deg,#8b5cf6,#a78bfa)}
.av2{background:linear-gradient(135deg,#ec4899,#f472b6)}
.av3{background:linear-gradient(135deg,#14b8a6,#2dd4bf)}
.userInfo{flex:1;min-width:0}
.userName{font-size:.86rem;font-weight:600;color:#f1f5f9}
.userEmail{font-size:.74rem;color:#64748b;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.userId{font-size:.68rem;color:#64748b;background:rgba(255,255,255,.04);padding:3px 9px;border-radius:6px;font-weight:600;font-family:'SF Mono','Fira Code',monospace}

.controls{display:flex;gap:8px;align-items:center}
.btnRefresh{padding:9px 18px;border:none;border-radius:10px;font-size:.78rem;font-weight:600;cursor:pointer;background:#818cf8;color:#fff;transition:filter .15s,transform .1s;display:flex;align-items:center;gap:6px}
.btnRefresh:hover{filter:brightness(1.1)}
.btnRefresh:active{transform:scale(.97)}
.btnRefresh:disabled{opacity:.4;cursor:not-allowed;filter:none;transform:none}
.btnClear{padding:9px 16px;border:1px solid #334155;border-radius:10px;font-size:.76rem;font-weight:500;cursor:pointer;background:transparent;color:#64748b;transition:border-color .15s,color .15s}
.btnClear:hover{border-color:#64748b;color:#cbd5e1}
`;
document.head.appendChild(style);
document.getElementById('app')!.appendChild(AsyncDataDemo({}) as Node);
