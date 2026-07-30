import { component, store } from '@astrajs/core';
import { server } from '@astrajs/server';
import { styles as s } from './styles.js';

// ─── Types ───────────────────────────────────────────────────────────────────

interface LogEntry { id: number; endpoint: string; status: string; result: string; time: string; args: unknown[]; }

// ─── Store ───────────────────────────────────────────────────────────────────

const logEntryStore = store({ logs: [] as LogEntry[], counter: 0 });

// ─── server functions ───────────────────────────────────────────────────────
// Each server() call is a single function. The AstraJS compiler splits it into:
//   Client → typed fetch() wrapper
//   Server → endpoint handler
// You write ONE function. The compiler does the rest.

const createUser = server(async (name: string, email: string) => {
  return { ok: true, data: { id: crypto.randomUUID(), name, email } };
});

const updateProduct = server(async (productId: string, updates: { price: number }) => {
  return { ok: true, data: { id: productId, price: updates.price } };
});

const deleteOrder = server(async (orderId: string) => {
  // Simulated: 70% chance the order exists
  const existed = Math.random() > 0.3;
  return { ok: true, data: { id: orderId, deleted: existed } };
});

export const ServerDemo = component(() => {
  async function handleCreateUser() {
    const args = ['Alice', 'alice@example.com'] as const;
    const id = ++logEntryStore.counter;
    logEntryStore.logs = [...logEntryStore.logs, {
      id, endpoint: '/api/astra/createUser', status: 'loading', result: 'Pending...',
      time: new Date().toLocaleTimeString(), args: [...args],
    }];
    try {
      const result = await createUser(...args);
      logEntryStore.logs = logEntryStore.logs.map(l =>
        l.id === id ? { ...l, status: 'success', result: JSON.stringify(result) } : l
      );
    } catch (err) {
      logEntryStore.logs = logEntryStore.logs.map(l =>
        l.id === id ? { ...l, status: 'error', result: err instanceof Error ? err.message : 'Unknown error' } : l
      );
    }
  }

  async function handleUpdateProduct() {
    const args = ['prod_42', { price: 199 }] as const;
    const id = ++logEntryStore.counter;
    logEntryStore.logs = [...logEntryStore.logs, {
      id, endpoint: '/api/astra/updateProduct', status: 'loading', result: 'Pending...',
      time: new Date().toLocaleTimeString(), args: [...args],
    }];
    try {
      const result = await updateProduct(...args);
      logEntryStore.logs = logEntryStore.logs.map(l =>
        l.id === id ? { ...l, status: 'success', result: JSON.stringify(result) } : l
      );
    } catch (err) {
      logEntryStore.logs = logEntryStore.logs.map(l =>
        l.id === id ? { ...l, status: 'error', result: err instanceof Error ? err.message : 'Unknown error' } : l
      );
    }
  }

  async function handleDeleteOrder() {
    const args = ['ord_007'] as const;
    const id = ++logEntryStore.counter;
    logEntryStore.logs = [...logEntryStore.logs, {
      id, endpoint: '/api/astra/deleteOrder', status: 'loading', result: 'Pending...',
      time: new Date().toLocaleTimeString(), args: [...args],
    }];
    try {
      const result = await deleteOrder(...args);
      logEntryStore.logs = logEntryStore.logs.map(l =>
        l.id === id ? { ...l, status: 'success', result: JSON.stringify(result) } : l
      );
    } catch (err) {
      logEntryStore.logs = logEntryStore.logs.map(l =>
        l.id === id ? { ...l, status: 'error', result: err instanceof Error ? err.message : 'Unknown error' } : l
      );
    }
  }

  return (
    <div class={s.card}>
      <h1>Dynamic server</h1>
      <p class={s.subtitle}>Server functions via typed <code>fetch()</code> wrappers</p>
      <div class={s.flow}>
        <span class={s.flowStep}><strong>Client</strong>server</span>
        <span>?</span>
        <span class={s.flowStep}><strong>fetch()</strong>/api/astra/endpoint</span>
        <span>?</span>
        <span class={s.flowStep}><strong>Server</strong>handler</span>
        <span>?</span>
        <span class={s.flowStep}><strong>JSON</strong>Response</span>
      </div>
      <div style="display:flex;gap:8px;margin:16px 0;">
        <button class={s.btnFetch} onClick={handleCreateUser}>Create User</button>
        <button class={s.btnFetch} onClick={handleUpdateProduct}>Update Product</button>
        <button class={s.btnFetch} onClick={handleDeleteOrder}>Delete Order</button>
        <button class={s.btnClear} onClick={() => logEntryStore.logs = []}>Clear</button>
      </div>
      <div class={s.resultBox}>
        {logEntryStore.logs.length === 0 ? <span style="color:#64748b;">Click a button to call a server function...</span> : null}
        {logEntryStore.logs.slice(-8).map(l => (
          <div style={l.status === 'success' ? 'color:#34d399' : l.status === 'error' ? 'color:#f87171' : 'color:#fbbf24'}>[{l.time}] <strong>{l.endpoint}</strong>({JSON.stringify(l.args)}) ? {l.result}</div>
        ))}
      </div>
    </div>
  );
});
