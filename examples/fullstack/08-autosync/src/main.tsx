// 08 — AutoSync · ETag polling keeps a store fresh without full reloads
import { component, store, mounted } from '@bpjs159/core';
import { server, autoSync } from '@bpjs159/server';

// Shared "server" state — mutated independently of this tab (another
// customer, another process, whatever). This is what autoSync discovers.
let stockLevel = 42;

// autoSync: true marks the generated handler to compute an ETag (a hash of
// the JSON result) and honor `If-None-Match` — unchanged polls cost a 304.
// autoSyncInterval: 5000 means the client will poll every 5s, but only if
// the component is mounted. If the user navigates away, polling stops.
// The value by default is 3000ms (3s) if you don't specify it.
const getStock = server({ autoSync: true, autoSyncInterval: 5000 }, async () => ({ level: stockLevel }));

// A plain server() call — no autoSync needed here, it only writes state.
// This tab finds out about its own change the same way it'd find out
// about anyone else's: through the next autoSync poll, not directly.
const simulateSale = server(async () => {
  stockLevel = Math.max(0, stockLevel - 1);
  return { level: stockLevel };
});

const state = store({
  level: 0,
  lastSync: null as string | null,
  log: [] as string[],
});

function timestamp(): string {
  return new Date().toLocaleTimeString();
}

export const AutoSyncDemo = component(() => {
  mounted(() => {
    state.lastSync = timestamp();

    // Initial load — don't wait for the first poll tick. The compiler
    // reuses this exact callback as the autoSync onUpdate handler too, so
    // every poll (real change or not) logs an entry here.
    getStock().then((data) => {
      state.level = data.level;
      state.lastSync = timestamp();
      state.log = [`${timestamp()} → ${data.level} units`, ...state.log].slice(0, 5);
    });
  });

  return (
    <div class="card">
      <div class="header">
        <h1>AutoSync</h1>
        <p>ETag polling keeps stock fresh — even when another client changes it</p>
      </div>
      <div class="body">
        <div class="stock">
          <span class="stockValue">{state.level}</span>
          <span class="stockLabel">units in stock</span>
        </div>
        <p class="hint">Last synced: {state.lastSync ?? '—'}</p>
        <button class="buyBtn" onClick={() => simulateSale()}>
          Simulate a sale (another customer)
        </button>
        <p class="hint">The button doesn't update the number directly — wait up to 5s for autoSync to notice.</p>
        <div class="log">
          {state.log.map(entry => <div class="logRow">{entry}</div>)}
        </div>
      </div>
    </div>
  );
});
