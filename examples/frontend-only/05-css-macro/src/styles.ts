/**
 * 05 — CSS Macro · Styles
 */
import { css } from '@astrajs/compiler/css';

export const styles = css`
  .box { padding: 24px; border-radius: 14px; text-align: center; transition: all .2s; cursor: pointer; }
  .box-primary { background: linear-gradient(135deg,#6366f1,#8b5cf6); }
  .box-success { background: linear-gradient(135deg,#10b981,#34d399); }
  .box-warning { background: linear-gradient(135deg,#f59e0b,#fbbf24); }
  .box-danger { background: linear-gradient(135deg,#ef4444,#f87171); }
  .box h3 { font-size: 1.2rem; margin-bottom: 8px; color: #fff; }
  .box p { font-size: .85rem; color: rgba(255,255,255,.8); }
  .box:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,.3); }
  .code-block { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; overflow-x: auto; margin-top: 20px; }
  .code-block pre { font-family: 'JetBrains Mono', monospace; font-size: .85rem; color: #94a3b8; line-height: 1.6; }
`;
