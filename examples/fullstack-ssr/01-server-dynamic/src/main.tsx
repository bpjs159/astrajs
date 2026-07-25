/**
 * 07 — Dynamic server$ (RPC Mutations)
 *
 * `server$()` without 'pre-build' creates a fetch-based RPC call.
 * The compiler replaces the function with a typed `fetch()` wrapper.
 * On the server, an API endpoint is created automatically.
 *
 * This demo simulates the compiled client-side fetch wrapper.
 */

import { store, effect } from '@astrajs/core';

// ─── Simulated RPC Client ────────────────────────────────────────────────────
// In production, the Vite compiler transforms:
//   const createUser = server$(async (name:string, email:string) => { ... });
// Into:
//   const createUser = createRPCClient('/api/rpc/createUser');

type RPCState = 'idle' | 'loading' | 'success' | 'error';

interface RPCLog {
  id: number;
  endpoint: string;
  args: unknown[];
  result: string;
  status: RPCState;
  time: string;
}

const state = store({
  logs: [] as RPCLog[],
  counter: 0,
});

// Simulated RPC call (in production this is the compiled fetch wrapper)
async function simulateRPC<T>(endpoint: string, args: unknown[]): Promise<T> {
  const id = ++state.counter;
  const log: RPCLog = {
    id, endpoint, args,
    result: '⏳ Pending...',
    status: 'loading',
    time: new Date().toLocaleTimeString(),
  };
  state.logs = [...state.logs, { ...log }];

  // Simulate network delay
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));

  // Mock response
  const success = Math.random() > 0.2;
  if (!success) {
    const updatedLogs = state.logs.map((l) =>
      l.id === id ? { ...l, result: '❌ 500 Internal Server Error', status: 'error' as RPCState } : l
    );
    state.logs = updatedLogs;
    throw new Error('Server error');
  }

  const result = { ok: true, data: { id: crypto.randomUUID(), args } };
  const updatedLogs = state.logs.map((l) =>
    l.id === id ? { ...l, result: JSON.stringify(result.data), status: 'success' as RPCState } : l
  );
  state.logs = updatedLogs;
  return result as T;
}

// ─── Mount ───────────────────────────────────────────────────────────────────
const app = document.getElementById('app')!;

function render(): void {
  app.innerHTML = `
    <div class="card">
      <h1>🔄 Dynamic server$</h1>
      <p class="subtitle">RPC calls via typed <code>fetch()</code> wrappers</p>

      <div class="flow">
        <div class="flow-step"><strong>Client</strong>server$(fn)</div>
        <span>→</span>
        <div class="flow-step"><strong>fetch()</strong>/api/rpc/endpoint</div>
        <span>→</span>
        <div class="flow-step"><strong>Server</strong>handleRPCRequest()</div>
        <span>→</span>
        <div class="flow-step"><strong>JSON</strong>Response</div>
      </div>

      <div style="display:flex;gap:8px;margin:16px 0;">
        <button class="btn btn-fetch" id="btn-create">Create User</button>
        <button class="btn btn-fetch" id="btn-update">Update Product</button>
        <button class="btn btn-fetch" id="btn-delete">Delete Order</button>
        <button class="btn btn-clear" id="btn-clear">Clear Logs</button>
      </div>

      <div class="result-box" id="result-box">
        ${state.logs.length === 0 ? '<span style="color:#64748b;">Click a button to make an RPC call...</span>' : ''}
        ${state.logs.slice(-8).map((l) => `
          <div style="margin-bottom:4px;color:${l.status === 'success' ? '#34d399' : l.status === 'error' ? '#f87171' : '#fbbf24'}">
            [${l.time}] <strong>${l.endpoint}</strong>(${JSON.stringify(l.args)}) → ${l.result}
          </div>
        `).join('')}
      </div>

      <p style="margin-top:16px;font-size:.75rem;color:#64748b;text-align:center;">
        ${state.logs.length} RPC call${state.logs.length !== 1 ? 's' : ''} made
      </p>
    </div>
  `;

  document.getElementById('btn-create')!.onclick = () =>
    simulateRPC('/api/rpc/createUser', ['Alice', 'alice@example.com']).catch(() => {});
  document.getElementById('btn-update')!.onclick = () =>
    simulateRPC('/api/rpc/updateProduct', ['prod_42', { price: 199 }]).catch(() => {});
  document.getElementById('btn-delete')!.onclick = () =>
    simulateRPC('/api/rpc/deleteOrder', ['ord_007']).catch(() => {});
  document.getElementById('btn-clear')!.onclick = () => { state.logs = []; };
}

effect(() => { render(); });
render();

(window as any).state = state;
