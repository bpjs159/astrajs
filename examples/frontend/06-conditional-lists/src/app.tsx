/**
 * 06 — Conditional & Lists · App Entry
 */
import { ConditionalListsDemo } from './main.js';

const style = document.createElement('style');
style.textContent = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,-apple-system,sans-serif;background:#0f172a;color:#e2e8f0;display:flex;align-items:flex-start;justify-content:center;min-height:100vh;padding:40px 20px}

/* ── Card Shell ──────────────────────────────────── */
.card{background:#1e293b;border:1px solid #334155;border-radius:20px;padding:0;max-width:640px;width:100%;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.3),0 8px 32px rgba(0,0,0,.15)}
.header{padding:28px 32px 20px;border-bottom:1px solid #334155;background:linear-gradient(135deg,rgba(99,102,241,.06) 0%,rgba(16,185,129,.03) 60%,transparent 100%)}
.header h1{font-size:1.35rem;font-weight:700;color:#f1f5f9;margin-bottom:5px;letter-spacing:-.01em}
.header p{font-size:.8rem;color:#64748b}
.header code{background:rgba(99,102,241,.15);color:#818cf8;padding:1px 7px;border-radius:4px;font-size:.76rem;font-weight:500}
.header p code{margin:0 2px}
.body{padding:28px 32px 32px}

/* ── Section Labels ──────────────────────────────── */
.sectionLabel{display:flex;align-items:center;gap:12px;margin-top:36px;margin-bottom:12px}
.sectionLabel:first-child{margin-top:0}
.sectionIcon{width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:rgba(99,102,241,.12);border-radius:8px;font-size:.95rem;flex-shrink:0}
.sectionTitle{font-size:.88rem;font-weight:700;color:#e2e8f0;display:block}
.sectionCode{display:inline-block;margin-top:2px;background:rgba(99,102,241,.1);color:#a5b4fc;padding:1px 8px;border-radius:4px;font-size:.72rem;font-weight:500;font-family:'SF Mono','Fira Code',monospace;letter-spacing:.02em}

/* ── Section Box ─────────────────────────────────── */
.sectionBox{background:#0f172a;border:1px solid #1e293b;border-radius:14px;padding:22px;margin-bottom:14px}
.desc{font-size:.82rem;color:#94a3b8;line-height:1.6;margin-bottom:16px}
.desc strong{color:#cbd5e1}
.desc code{background:rgba(255,255,255,.06);color:#94a3b8;padding:1px 6px;border-radius:3px;font-size:.76rem}

/* ── Conditional Demo ────────────────────────────── */
.condDemo{display:flex;align-items:center;gap:14px;margin-bottom:14px;flex-wrap:wrap}
.condHint{font-size:.74rem;color:#64748b}
.detailsBox{background:#0a0f1a;border:1px solid rgba(99,102,241,.15);border-radius:10px;padding:16px;margin-bottom:14px;animation:fadeSlideIn .3s ease}
@keyframes fadeSlideIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
.detailItem{display:flex;align-items:flex-start;gap:10px;padding:6px 0;font-size:.8rem;color:#cbd5e1}
.detailItem:first-child{padding-top:0}
.detailItem:last-child{padding-bottom:0}
.detailItem+.detailItem{border-top:1px solid rgba(255,255,255,.04)}
.detailCheck{color:#34d399;font-weight:700;flex-shrink:0;margin-top:1px}
.detailItem strong{color:#e2e8f0}
.detailItem code{background:rgba(99,102,241,.15);color:#a5b4fc;padding:1px 6px;border-radius:3px;font-size:.73rem}
.codeSnippet{padding:12px 16px;background:#0a0f1a;border:1px solid #1e293b;border-radius:8px;font-family:'SF Mono','Fira Code',monospace;font-size:.76rem;color:#94a3b8;overflow-x:auto}
.codeSnippet .kw{color:#64748b}
.codeSnippet .tag{color:#818cf8}

/* ── Toolbar ─────────────────────────────────────── */
.toolbar{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px;flex-wrap:wrap}
.filterGroup{display:flex;gap:4px}
.filterBtn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border:1px solid #1e293b;border-radius:8px;font-size:.76rem;font-weight:500;cursor:pointer;background:transparent;color:#94a3b8;transition:all .15s}
.filterBtn:hover{border-color:#334155;color:#cbd5e1}
.filterActive{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border:1px solid #6366f1;border-radius:8px;font-size:.76rem;font-weight:600;cursor:pointer;background:rgba(99,102,241,.15);color:#a5b4fc}
.count{font-size:.68rem;font-weight:600;color:#475569;background:rgba(255,255,255,.04);padding:1px 7px;border-radius:10px;min-width:20px;text-align:center}
.countActive{font-size:.68rem;font-weight:600;color:#a5b4fc;background:rgba(99,102,241,.2);padding:1px 7px;border-radius:10px;min-width:20px;text-align:center}
.btnAdd{padding:7px 16px;border:none;border-radius:8px;font-size:.76rem;font-weight:600;cursor:pointer;background:#10b981;color:#fff;transition:filter .15s,transform .1s}
.btnAdd:hover{filter:brightness(1.15)}
.btnAdd:active{transform:scale(.97)}

/* ── Empty State ─────────────────────────────────── */
.emptyBox{display:flex;flex-direction:column;align-items:center;gap:10px;padding:32px 16px;text-align:center}
.emptyIcon{font-size:1.6rem}
.emptyBox p{font-size:.82rem;color:#64748b}

/* ── Task List ───────────────────────────────────── */
.taskList{display:flex;flex-direction:column;gap:4px;margin-bottom:14px}
.taskRow{display:flex;align-items:center;gap:10px;padding:10px 14px;background:#0a0f1a;border:1px solid transparent;border-radius:10px;transition:all .2s}
.taskRow:hover{border-color:#1e293b;background:#111827}
.taskDone{opacity:.5}
.checkbox{width:22px;height:22px;border:2px solid #334155;border-radius:6px;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s;color:transparent;font-size:.7rem;font-weight:700;padding:0}
.checkbox:hover{border-color:#6366f1}
.checkboxDone{width:22px;height:22px;border:2px solid #10b981;border-radius:6px;background:#10b981;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;font-size:.7rem;font-weight:700;padding:0}
.taskText{font-size:.82rem;color:#e2e8f0;flex:1;cursor:pointer;user-select:none}
.taskTextDone{font-size:.82rem;color:#475569;text-decoration:line-through;flex:1;cursor:pointer;user-select:none}
.taskId{font-size:.64rem;color:#475569;background:rgba(255,255,255,.03);padding:2px 7px;border-radius:4px;font-weight:600;font-family:'SF Mono','Fira Code',monospace}
.btnDel{background:none;border:none;color:#475569;font-size:1rem;cursor:pointer;padding:4px 8px;border-radius:6px;transition:all .15s;line-height:1;display:flex;align-items:center;justify-content:center}
.btnDel:hover{color:#ef4444;background:rgba(239,68,68,.1)}

/* ── Footer / Progress ───────────────────────────── */
.listFooter{display:flex;align-items:center;gap:12px}
.listFooter span{font-size:.74rem;color:#64748b}
.listFooter strong{color:#94a3b8}
.progressBar{flex:1;height:4px;background:#1e293b;border-radius:2px;overflow:hidden}
.progressFill{height:100%;background:linear-gradient(90deg,#6366f1,#10b981);border-radius:2px;transition:width .3s ease}

/* ── Buttons ─────────────────────────────────────── */
.btnPrimary{padding:9px 18px;border:none;border-radius:8px;font-size:.78rem;font-weight:600;cursor:pointer;background:#6366f1;color:#fff;transition:filter .15s,transform .1s}
.btnPrimary:hover{filter:brightness(1.15)}
.btnPrimary:active{transform:scale(.97)}
.btnPrimarySm{padding:6px 14px;border:none;border-radius:6px;font-size:.74rem;font-weight:600;cursor:pointer;background:#6366f1;color:#fff;transition:filter .15s}
.btnPrimarySm:hover{filter:brightness(1.15)}

/* ── Responsive ──────────────────────────────────── */
@media(max-width:500px){.body{padding:20px 16px}.header{padding:22px 20px 18px}.toolbar{flex-direction:column;align-items:stretch}.filterGroup{justify-content:center}}
`;
document.head.appendChild(style);
document.getElementById('app')!.appendChild(ConditionalListsDemo({}) as Node);
