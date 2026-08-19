import { css } from 'astrajs.dev/compiler/css';

export const styles = css`
  .shell { display: flex; min-height: 100vh; }
  nav { width: 220px; background: #1e293b; padding: 24px 16px; border-right: 1px solid #334155; }
  nav h2 { font-size: 1.1rem; margin-bottom: 20px; color: #818cf8; }
  nav a { display: block; padding: 10px 14px; border-radius: 8px; color: #94a3b8; text-decoration: none; font-weight: 500; margin-bottom: 4px; }
  nav a:hover { background: #334155; color: #e2e8f0; }
  .active { background: rgba(99,102,241,.2); color: #818cf8; }
  main { flex: 1; padding: 40px; display: flex; align-items: center; justify-content: center; }
  .page { text-align: center; }
  .pageEmoji { font-size: 5rem; margin-bottom: 16px; }
  .badge { display: inline-block; background: #6366f1; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: .75rem; font-weight: 600; margin-top: 16px; }
`;
