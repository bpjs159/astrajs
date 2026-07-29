/**
 * 10 — Dynamic Attributes · Styles
 */
import { css } from '@astrajs/compiler/css';

export const styles = css`
  .pageDark { max-width:640px; width:100%; background:#1e293b; border:1px solid #334155; border-radius:16px; padding:32px; }
  .pageLight { max-width:640px; width:100%; background:#f8fafc; border:1px solid #cbd5e1; border-radius:16px; padding:32px; color:#0f172a; }
  .subtitle { color:#64748b; font-size:.82rem; margin-bottom:20px; }
  .subtitle code { background:#334155; padding:2px 6px; border-radius:4px; font-size:.78rem; }
  .section { margin-bottom:22px; }
  .section h3 { font-size:.88rem; margin-bottom:8px; color:#94a3b8; }
  .row { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
  .btn { padding:7px 16px; border:none; border-radius:6px; font-size:.78rem; font-weight:600; cursor:pointer; background:#6366f1; color:#fff; }
  .btn:disabled { opacity:.4; cursor:not-allowed; }
  .btnDisabled { padding:7px 16px; border:none; border-radius:6px; font-size:.78rem; font-weight:600; background:#475569; color:#94a3b8; cursor:not-allowed; }
  .btnSm { padding:4px 12px; border:1px solid #334155; border-radius:4px; font-size:.72rem; cursor:pointer; background:transparent; color:#94a3b8; }
  .themeBtn { padding:8px 18px; border:1px solid #334155; border-radius:8px; font-size:.8rem; cursor:pointer; background:transparent; color:#94a3b8; }
  .themeActive { padding:8px 18px; border:1px solid #6366f1; border-radius:8px; font-size:.8rem; cursor:pointer; background:#6366f1; color:#fff; }
  .filterActive { padding:4px 12px; border:1px solid #6366f1; border-radius:4px; font-size:.72rem; cursor:pointer; background:#6366f1; color:#fff; }
  .box { padding:20px; border-radius:10px; background:#0f172a; text-align:center; margin-bottom:10px; transition:all .2s; }
  .boxBold { padding:20px; border-radius:10px; background:#0f172a; text-align:center; margin-bottom:10px; font-weight:800; color:#818cf8; transition:all .2s; }
  .alertInfo { padding:12px 16px; border-radius:8px; font-size:.82rem; background:#1e3a5f; color:#93c5fd; margin-bottom:8px; }
  .alertWarning { padding:12px 16px; border-radius:8px; font-size:.82rem; background:#422006; color:#fbbf24; margin-bottom:8px; }
  .alertError { padding:12px 16px; border-radius:8px; font-size:.82rem; background:#3b1010; color:#fca5a5; margin-bottom:8px; }
  .progressTrack { width:100%; height:20px; background:#0f172a; border-radius:10px; overflow:hidden; margin-bottom:8px; }
  .progressFill { height:100%; background:linear-gradient(90deg,#6366f1,#818cf8); border-radius:10px; transition:width .3s; }
  .progressLabel { font-size:.78rem; color:#94a3b8; font-weight:600; }
  .savedBadge { font-size:.78rem; color:#86efac; font-weight:600; }
`;
