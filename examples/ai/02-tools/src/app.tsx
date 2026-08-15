/**
 * AI 02 — Tool-calling UI.
 */
import { component, store } from '@astrajs/core';
import { askShop } from './server.js';

const css = `
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:system-ui,-apple-system,sans-serif;background:#0f172a;color:#e2e8f0;padding:48px 20px}
  .wrap{max-width:720px;margin:0 auto}
  h1{font-size:1.4rem;font-weight:800;letter-spacing:-.02em;margin-bottom:6px}
  .sub{font-size:.82rem;color:#64748b;margin-bottom:28px;line-height:1.7}
  .sub code{background:rgba(16,185,129,.15);color:#34d399;padding:1px 7px;border-radius:4px}
  .row{display:flex;gap:10px;margin-bottom:18px}
  input{flex:1;background:#1e293b;border:1px solid #334155;border-radius:10px;color:#e2e8f0;padding:12px 16px;font-size:.9rem;outline:none}
  input:focus{border-color:#34d399}
  button{background:linear-gradient(135deg,#10b981,#0ea5e9);border:none;border-radius:10px;color:#fff;font-weight:700;padding:12px 22px;cursor:pointer;font-size:.85rem}
  .status{font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:#64748b;margin-bottom:8px}
  .box{background:#1e293b;border:1px solid #334155;border-radius:12px;padding:18px 20px;min-height:80px;font-size:.88rem;line-height:1.7;white-space:pre-wrap}
  .hint{margin-top:20px;font-size:.8rem;color:#64748b;line-height:1.8}
  .hint strong{color:#34d399}
`;

const state = store({ q: '', answer: '', busy: false });

export const ToolsApp = component(() => {
  const ask = async () => {
    const question = state.q.trim();
    if (!question || state.busy) return;
    state.busy = true;
    state.answer = '…';
    try {
      state.answer = await askShop(question);
    } catch (err) {
      state.answer = (err as Error).message;
    }
    state.busy = false;
  };

  return (
    <div class="wrap">
      <style>{css}</style>
      <h1>AI 02 — Tool Calling</h1>
      <p class="sub">
        The model decides to call <code>getProduct</code> — your typed <code>server()</code> function —
        and builds the answer from real data. No manual wiring.
      </p>

      <div class="row">
        <input
          placeholder='e.g. "How much does the p1 cost?"'
          oninput={(e: Event) => { state.q = (e.target as HTMLInputElement).value; }}
        />
        <button onclick={ask}>Ask</button>
      </div>

      <div class="status">{state.busy ? 'thinking…' : 'ready'}</div>
      <div class="box">{state.answer}</div>

      <p class="hint">
        <strong>Try:</strong> "How much does the p1 cost?", "What is the stock of the Smart Watch?",
        "Which product costs 299?"
      </p>
    </div>
  );
});
