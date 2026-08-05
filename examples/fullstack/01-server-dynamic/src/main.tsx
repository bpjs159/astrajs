import { component, store } from '@astrajs/core';
import { server } from '@astrajs/server';
import { styles as s } from './styles.js';

// ─── Types ───────────────────────────────────────────────────────────────────

interface LogEntry { id: number; endpoint: string; status: string; result: string; time: string; args: unknown[]; }

// ─── Store ───────────────────────────────────────────────────────────────────

const logEntryStore = store({ logs: [] as LogEntry[], counter: 0 });

// ─── server functions ───────────────────────────────────────────────────────
// Each server function is a single function. The AstraJS compiler splits it into:
//   Client → typed fetch wrapper
//   Server → endpoint handler
// You write ONE function. The compiler does the rest.

const createUser = server(async (name: string, email: string) => {
  return { ok: true, data: { id: crypto.randomUUID(), name, email } };
});

const updateProduct = server(async (productId: string, updates: { price: number }) => {
  return { ok: true, data: { id: productId, price: updates.price } };
});

const deleteOrder = server(async (orderId: string) => {
  const existed = Math.random() > 0.3;
  return { ok: true, data: { id: orderId, deleted: existed } };
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function tagClass(status: string): string {
  return status === 'success' ? (s.logTagOk ?? '') : status === 'error' ? (s.logTagErr ?? '') : (s.logTagPending ?? '');
}
function tagLabel(status: string): string {
  return status === 'success' ? 'OK' : status === 'error' ? 'ERR' : 'PENDING';
}
function statusClass(status: string): string {
  return status === 'success' ? (s.logSuccess ?? '') : status === 'error' ? (s.logError ?? '') : (s.logLoading ?? '');
}
function resultClass(status: string): string {
  return status === 'success' ? (s.logResultSuccess ?? '') : status === 'error' ? (s.logResultError ?? '') : (s.logResultLoading ?? '');
}

function addLog(endpoint: string, args: unknown[]): number {
  const id = ++logEntryStore.counter;
  logEntryStore.logs = [...logEntryStore.logs, {
    id, endpoint, status: 'loading', result: 'Sending request...',
    time: new Date().toLocaleTimeString(), args: [...args],
  }];
  return id;
}

function updateLog(id: number, status: string, result: string): void {
  logEntryStore.logs = logEntryStore.logs.map(l =>
    l.id === id ? { ...l, status, result } : l
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export const ServerDemo = component(() => {
  async function handleCreateUser() {
    const id = addLog('createUser', ['Alice', 'alice@example.com']);
    try {
      const result = await createUser('Alice', 'alice@example.com');
      updateLog(id, 'success', JSON.stringify(result, null, 2));
    } catch (err) {
      updateLog(id, 'error', err instanceof Error ? err.message : 'Unknown error');
    }
  }

  async function handleUpdateProduct() {
    const id = addLog('updateProduct', ['prod_42', { price: 199 }]);
    try {
      const result = await updateProduct('prod_42', { price: 199 });
      updateLog(id, 'success', JSON.stringify(result, null, 2));
    } catch (err) {
      updateLog(id, 'error', err instanceof Error ? err.message : 'Unknown error');
    }
  }

  async function handleDeleteOrder() {
    const id = addLog('deleteOrder', ['ord_007']);
    try {
      const result = await deleteOrder('ord_007');
      updateLog(id, 'success', JSON.stringify(result, null, 2));
    } catch (err) {
      updateLog(id, 'error', err instanceof Error ? err.message : 'Unknown error');
    }
  }

  return (
    <div class={s.card}>
      {/* ── Header ─────────────────────────────────── */}
      <div class={s.header}>
        <h1>Dynamic Server</h1>
        <p>
          Server functions via typed <code>fetch()</code> wrappers.
          Write one function — runs on the server, called from the client.
        </p>
      </div>

      {/* ── Body ───────────────────────────────────── */}
      <div class={s.body}>
        {/* Flow diagram */}
        <div class={s.flow}>
          <div class={s.flowStep}>
            <strong>Client</strong>
            <span>your fn</span>
          </div>
          <span class={s.flowArrow}>→</span>
          <div class={s.flowStep}>
            <strong>fetch</strong>
            <span>astra server</span>
          </div>
          <span class={s.flowArrow}>→</span>
          <div class={s.flowStep}>
            <strong>Server</strong>
            <span>handler</span>
          </div>
          <span class={s.flowArrow}>→</span>
          <div class={s.flowStep}>
            <strong>JSON</strong>
            <span>response</span>
          </div>
        </div>

        {/* Action buttons */}
        <div class={s.actions}>
          <button class={s.btnFetch} onClick={handleCreateUser}>
            👤 Create User
          </button>
          <button class={s.btnFetch} onClick={handleUpdateProduct}>
            📦 Update Product
          </button>
          <button class={s.btnFetch} onClick={handleDeleteOrder}>
            🗑 Delete Order
          </button>
          <button class={s.btnClear} onClick={() => logEntryStore.logs = []}>
            ✕ Clear
          </button>
        </div>

        {/* Log output */}
        <div class={s.resultBox}>
          {logEntryStore.logs.length === 0 ? (
            <div class={s.emptyState}>
              <div class={s.emptyIcon}>📡</div>
              Click a button to call a server function
            </div>
          ) : null}
          {logEntryStore.logs.slice(-8).reverse().map(l => (
            <div class={s.logEntry}>
              <div class={`${s.logStatus} ${statusClass(l.status)}`}></div>
              <div class={s.logBody}>
                <div class={s.logMeta}>
                  <span class={s.logTime}>{l.time}</span>
                  <span class={s.logEndpoint}>{l.endpoint}</span>
                  <span class={`${s.logTag} ${tagClass(l.status)}`}>
                    {tagLabel(l.status)}
                  </span>
                </div>
                <div class={s.logArgs}>args: {JSON.stringify(l.args)}</div>
                <div class={`${s.logResult} ${resultClass(l.status)}`}>
                  {l.result}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
