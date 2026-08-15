/**
 * AI 04 — RAG UI: ask, and also see which chunks were retrieved.
 */
import { component, store } from '@astrajs/core';
import { askDocs, searchDocs } from './server.js';

const css = `
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:system-ui,-apple-system,sans-serif;background:#0f172a;color:#e2e8f0;padding:48px 20px}
  .wrap{max-width:720px;margin:0 auto}
  h1{font-size:1.4rem;font-weight:800;letter-spacing:-.02em;margin-bottom:6px}
  .sub{font-size:.82rem;color:#64748b;margin-bottom:28px;line-height:1.7}
  .sub code{background:rgba(139,77,255,.15);color:#c4a0ff;padding:1px 7px;border-radius:4px}
  .row{display:flex;gap:10px;margin-bottom:18px}
  input{flex:1;background:#1e293b;border:1px solid #334155;border-radius:10px;color:#e2e8f0;padding:12px 16px;font-size:.9rem;outline:none}
  input:focus{border-color:#8b4dff}
  button{background:linear-gradient(135deg,#8b4dff,#4d7cff);border:none;border-radius:10px;color:#fff;font-weight:700;padding:12px 22px;cursor:pointer;font-size:.85rem}
  .status{font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:#64748b;margin-bottom:8px}
  .answer{background:#1e293b;border:1px solid #334155;border-radius:12px;padding:18px 20px;min-height:70px;font-size:.88rem;line-height:1.7;white-space:pre-wrap;margin-bottom:20px}
  h2{font-size:.9rem;color:#e2e8f0;margin-bottom:10px}
  .chunk{display:flex;gap:10px;align-items:flex-start;background:#162032;border:1px solid #334155;border-radius:10px;padding:10px 14px;margin-bottom:8px;font-size:.78rem;color:#94a3b8;line-height:1.6}
  .score{color:#34d399;font-weight:700;white-space:nowrap;font-size:.7rem;margin-top:2px}
`;

const state = store({ q: '', answer: '', busy: false, chunks: [] as { text: string; score: number }[] });

export const RagApp = component(() => {
  const ask = async () => {
    const question = state.q.trim();
    if (!question || state.busy) return;
    state.busy = true;
    state.answer = '…';
    state.chunks = [];
    try {
      const [answer, chunks] = await Promise.all([askDocs(question), searchDocs(question, 3)]);
      state.answer = answer;
      state.chunks = chunks;
    } catch (err) {
      state.answer = (err as Error).message;
    }
    state.busy = false;
  };

  return (
    <div class="wrap">
      <style>{css}</style>
      <h1>AI 04 — RAG</h1>
      <p class="sub">
        Ask about <code>AstraJS</code> — the answer is grounded on an indexed knowledge base
        (<code>@astrajs/ai/rag</code>), and you can see which chunks were retrieved.
      </p>

      <div class="row">
        <input
          placeholder='e.g. "How does AstraJS deploy?"'
          oninput={(e: Event) => { state.q = (e.target as HTMLInputElement).value; }}
        />
        <button onclick={ask}>Ask</button>
      </div>

      <div class="status">{state.busy ? 'searching…' : 'ready'}</div>
      <div class="answer">{state.answer}</div>

      <h2>Retrieved chunks</h2>
      <div>
        {state.chunks.map((c) => (
          <div class="chunk">
            <span class="score">{c.score.toFixed(3)}</span>
            <span>{c.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
});
