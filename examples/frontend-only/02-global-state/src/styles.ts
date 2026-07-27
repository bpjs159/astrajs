import { css } from '@astrajs/compiler/css';

export const styles = css`
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .card { background: #1e293b; border: 1px solid #334155; border-radius: 14px; padding: 24px; }
  .card h3 { font-size: 1rem; color: #94a3b8; margin-bottom: 12px; }
  .value { font-size: 2.5rem; font-weight: 800; color: #818cf8; }
  .btnUp { background: #6366f1; color: #fff; padding: 8px 18px; border: none; border-radius: 8px; font-weight: 600; font-size: .85rem; cursor: pointer; margin: 4px; }
  .btnUp:hover { background: #4f46e5; }
  .btnDown { background: #ef4444; color: #fff; padding: 8px 18px; border: none; border-radius: 8px; font-weight: 600; font-size: .85rem; cursor: pointer; margin: 4px; }
  .btnDown:hover { background: #dc2626; }
  .totalBox { grid-column: 1 / -1; text-align: center; padding: 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 14px; }
  .totalBox .value { color: #fff; font-size: 3.5rem; }
  .totalBox h3 { color: rgba(255,255,255,.7); }
`;
