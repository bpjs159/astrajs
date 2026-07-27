import { css } from '@astrajs/compiler/css';

export const styles = css`
  .card { background:#1e293b; border:1px solid #334155; border-radius:16px; padding:40px; max-width:600px; text-align:center; }
  .subtitle { color:#64748b; margin-bottom:28px; font-size:.9rem; }
  .dataTable { width:100%; border-collapse:collapse; margin:20px 0; }
  .dataTable th { text-align:left; padding:10px 14px; color:#64748b; font-size:.75rem; text-transform:uppercase; letter-spacing:.05em; border-bottom:1px solid #334155; }
  .dataTable td { padding:10px 14px; border-bottom:1px solid #1e293b; font-size:.9rem; }
  .badgePrebuilt { padding:3px 10px; border-radius:20px; font-size:.7rem; font-weight:600; background:#10b981; color:#fff; }
  .badgeZero { padding:3px 10px; border-radius:20px; font-size:.7rem; font-weight:600; background:#6366f1; color:#fff; }
  .stats { display:flex; gap:16px; justify-content:center; margin:24px 0; }
  .stat { background:#0f172a; border-radius:10px; padding:16px 24px; }
  .num { font-size:1.5rem; font-weight:800; color:#818cf8; }
  .lbl { font-size:.7rem; color:#64748b; margin-top:2px; }
`;
