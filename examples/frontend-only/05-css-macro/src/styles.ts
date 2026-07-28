/**
 * 05 — CSS Macro · Theme Styles
 *
 * CSS custom properties for light/dark themes, defined inside the
 * `css\\`...\\`` macro. At build time, this is extracted to a static
 * `.css` file — zero runtime cost.
 *
 * The `system` mode uses `@media (prefers-color-scheme: dark)` so the
 * OS-level preference is respected without any JavaScript.
 */
import { css } from '@astrajs/compiler/css';

export const styles = css`
  /* ── Base card ────────────────────────────────────────────────── */
  .card {
    padding: 32px;
    border-radius: 16px;
    text-align: center;
    transition: background .3s, color .3s, box-shadow .3s;
    cursor: pointer;

    /* Light theme (default) */
    --bg: #ffffff;
    --text: #1e293b;
    --text-secondary: #64748b;
    --accent: #6366f1;
    --border: #e2e8f0;

    background: var(--bg);
    color: var(--text);
    border: 1px solid var(--border);
  }

  /* ── Dark theme override ──────────────────────────────────────── */
  .card[data-theme="dark"] {
    --bg: #1e293b;
    --text: #f1f5f9;
    --text-secondary: #94a3b8;
    --accent: #818cf8;
    --border: #334155;
  }

  /* ── System: respect OS preference ────────────────────────────── */
  @media (prefers-color-scheme: dark) {
    .card[data-theme="system"] {
      --bg: #1e293b;
      --text: #f1f5f9;
      --text-secondary: #94a3b8;
      --accent: #818cf8;
      --border: #334155;
    }
  }

  .card:hover {
    box-shadow: 0 4px 24px rgba(0,0,0,.12);
  }

  .card h2 { font-size: 1.4rem; margin-bottom: 4px; color: var(--text); }
  .card .badge {
    display: inline-block;
    background: var(--accent);
    color: #fff;
    padding: 4px 14px;
    border-radius: 20px;
    font-size: .75rem;
    font-weight: 600;
    margin-bottom: 12px;
  }
  .card p { font-size: .9rem; color: var(--text-secondary); }

  /* ── Code block ───────────────────────────────────────────────── */
  .code-block {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 14px;
    padding: 24px;
    overflow-x: auto;
    display: flex;
    align-items: center;
  }
  .code-block pre {
    font-family: 'JetBrains Mono', monospace;
    font-size: .82rem;
    color: #94a3b8;
    line-height: 1.7;
    margin: 0;
  }
  .code-block .kw { color: #818cf8; }
  .code-block .str { color: #34d399; }
  .code-block .fn { color: #fbbf24; }
  .code-block .prop { color: #f472b6; }
`;
