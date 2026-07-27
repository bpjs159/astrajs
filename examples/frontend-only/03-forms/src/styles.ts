import { css } from '@astrajs/compiler/css';

export const styles = css`
  .formCard { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 36px; width: 420px; }
  .subtitle { color: #64748b; font-size: .85rem; margin-bottom: 24px; }
  .field { margin-bottom: 16px; }
  label { display: block; font-size: .85rem; font-weight: 600; color: #94a3b8; margin-bottom: 6px; }
  input, textarea, select { width: 100%; padding: 10px 14px; border: 1px solid #475569; border-radius: 8px; background: #0f172a; color: #e2e8f0; font-size: .9rem; font-family: inherit; }
  input:focus, textarea:focus, select:focus { outline: none; border-color: #6366f1; }
  .error { color: #f87171; font-size: .75rem; margin-top: 4px; min-height: 18px; }
  .row { display: flex; gap: 12px; } .row .field { flex: 1; }
  .livePreview { background: #0f172a; border-radius: 10px; padding: 16px; margin-top: 20px; }
  .livePreview h3 { font-size: .8rem; color: #64748b; margin-bottom: 8px; text-transform: uppercase; letter-spacing: .05em; }
  .previewItem { display: flex; justify-content: space-between; padding: 4px 0; font-size: .85rem; }
  .previewItem span:first-child { color: #64748b; }
  .btnSubmit { width: 100%; padding: 12px; background: #6366f1; color: #fff; border: none; border-radius: 10px; font-size: 1rem; font-weight: 600; cursor: pointer; margin-top: 8px; }
  .btnSubmit:hover { background: #4f46e5; }
  .success { text-align: center; color: #34d399; font-weight: 600; margin-top: 12px; }
`;
