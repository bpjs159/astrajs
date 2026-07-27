import { css } from '@astrajs/compiler/css';

export const styles = css`
  .card { background:#1e293b; border:1px solid #334155; border-radius:16px; padding:36px; max-width:640px; }
  .subtitle { color:#64748b; font-size:.85rem; margin-bottom:24px; }
  .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
  .panel { background:#0f172a; border-radius:12px; padding:20px; }
  .val { font-size:2rem; font-weight:800; color:#818cf8; }
  .btnUp { padding:8px 16px; border:none; border-radius:6px; font-size:.8rem; font-weight:600; cursor:pointer; background:#6366f1; color:#fff; margin:4px 2px; }
  .btnBatch { padding:8px 16px; border:none; border-radius:6px; font-size:.8rem; font-weight:600; cursor:pointer; background:#10b981; color:#fff; margin:4px 2px; }
`;
