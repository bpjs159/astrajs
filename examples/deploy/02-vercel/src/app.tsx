/**
 * Deploy 02 — Vercel · App component
 */
import { component, store } from '@bpjs159/core';
import { getQuote, getStats, addVisit, type Quote } from './server.js';

const style = `
  .card{background:#1e293b;border:1px solid #334155;border-radius:20px;padding:28px 32px;max-width:560px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,.2)}
  h1{font-size:1.25rem;color:#f1f5f9;margin:0 0 4px}
  .sub{font-size:.8rem;color:#64748b;margin:0 0 20px}
  .row{display:flex;gap:8px;margin-bottom:18px;flex-wrap:wrap}
  button{background:#6366f1;color:#fff;border:none;border-radius:10px;padding:9px 16px;font-size:.82rem;font-weight:600;cursor:pointer}
  button:hover{filter:brightness(1.12)}
  pre{background:#0f172a;border:1px solid #334155;border-radius:12px;padding:14px;font-size:.78rem;font-family:'JetBrains Mono',monospace;white-space:pre-wrap;min-height:46px}
`;

export const DeployApp = component(() => {
  const state = store({ output: 'Click a button → the handler runs on a serverless function.' });

  const runQuote = async () => {
    state.output = '…';
    const quote: Quote = await getQuote();
    state.output = JSON.stringify(quote, null, 2);
  };

  const runStats = async () => {
    state.output = '…';
    state.output = JSON.stringify(await getStats(), null, 2);
  };

  const runVisit = async () => {
    state.output = '…';
    state.output = JSON.stringify(await addVisit('/'), null, 2);
  };

  return (
    <div class="card">
      <style>{style}</style>
      <h1>Vercel Adapter</h1>
      <p class="sub">One serverless function for every RPC endpoint. ISR via s-maxage.</p>
      <div class="row">
        <button onclick={runQuote}>Random quote</button>
        <button onclick={runStats}>Stats (ISR 60s)</button>
        <button onclick={runVisit}>Mutation</button>
      </div>
      <pre>{state.output}</pre>
    </div>
  );
});
