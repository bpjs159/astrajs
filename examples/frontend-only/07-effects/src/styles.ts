import { css } from '@astrajs/compiler/css';

export const styles = css`
  .card { background:#1e293b; border:1px solid #334155; border-radius:16px; padding:36px; max-width:600px; }
  .subtitle { color:#64748b; font-size:.85rem; margin-bottom:24px; }
  .timerDisplay { text-align:center; padding:28px; background:#0f172a; border-radius:14px; margin-bottom:20px; }
  .time { font-size:4rem; font-weight:800; color:#818cf8; font-family:monospace; }
  .statusRunning { color:#34d399; font-size:.85rem; margin-top:4px; }
  .statusStopped { color:#64748b; font-size:.85rem; margin-top:4px; }
  .btnRow { display:flex; gap:8px; justify-content:center; margin-bottom:20px; }
  .btnStart { padding:10px 20px; border:none; border-radius:8px; font-weight:600; cursor:pointer; background:#10b981; color:#fff; }
  .btnStop { padding:10px 20px; border:none; border-radius:8px; font-weight:600; cursor:pointer; background:#ef4444; color:#fff; }
  .btnReset { padding:10px 20px; border:none; border-radius:8px; font-weight:600; cursor:pointer; background:#334155; color:#cbd5e1; }
`;
