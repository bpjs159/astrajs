import { css } from '@astrajs/compiler/css';

export const styles = css`
  .card { background:#1e293b; border:1px solid #334155; border-radius:16px; padding:36px; max-width:520px; }
  .subtitle { color:#64748b; font-size:.85rem; margin-bottom:24px; }
  .resultBox { background:#0f172a; border-radius:10px; padding:16px; min-height:80px; margin:16px 0; font-family:monospace; font-size:.85rem; white-space:pre-wrap; }
  .btnFetch { padding:10px 20px; border:none; border-radius:8px; font-weight:600; cursor:pointer; background:#6366f1; color:#fff; }
  .btnClear { padding:10px 20px; border:none; border-radius:8px; font-weight:600; cursor:pointer; background:#334155; color:#cbd5e1; }
  .flow { display:flex; gap:12px; margin:20px 0; align-items:center; font-size:.8rem; color:#64748b; }
  .flowStep { background:#1e293b; border:1px solid #334155; border-radius:8px; padding:8px 14px; text-align:center; }
  .flowStep strong { color:#818cf8; display:block; }
`;
