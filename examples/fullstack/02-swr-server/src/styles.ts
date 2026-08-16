import { css } from 'astrajs.dev/compiler/css';

export const styles = css`
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
  .body {
    padding: 24px 32px 28px;
  }

  /* Loading */
  .loadingBox {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 0;
    gap: 14px;
    color: #64748b;
  }
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #334155;
    border-top-color: #818cf8;
    border-radius: 50%;
    animation: spin .7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loadingBox p {
    font-size: .84rem;
    font-weight: 500;
  }

  /* Stale bar */
  .staleBar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    margin-bottom: 18px;
    background: rgba(251,191,36,.12);
    border: 1px solid rgba(251,191,36,.22);
    border-radius: 10px;
    font-size: .76rem;
    font-weight: 500;
    color: #fbbf24;
  }
  .spinnerSm {
    width: 14px;
    height: 14px;
    border: 2px solid #fbbf24;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin .6s linear infinite;
    flex-shrink: 0;
  }

  /* Error */
  .errorBox {
    text-align: center;
    padding: 18px;
    background: rgba(248,113,113,.12);
    border: 1px solid rgba(248,113,113,.22);
    border-radius: 12px;
    margin-bottom: 18px;
  }
  .errorBox p {
    color: #f87171;
    font-size: .84rem;
    font-weight: 500;
    margin-bottom: 12px;
  }
  .btnRetry {
    padding: 7px 20px;
    border: none;
    border-radius: 8px;
    font-size: .78rem;
    font-weight: 600;
    cursor: pointer;
    background: #f87171;
    color: #fff;
    transition: filter .15s;
  }
  .btnRetry:hover {
    filter: brightness(1.15);
  }

  /* Stats grid */
  .statsGrid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 14px;
  }
  .statCard {
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 18px 14px;
    text-align: center;
    transition: border-color .2s, background .2s;
  }
  .statCard:hover {
    border-color: #475569;
    background: #111827;
  }
  .statIcon {
    font-size: 1.3rem;
    margin-bottom: 6px;
  }
  .statValue {
    font-size: 1.2rem;
    font-weight: 800;
    color: #818cf8;
    margin-bottom: 2px;
  }
  .statLabel {
    font-size: .7rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: .04em;
    font-weight: 500;
  }

  /* Server info */
  .serverInfo {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    background: rgba(99,102,241,.06);
    border: 1px solid rgba(99,102,241,.12);
    border-radius: 10px;
    margin-bottom: 18px;
    font-size: .72rem;
    color: #94a3b8;
    font-family: 'SF Mono', 'Fira Code', monospace;
  }
  .serverInfo strong {
    color: #a5b4fc;
    font-weight: 600;
  }

  /* Controls */
  .controls {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .btnRefresh {
    padding: 9px 18px;
    border: none;
    border-radius: 10px;
    font-size: .78rem;
    font-weight: 600;
    cursor: pointer;
    background: #818cf8;
    color: #fff;
    transition: filter .15s, transform .1s;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .btnRefresh:hover {
    filter: brightness(1.1);
  }
  .btnRefresh:active {
    transform: scale(.97);
  }
  .btnRefresh:disabled {
    opacity: .4;
    cursor: not-allowed;
    filter: none;
    transform: none;
  }
  .btnClear {
    padding: 9px 16px;
    border: 1px solid #334155;
    border-radius: 10px;
    font-size: .76rem;
    font-weight: 500;
    cursor: pointer;
    background: transparent;
    color: #64748b;
    transition: border-color .15s, color .15s;
  }
  .btnClear:hover {
    border-color: #64748b;
    color: #cbd5e1;
  }
`;
