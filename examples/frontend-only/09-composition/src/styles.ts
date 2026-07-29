/**
 * 09 — Component Composition · Styles
 */
import { css } from '@astrajs/compiler/css';

export const styles = css`
  .page { max-width:780px; width:100%; }
  .subtitle { color:#64748b; font-size:.82rem; margin-bottom:24px; }
  .subtitle code { background:#334155; padding:2px 6px; border-radius:4px; font-size:.78rem; }
  .grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
  .userGrid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
  .card { background:#1e293b; border:1px solid #334155; border-radius:12px; overflow:hidden; }
  .cardHeader { padding:14px 16px; background:#0f172a; border-bottom:1px solid #334155; display:flex; align-items:center; gap:10px; }
  .cardHeader h3 { font-size:.9rem; color:#e2e8f0; }
  .cardHeader strong { font-size:.85rem; }
  .cardBody { padding:16px; }
  .note { font-size:.8rem; color:#94a3b8; margin-bottom:8px; }
  .note code { background:#334155; padding:2px 5px; border-radius:3px; }
  .expanded { font-size:.82rem; color:#818cf8; margin-bottom:8px; }
  .role { font-size:.8rem; color:#94a3b8; }
  .btn { padding:6px 14px; border:none; border-radius:6px; font-size:.78rem; font-weight:600; cursor:pointer; background:#6366f1; color:#fff; }
  .badgeInfo { display:inline-block; padding:2px 8px; border-radius:4px; font-size:.7rem; font-weight:600; background:#1e3a5f; color:#93c5fd; margin:2px 4px 2px 0; }
  .badgeSuccess { display:inline-block; padding:2px 8px; border-radius:4px; font-size:.7rem; font-weight:600; background:#14532d; color:#86efac; margin:2px 4px 2px 0; }
  .badgeWarning { display:inline-block; padding:2px 8px; border-radius:4px; font-size:.7rem; font-weight:600; background:#422006; color:#fbbf24; margin:2px 4px 2px 0; }
  .avatarMd { display:inline-flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:50%; background:#6366f1; color:#fff; font-size:.75rem; font-weight:700; flex-shrink:0; }
  .avatarSm { display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px; border-radius:50%; background:#6366f1; color:#fff; font-size:.65rem; font-weight:700; flex-shrink:0; }
  .slotDemo { display:flex; flex-wrap:wrap; gap:4px; align-items:center; }
`;
