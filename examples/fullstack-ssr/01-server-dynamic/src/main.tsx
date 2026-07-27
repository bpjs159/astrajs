import { component, store } from '@astrajs/core';
import { styles as s } from './styles.js';

interface LogEntry { id: number; endpoint: string; status: string; result: string; time: string; }

const st = store({ logs: [] as LogEntry[], counter: 0 });

async function simulateRPC(endpoint: string, args: unknown[]): Promise<void> {
  const id = ++st.counter;
  const entry: LogEntry = { id, endpoint, status: 'loading', result: 'Pending...', time: new Date().toLocaleTimeString() };
  st.logs = [...st.logs, entry];
  await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));
  const success = Math.random() > 0.2;
  st.logs = st.logs.map(l => l.id === id ? { ...l, status: success ? 'success' : 'error', result: success ? JSON.stringify({ ok: true, data: { id: crypto.randomUUID(), args } }) : '500 Internal Server Error' } : l);
}

export const RPCDemo = component(() => {
  return (
    <div class={s.card}>
      <h1>Dynamic server$</h1>
      <p class={s.subtitle}>RPC calls via typed <code>fetch()</code> wrappers</p>
      <div class={s.flow}>
        <span class={s.flowStep}><strong>Client</strong>server</span>
        <span>?</span>
        <span class={s.flowStep}><strong>fetch()</strong>/api/rpc/endpoint</span>
        <span>?</span>
        <span class={s.flowStep}><strong>Server</strong>handleRPCRequest()</span>
        <span>?</span>
        <span class={s.flowStep}><strong>JSON</strong>Response</span>
      </div>
      <div style="display:flex;gap:8px;margin:16px 0;">
        <button class={s.btnFetch} onClick={() => simulateRPC('/api/rpc/createUser', ['Alice','alice@example.com'])}>Create User</button>
        <button class={s.btnFetch} onClick={() => simulateRPC('/api/rpc/updateProduct', ['prod_42',{price:199}])}>Update Product</button>
        <button class={s.btnFetch} onClick={() => simulateRPC('/api/rpc/deleteOrder', ['ord_007'])}>Delete Order</button>
        <button class={s.btnClear} onClick={() => st.logs = []}>Clear</button>
      </div>
      <div class={s.resultBox}>
        {st.logs.length === 0 ? <span style="color:#64748b;">Click a button to make an RPC call...</span> : null}
        {st.logs.slice(-8).map(l => (
          <div style={l.status === 'success' ? 'color:#34d399' : l.status === 'error' ? 'color:#f87171' : 'color:#fbbf24'}>[{l.time}] <strong>{l.endpoint}</strong>({JSON.stringify(args)}) ? {l.result}</div>
        ))}
      </div>
    </div>
  );
});
