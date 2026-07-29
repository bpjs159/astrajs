/**
 * 06 — Conditional & Lists · Styles
 */
import { css } from '@astrajs/compiler/css';

export const styles = css`
  .card { background:#1e293b; border:1px solid #334155; border-radius:16px; padding:32px; max-width:560px; width:100%; }
  .subtitle { color:#64748b; font-size:.85rem; margin-bottom:20px; }
  .subtitle code { background:#334155; padding:2px 6px; border-radius:4px; font-size:.8rem; }
  .section { margin-bottom:24px; }
  .section h3 { font-size:.95rem; margin-bottom:10px; color:#94a3b8; }
  .btn { padding:8px 16px; border:none; border-radius:6px; font-size:.8rem; font-weight:600; cursor:pointer; background:#6366f1; color:#fff; margin:4px 2px; }
  .details { background:#0f172a; border-radius:8px; padding:14px; margin-top:10px; font-size:.82rem; color:#cbd5e1; }
  .details p { margin:4px 0; }
  .details code { color:#818cf8; }
  .filters { display:flex; gap:6px; align-items:center; flex-wrap:wrap; margin-bottom:10px; }
  .filterBtn { padding:6px 14px; border:1px solid #334155; border-radius:6px; font-size:.78rem; cursor:pointer; background:transparent; color:#94a3b8; }
  .filterActive { padding:6px 14px; border:1px solid #6366f1; border-radius:6px; font-size:.78rem; cursor:pointer; background:#6366f1; color:#fff; }
  .btnAdd { padding:6px 14px; border:none; border-radius:6px; font-size:.78rem; cursor:pointer; background:#10b981; color:#fff; margin-left:auto; }
  .empty { color:#64748b; font-size:.82rem; font-style:italic; padding:12px 0; }
  .list { list-style:none; padding:0; }
  .item { padding:8px 12px; border-radius:6px; margin:4px 0; background:#0f172a; display:flex; justify-content:space-between; align-items:center; font-size:.85rem; }
  .done { padding:8px 12px; border-radius:6px; margin:4px 0; background:#0f172a; display:flex; justify-content:space-between; align-items:center; font-size:.85rem; text-decoration:line-through; opacity:.5; }
  .btnDel { background:none; border:none; color:#ef4444; font-size:1.1rem; cursor:pointer; padding:2px 6px; }
`;
