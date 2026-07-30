import { css } from '@astrajs/compiler/css';

export const styles = css`
  /* ── Card ─────────────────────────────────────────────────────── */
  .card {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 20px;
    padding: 0;
    max-width: 620px;
    width: 100%;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,.3), 0 8px 32px rgba(0,0,0,.15);
  }

  /* ── Header ───────────────────────────────────────────────────── */
  .header {
    padding: 28px 32px 20px;
    border-bottom: 1px solid #334155;
    background: linear-gradient(135deg, rgba(99,102,241,.06) 0%, transparent 60%);
  }
  .header h1 {
    font-size: 1.3rem;
    font-weight: 700;
    color: #f1f5f9;
    margin-bottom: 5px;
    letter-spacing: -.01em;
  }
  .header p {
    font-size: .8rem;
    color: #64748b;
    line-height: 1.5;
  }
  .header code {
    background: rgba(99,102,241,.15);
    color: #818cf8;
    padding: 1px 7px;
    border-radius: 4px;
    font-size: .78rem;
    font-weight: 500;
  }

  /* ── Body ─────────────────────────────────────────────────────── */
  .body {
    padding: 24px 32px 28px;
  }

  /* ── Flow Diagram ─────────────────────────────────────────────── */
  .flow {
    display: flex;
    gap: 0;
    margin-bottom: 24px;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
  }
  .flowStep {
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 10px;
    padding: 10px 16px;
    text-align: center;
    min-width: 75px;
    transition: border-color .2s, background .2s;
  }
  .flowStep:hover {
    border-color: #475569;
    background: #111827;
  }
  .flowStep strong {
    color: #818cf8;
    display: block;
    font-size: .7rem;
    text-transform: uppercase;
    letter-spacing: .05em;
    margin-bottom: 2px;
  }
  .flowStep span {
    color: #94a3b8;
    font-size: .78rem;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
  }
  .flowArrow {
    color: #475569;
    font-size: 1.1rem;
    margin: 0 6px;
  }

  /* ── Buttons ──────────────────────────────────────────────────── */
  .actions {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    flex-wrap: wrap;
    align-items: center;
  }
  .btnFetch {
    padding: 9px 18px;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    font-size: .82rem;
    cursor: pointer;
    background: #6366f1;
    color: #fff;
    transition: filter .15s, transform .1s, box-shadow .15s;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .btnFetch:hover {
    filter: brightness(1.12);
    box-shadow: 0 2px 12px rgba(99,102,241,.35);
  }
  .btnFetch:active {
    transform: scale(.97);
  }
  .btnClear {
    padding: 9px 16px;
    border: 1px solid #334155;
    border-radius: 10px;
    font-weight: 500;
    font-size: .8rem;
    cursor: pointer;
    background: transparent;
    color: #64748b;
    transition: border-color .15s, color .15s, transform .1s;
  }
  .btnClear:hover {
    border-color: #64748b;
    color: #cbd5e1;
  }
  .btnClear:active {
    transform: scale(.97);
  }

  /* ── Result Box (log container) ───────────────────────────────── */
  .resultBox {
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 14px;
    min-height: 80px;
    font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
    font-size: .8rem;
    line-height: 1.6;
    overflow-x: auto;
  }

  /* ── Empty State ──────────────────────────────────────────────── */
  .emptyState {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
    color: #475569;
    font-family: system-ui, sans-serif;
    font-size: .84rem;
    font-weight: 500;
    gap: 8px;
  }
  .emptyIcon {
    font-size: 1.6rem;
    opacity: .5;
  }

  /* ── Log Entry ────────────────────────────────────────────────── */
  .logEntry {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    margin-bottom: 6px;
    background: #1e293b;
    border: 1px solid transparent;
    transition: border-color .2s;
  }
  .logEntry:last-child {
    margin-bottom: 0;
  }
  .logEntry:hover {
    border-color: #334155;
  }
  .logStatus {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-top: 6px;
    flex-shrink: 0;
  }
  .logLoading { background: #fbbf24; box-shadow: 0 0 8px rgba(251,191,36,.5); }
  .logSuccess { background: #34d399; box-shadow: 0 0 8px rgba(52,211,153,.4); }
  .logError   { background: #f87171; box-shadow: 0 0 8px rgba(248,113,113,.4); }

  .logBody { flex: 1; min-width: 0; }

  .logMeta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    flex-wrap: wrap;
  }
  .logTime {
    color: #64748b;
    font-size: .72rem;
    font-family: system-ui, sans-serif;
  }
  .logEndpoint {
    color: #a5b4fc;
    font-weight: 600;
    font-size: .78rem;
  }
  .logTag {
    font-size: .65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .05em;
    padding: 1px 6px;
    border-radius: 3px;
    font-family: system-ui, sans-serif;
  }
  .logTagPending { background: rgba(251,191,36,.15); color: #fbbf24; }
  .logTagOk      { background: rgba(52,211,153,.12); color: #34d399; }
  .logTagErr     { background: rgba(248,113,113,.12); color: #f87171; }

  .logArgs {
    color: #64748b;
    font-size: .73rem;
    margin-bottom: 4px;
    word-break: break-all;
  }
  .logResult {
    font-size: .73rem;
    padding: 6px 10px;
    border-radius: 5px;
    word-break: break-all;
    white-space: pre-wrap;
    max-height: 80px;
    overflow-y: auto;
  }
  .logResultSuccess { background: #0f172a; color: #6ee7b7; }
  .logResultError   { background: #0f172a; color: #fca5a5; }
  .logResultLoading { background: #0f172a; color: #fcd34d; }
`;
