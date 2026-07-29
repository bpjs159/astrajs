/**
 * 10 — Dynamic Attributes · App Entry
 */
import { DynamicAttrsDemo } from './main.js';

const style = document.createElement('style');
style.textContent = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,-apple-system,sans-serif;background:#0f172a;color:#e2e8f0;display:flex;align-items:flex-start;justify-content:center;min-height:100vh;padding:40px 20px}

/* ── Card Shell ──────────────────────────────────── */
.card{background:#1e293b;border:1px solid #334155;border-radius:20px;padding:0;max-width:720px;width:100%;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.3),0 8px 32px rgba(0,0,0,.15)}
.header{padding:28px 32px 20px;border-bottom:1px solid #334155;background:linear-gradient(135deg,rgba(99,102,241,.06) 0%,rgba(236,72,153,.03) 50%,transparent 100%)}
.header h1{font-size:1.35rem;font-weight:700;color:#f1f5f9;margin-bottom:5px;letter-spacing:-.01em}
.header p{font-size:.8rem;color:#64748b}
.header code{background:rgba(99,102,241,.15);color:#818cf8;padding:1px 7px;border-radius:4px;font-size:.76rem;font-weight:500}
.header p code{margin:0 2px}
.body{padding:28px 32px 32px}

/* ── Section Labels ──────────────────────────────── */
.sectionLabel{display:flex;align-items:center;gap:12px;margin-top:36px;margin-bottom:12px}
.sectionLabel:first-child{margin-top:4px}
.sectionIcon{width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:rgba(99,102,241,.12);border-radius:8px;font-size:.95rem;flex-shrink:0}
.sectionTitle{font-size:.88rem;font-weight:700;color:#e2e8f0;display:block}
.sectionCode{display:inline-block;margin-top:2px;background:rgba(99,102,241,.1);color:#a5b4fc;padding:1px 8px;border-radius:4px;font-size:.72rem;font-weight:500;font-family:'SF Mono','Fira Code',monospace;letter-spacing:.02em}

/* ── Section Box ─────────────────────────────────── */
.sectionBox{background:#0f172a;border:1px solid #1e293b;border-radius:14px;padding:22px;margin-bottom:14px}
.desc{font-size:.82rem;color:#94a3b8;line-height:1.6;margin-bottom:16px}
.desc strong{color:#cbd5e1}
.desc code{background:rgba(255,255,255,.06);color:#94a3b8;padding:1px 6px;border-radius:3px;font-size:.76rem}

/* ── Theme Section ───────────────────────────────── */
.themeRow{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.themeBtn{padding:9px 20px;border:1px solid #1e293b;border-radius:10px;font-size:.8rem;font-weight:500;cursor:pointer;background:transparent;color:#94a3b8;transition:all .15s}
.themeBtn:hover{border-color:#334155;color:#cbd5e1}
.themeActive{padding:9px 20px;border:1px solid #6366f1;border-radius:10px;font-size:.8rem;font-weight:600;cursor:pointer;background:rgba(99,102,241,.15);color:#a5b4fc}
.themeBadge{font-size:.78rem;color:#64748b;margin-left:auto}
.themeBadge strong{color:#cbd5e1}

/* ── Classes & Styles ────────────────────────────── */
.box{padding:22px;border-radius:10px;background:#0a0f1a;border:1px solid #1e293b;text-align:center;margin-bottom:14px;transition:all .25s;font-size:.92rem;color:#94a3b8}
.boxBold{padding:22px;border-radius:10px;background:#0a0f1a;border:1px solid rgba(99,102,241,.25);text-align:center;margin-bottom:14px;font-weight:800;color:#a5b4fc;transition:all .25s}
.controlRow{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.fontControls{display:flex;align-items:center;gap:6px;margin-left:auto}
.fontLabel{font-size:.78rem;font-weight:600;color:#cbd5e1;min-width:36px;text-align:center}

/* ── Alert Section ───────────────────────────────── */
.alertInfo{display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:10px;font-size:.82rem;background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.2);color:#93c5fd;margin-bottom:12px}
.alertWarning{display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:10px;font-size:.82rem;background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.2);color:#fbbf24;margin-bottom:12px}
.alertError{display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:10px;font-size:.82rem;background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.2);color:#fca5a5;margin-bottom:12px}
.alertIcon{font-size:1.2rem;flex-shrink:0}
.alertInfo strong,.alertWarning strong,.alertError strong{display:block;font-size:.78rem;margin-bottom:1px}
.alertInfo span,.alertWarning span,.alertError span{font-size:.74rem;opacity:.8}
.filterBtn{padding:5px 14px;border:1px solid #1e293b;border-radius:6px;font-size:.74rem;font-weight:500;cursor:pointer;background:transparent;color:#94a3b8;transition:all .15s;text-transform:capitalize}
.filterBtn:hover{border-color:#334155;color:#cbd5e1}
.filterActive{padding:5px 14px;border:1px solid #6366f1;border-radius:6px;font-size:.74rem;font-weight:600;cursor:pointer;background:rgba(99,102,241,.15);color:#a5b4fc;text-transform:capitalize}

/* ── Progress Section ────────────────────────────── */
.progressWrapper{display:flex;align-items:center;gap:14px;margin-bottom:12px}
.progressTrack{flex:1;height:14px;background:#0a0f1a;border:1px solid #1e293b;border-radius:7px;overflow:hidden}
.progressFill{height:100%;background:linear-gradient(90deg,#6366f1,#a78bfa);border-radius:7px;transition:width .35s ease}
.progressPercent{font-size:.82rem;font-weight:700;color:#cbd5e1;font-family:'SF Mono','Fira Code',monospace;min-width:38px;text-align:right}

/* ── Toggles ─────────────────────────────────────── */
.toggleRow{display:flex;gap:18px;flex-wrap:wrap;margin-bottom:14px}
.toggle{display:flex;align-items:center;gap:8px;cursor:pointer}
.toggle input[type="checkbox"]{width:16px;height:16px;accent-color:#6366f1;cursor:pointer}
.toggleLabel{font-size:.82rem;color:#cbd5e1}
.savedBadge{font-size:.8rem;color:#86efac;font-weight:600}

/* ── Agreement Section ────────────────────────────── */
.agreementLabel{display:flex;align-items:center;gap:10px;font-size:.84rem;color:#cbd5e1;cursor:pointer;margin-bottom:14px}
.agreementLabel input[type="checkbox"]{width:16px;height:16px;accent-color:#6366f1;cursor:pointer}
.submitBtn{padding:9px 22px;border:none;border-radius:8px;font-size:.8rem;font-weight:600;cursor:pointer;background:linear-gradient(135deg,#6366f1,#818cf8);color:#fff;transition:filter .15s,transform .1s}
.submitBtn:hover{filter:brightness(1.1)}
.submitBtn:active{transform:scale(.97)}
.submitDisabled{padding:9px 22px;border:none;border-radius:8px;font-size:.8rem;font-weight:600;background:#1e293b;color:#475569;cursor:not-allowed}

/* ── Buttons ─────────────────────────────────────── */
.btnPrimary{padding:8px 18px;border:none;border-radius:8px;font-size:.78rem;font-weight:600;cursor:pointer;background:#6366f1;color:#fff;transition:filter .15s,transform .1s}
.btnPrimary:hover{filter:brightness(1.15)}
.btnPrimary:active{transform:scale(.97)}
.btnSm{padding:5px 12px;border:1px solid #1e293b;border-radius:6px;font-size:.74rem;font-weight:500;cursor:pointer;background:transparent;color:#94a3b8;transition:all .15s}
.btnSm:hover{border-color:#334155;color:#cbd5e1}
.btnDisabled{padding:8px 18px;border:none;border-radius:8px;font-size:.78rem;font-weight:600;background:#1e293b;color:#475569;cursor:not-allowed}

/* ── Responsive ──────────────────────────────────── */
@media(max-width:500px){.body{padding:20px 16px}.header{padding:22px 20px 18px}.themeRow{flex-direction:column;align-items:stretch}.themeBadge{margin-left:0}}
`;
document.head.appendChild(style);
document.getElementById('app')!.appendChild(DynamicAttrsDemo({}) as Node);
