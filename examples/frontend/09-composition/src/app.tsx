/**
 * 09 — Component Composition · App Entry
 */
import { CompositionDemo } from './main.js';

const style = document.createElement('style');
style.textContent = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,-apple-system,sans-serif;background:#0f172a;color:#e2e8f0;display:flex;align-items:flex-start;justify-content:center;min-height:100vh;padding:40px 20px}

/* ── Card Shell ──────────────────────────────────── */
.card{background:#1e293b;border:1px solid #334155;border-radius:20px;padding:0;max-width:820px;width:100%;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.3),0 8px 32px rgba(0,0,0,.15)}
.header{padding:28px 32px 20px;border-bottom:1px solid #334155;background:linear-gradient(135deg,rgba(99,102,241,.06) 0%,rgba(236,72,153,.03) 50%,transparent 100%)}
.header h1{font-size:1.35rem;font-weight:700;color:#f1f5f9;margin-bottom:5px;letter-spacing:-.01em}
.header p{font-size:.8rem;color:#64748b}
.header code{background:rgba(99,102,241,.15);color:#818cf8;padding:1px 7px;border-radius:4px;font-size:.76rem;font-weight:500}
.header p code{margin:0 1px}
.body{padding:28px 32px 32px}

/* ── Section Labels ──────────────────────────────── */
.sectionLabel{display:flex;align-items:center;gap:12px;margin-top:44px;margin-bottom:14px}
.sectionLabel:first-child{margin-top:4px}
.sectionIcon{width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:rgba(99,102,241,.12);border-radius:8px;font-size:.95rem;flex-shrink:0}
.sectionTitle{font-size:.88rem;font-weight:700;color:#e2e8f0;display:block}
.sectionCode{display:inline-block;margin-top:2px;background:rgba(99,102,241,.1);color:#a5b4fc;padding:1px 8px;border-radius:4px;font-size:.72rem;font-weight:500;font-family:'SF Mono','Fira Code',monospace;letter-spacing:.02em}

/* ── Section Box ─────────────────────────────────── */
.sectionBox{background:#0f172a;border:1px solid #1e293b;border-radius:14px;padding:22px;margin-bottom:20px}
.desc{font-size:.82rem;color:#94a3b8;line-height:1.6;margin-bottom:16px}
.desc strong{color:#cbd5e1}
.desc code{background:rgba(255,255,255,.06);color:#94a3b8;padding:1px 6px;border-radius:3px;font-size:.76rem}
.demoArea{margin-top:16px}

/* ── Fragment Demo ───────────────────────────────── */
.fragmentPreview{background:#0a0f1a;border:1px dashed #334155;border-radius:10px;padding:16px;margin-bottom:12px}
.fragmentLabel{font-size:.68rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px}
.fragmentNodes{display:flex;flex-direction:column;gap:4px;margin-bottom:10px}
.fragmentNode{display:flex;align-items:center;gap:8px;padding:7px 10px;background:#111827;border:1px solid #1e293b;border-radius:6px;font-size:.76rem;color:#cbd5e1;transition:all .3s}
.fragmentNodeNew{animation:fadeSlideIn .35s ease;border-color:rgba(99,102,241,.3);background:rgba(99,102,241,.05)}
@keyframes fadeSlideIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
.nodeTag{display:inline-block;background:#1e293b;color:#64748b;padding:2px 7px;border-radius:3px;font-size:.64rem;font-weight:600;font-family:'SF Mono','Fira Code',monospace;min-width:42px;text-align:center}
.fragmentNote{font-size:.7rem;color:#475569;margin-top:8px}
.fragmentNote code{background:rgba(255,255,255,.04);color:#64748b;padding:1px 5px;border-radius:3px;font-size:.68rem}

/* ── Two Column ──────────────────────────────────── */
.twoCol{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.demoText{font-size:.78rem;color:#94a3b8;line-height:1.5}
.demoText code{background:rgba(255,255,255,.05);color:#a5b4fc;padding:1px 5px;border-radius:3px;font-size:.73rem}
.demoText strong{color:#e2e8f0}

/* ── Inner Card (Layout Component) ───────────────── */
.innerCard{background:#111827;border:1px solid #1e293b;border-radius:10px;overflow:hidden;transition:border-color .2s}
.innerCard:hover{border-color:#334155}
.innerCardHeader{padding:10px 14px;background:#0a0f1a;border-bottom:1px solid #1e293b}
.innerCardHeader h4{font-size:.8rem;font-weight:600;color:#cbd5e1}
.innerCardBody{padding:14px}
.cardAccentPurple{border-left:3px solid #818cf8}
.cardAccentGreen{border-left:3px solid #34d399}
.cardAccentPink{border-left:3px solid #f472b6}
.cardAccentAmber{border-left:3px solid #fbbf24}

/* ── Custom Header Demo ──────────────────────────── */
.customHeaderDemo{display:flex;align-items:center;gap:8px;font-size:.8rem;font-weight:600;color:#e2e8f0}
.customHeaderIcon{font-size:.9rem}

/* ── Slot Showcase ───────────────────────────────── */
.slotShowcase{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
.slotItem{display:flex;align-items:center;gap:10px;padding:10px 14px;background:#111827;border-radius:8px;border:1px solid #1e293b}
.slotName{font-size:.73rem;font-weight:600;color:#a5b4fc;background:rgba(99,102,241,.1);padding:3px 8px;border-radius:4px;font-family:'SF Mono','Fira Code',monospace;white-space:nowrap}
.slotArrow{color:#475569;font-size:.7rem}
.slotDesc{font-size:.76rem;color:#94a3b8}

/* ── Badge Row ───────────────────────────────────── */
.badgeRow{display:flex;flex-wrap:wrap;gap:6px}

/* ── Badge Variants ──────────────────────────────── */
.badge{display:inline-block;padding:3px 10px;border-radius:5px;font-size:.7rem;font-weight:600;line-height:1.4}
.badgeInfo{background:rgba(59,130,246,.15);color:#93c5fd}
.badgeSuccess{background:rgba(34,197,94,.15);color:#86efac}
.badgeWarning{background:rgba(251,191,36,.15);color:#fbbf24}
.badgeAccent{background:rgba(99,102,241,.15);color:#a5b4fc}

/* ── User Grid ───────────────────────────────────── */
.userGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}

/* ── Profile ─────────────────────────────────────── */
.profileHeader{display:flex;align-items:center;gap:10px}
.profileInfo{display:flex;flex-direction:column;gap:4px}
.profileName{font-size:.82rem;font-weight:600;color:#f1f5f9}
.profileBody{display:flex;justify-content:space-between;align-items:center}
.profileRole{font-size:.75rem;color:#94a3b8}
.profileId{font-size:.66rem;color:#475569;background:rgba(255,255,255,.03);padding:2px 7px;border-radius:4px;font-weight:600;font-family:'SF Mono','Fira Code',monospace}

/* ── Primitives Row ──────────────────────────────── */
.primitivesRow{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.primitiveCard{display:flex;flex-direction:column;align-items:center;gap:10px;padding:20px 14px;background:#111827;border:1px solid #1e293b;border-radius:10px;transition:border-color .2s}
.primitiveCard:hover{border-color:#334155}
.primitivePreview{display:flex;align-items:center;justify-content:center}
.primitiveName{font-size:.74rem;font-weight:600;color:#e2e8f0;font-family:'SF Mono','Fira Code',monospace}
.primitiveDesc{font-size:.7rem;color:#64748b;text-align:center;line-height:1.4}

/* ── Mini Card (primitive preview) ───────────────── */
.miniCard{background:#1e293b;border:1px solid #334155;border-radius:6px;overflow:hidden;width:80px}
.miniCardHdr{padding:5px 8px;background:#0f172a;border-bottom:1px solid #334155;font-size:.58rem;font-weight:600;color:#cbd5e1}
.miniCardBody{padding:8px;font-size:.58rem;color:#64748b}

/* ── Avatar ──────────────────────────────────────── */
.avatar{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:.76rem;font-weight:700;color:#fff;flex-shrink:0}
.avGrad0{background:linear-gradient(135deg,#6366f1,#818cf8)}
.avGrad1{background:linear-gradient(135deg,#8b5cf6,#a78bfa)}
.avGrad2{background:linear-gradient(135deg,#ec4899,#f472b6)}
.avGrad3{background:linear-gradient(135deg,#14b8a6,#2dd4bf)}

/* ── Buttons ─────────────────────────────────────── */
.btnPrimary{padding:8px 16px;border:none;border-radius:8px;font-size:.76rem;font-weight:600;cursor:pointer;background:#6366f1;color:#fff;transition:filter .15s,transform .1s;display:inline-flex;align-items:center;gap:6px}
.btnPrimary:hover{filter:brightness(1.15)}
.btnPrimary:active{transform:scale(.97)}
.btnHint{font-weight:400;opacity:.6;font-size:.7rem}

/* ── Responsive ──────────────────────────────────── */
@media(max-width:700px){.twoCol,.userGrid,.primitivesRow{grid-template-columns:1fr}}
@media(max-width:500px){.body{padding:20px 16px}.header{padding:22px 20px 18px}}
`;
document.head.appendChild(style);
document.getElementById('app')!.appendChild(CompositionDemo({}) as Node);
