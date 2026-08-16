/**
 * AI 01 — Streaming chat UI.
 *
 * Zero-VDOM: the component executes ONCE. Every token from `chat()`
 * appends to a store property and the compiler-patched bindText mutates
 * exactly one TextNode — no re-render, no diffing.
 */
import { component, store } from '@bpjs159/core';
import { chat, summarize } from './ai.js';

const css = `
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:system-ui,-apple-system,sans-serif;background:#0f172a;color:#e2e8f0;padding:48px 20px}
  .wrap{max-width:720px;margin:0 auto}
  h1{font-size:1.4rem;font-weight:800;letter-spacing:-.02em;margin-bottom:6px}
  .sub{font-size:.82rem;color:#64748b;margin-bottom:28px}
  .sub code{background:rgba(139,77,255,.15);color:#c4a0ff;padding:1px 7px;border-radius:4px}
  .row{display:flex;gap:10px;margin-bottom:18px}
  input{flex:1;background:#1e293b;border:1px solid #334155;border-radius:10px;color:#e2e8f0;padding:12px 16px;font-size:.9rem;outline:none}
  input:focus{border-color:#8b4dff}
  button{background:linear-gradient(135deg,#8b4dff,#4d7cff);border:none;border-radius:10px;color:#fff;font-weight:700;padding:12px 22px;cursor:pointer;font-size:.85rem}
  button:disabled{opacity:.5;cursor:default}
  .status{font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:#64748b;margin-bottom:8px}
  .status.streaming{color:#34d399}
  .status.error{color:#f87171}
  .box{background:#1e293b;border:1px solid #334155;border-radius:12px;padding:18px 20px;min-height:96px;font-size:.88rem;line-height:1.7;white-space:pre-wrap}
  .cursor{display:inline-block;width:8px;height:15px;background:#34d399;vertical-align:-2px;animation:blink 1s steps(2) infinite;margin-left:2px}
  @keyframes blink{50%{opacity:0}}
  .sum{margin-top:28px}
  .sum h2{font-size:.95rem;color:#e2e8f0;margin-bottom:10px}
`;

const state = store({ q: '', answer: '', status: 'idle' as 'idle' | 'streaming' | 'done' | 'error' });

export const ChatApp = component(() => {
  const send = () => {
    const question = state.q.trim();
    if (!question || state.status === 'streaming') return;
    state.status = 'streaming';
    state.answer = '';
    chat(question, (chunk: string) => {
      // Physical DOM mutation per chunk — the store write triggers the
      // compiler-generated bindText update for exactly one TextNode.
      state.answer += chunk;
    })
      .then(() => { state.status = 'done'; })
      .catch((err: Error) => { state.status = 'error'; state.answer = err.message; });
  };

  const doSummarize = async () => {
    const question = state.q.trim();
    if (!question) return;
    const res = await summarize(question);
    state.answer = res.text;
    state.status = 'done';
  };

  return (
    <div class="wrap">
      <style>{css}</style>
      <h1>AI 01 — Streaming Chat</h1>
      <p class="sub">
        <code>aiStream()</code> tokens reach the DOM as direct mutations — the component ran <strong>once</strong>.
      </p>

      <div class="row">
        <input
          placeholder="Ask anything…"
          oninput={(e: Event) => { state.q = (e.target as HTMLInputElement).value; }}
        />
        <button onclick={send} disabled={state.status === 'streaming'}>Stream</button>
        <button onclick={doSummarize}>Summarize</button>
      </div>

      <div class="status">{state.status}</div>
      <div class="box">
        {state.answer}
        {state.status === 'streaming' ? <span class="cursor"></span> : null}
      </div>

      <div class="sum">
        <h2>What's happening</h2>
        <p class="sub">
          <code>summarize</code> is an <code>ai()</code> endpoint (ISR-cached, <code>maxAge: 300</code>).
          <code>chat</code> is an <code>aiStream()</code> endpoint piped through the server token by token.
        </p>
      </div>
    </div>
  );
});
