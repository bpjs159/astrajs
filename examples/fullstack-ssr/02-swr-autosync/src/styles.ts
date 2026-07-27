import { css } from '@astrajs/compiler/css';

export const styles = css`
  .card { background:#1e293b; border:1px solid #334155; border-radius:16px; padding:36px; max-width:560px; }
  .subtitle { color:#64748b; font-size:.85rem; margin-bottom:24px; }
  .metric { display:flex; justify-content:space-between; background:#0f172a; border-radius:10px; padding:16px; margin-bottom:12px; }
  .label { font-size:.85rem; color:#94a3b8; }
  .value { font-size:1.5rem; font-weight:800; color:#818cf8; }
  .age { font-size:.7rem; color:#64748b; }
  .status { display:flex; gap:8px; align-items:center; margin-top:8px; }
  .dotStale { width:8px; height:8px; border-radius:50%; background:#fbbf24; }
  .dotFresh { width:8px; height:8px; border-radius:50%; background:#34d399; }
  .dotSyncing { width:8px; height:8px; border-radius:50%; background:#6366f1; animation:pulse 1s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
  .btnRefresh { padding:10px 20px; border:none; border-radius:8px; font-weight:600; cursor:pointer; background:#6366f1; color:#fff; }
  .btnAuto { padding:10px 20px; border:none; border-radius:8px; font-weight:600; cursor:pointer; background:#10b981; color:#fff; }
  .btnInvalidate { padding:10px 20px; border:none; border-radius:8px; font-weight:600; cursor:pointer; background:#ef4444; color:#fff; }
  .log { margin-top:20px; background:#0f172a; border-radius:10px; padding:12px; font-family:monospace; font-size:.75rem; max-height:120px; overflow-y:auto; }
  .stale { color:#fbbf24; }
  .fresh { color:#34d399; }
`;
