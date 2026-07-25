/**
 * 08 — SWR & AutoSync
 *
 * Stale-While-Revalidate: show cached data immediately, refresh in background.
 * AutoSync: ETag-based polling keeps the client in sync with the server.
 */

import { store, effect } from '@astrajs/core';

// ─── Simulated SWR Store ─────────────────────────────────────────────────────
const swrState = store({
  data: 'Loading...' as string,
  lastFetched: 0 as number,
  isStale: true,
  isValidating: false,
  logs: [] as string[],
  autoSyncEnabled: false,
  syncInterval: null as ReturnType<typeof setInterval> | null,
});

// ─── SWR Fetcher ─────────────────────────────────────────────────────────────
async function fetchWithSWR(): Promise<void> {
  if (swrState.isValidating) return;

  // Return stale data immediately if available
  if (swrState.data !== 'Loading...' && !swrState.isStale) {
    addLog('📦 Served stale data (instant)', 'stale');
  }

  swrState.isValidating = true;
  addLog('🔄 Revalidating in background...', 'stale');

  // Simulate fetch
  await new Promise((r) => setTimeout(r, 1500));

  const now = Date.now();
  swrState.data = `Data v${Math.floor(Math.random() * 100)} (fetched at ${new Date().toLocaleTimeString()})`;
  swrState.lastFetched = now;
  swrState.isStale = false;
  swrState.isValidating = false;

  addLog('✅ Fresh data arrived!', 'fresh');

  // Auto-stale after 10 seconds
  setTimeout(() => { swrState.isStale = true; }, 10000);
}

function addLog(msg: string, type: 'stale' | 'fresh'): void {
  const prefix = type === 'stale' ? '⚠️' : '✅';
  swrState.logs = [...swrState.logs.slice(-20), `[${new Date().toLocaleTimeString()}] ${prefix} ${msg}`];
}

function toggleAutoSync(): void {
  swrState.autoSyncEnabled = !swrState.autoSyncEnabled;
  if (swrState.autoSyncEnabled) {
    addLog('🟢 AutoSync enabled (polling every 5s)', 'fresh');
    const interval = setInterval(() => { swrState.isStale = true; fetchWithSWR(); }, 5000);
    swrState.syncInterval = interval;
  } else {
    addLog('🔴 AutoSync disabled', 'stale');
    if (swrState.syncInterval) clearInterval(swrState.syncInterval);
    swrState.syncInterval = null;
  }
}

// ─── Mount ───────────────────────────────────────────────────────────────────
const app = document.getElementById('app')!;

function render(): void {
  const age = swrState.lastFetched ? Math.round((Date.now() - swrState.lastFetched) / 1000) : 0;
  const dotClass = swrState.isValidating ? 'dot-syncing' : swrState.isStale ? 'dot-stale' : 'dot-fresh';
  const statusText = swrState.isValidating ? 'Syncing...' : swrState.isStale ? 'Stale' : 'Fresh';

  app.innerHTML = `
    <div class="card">
      <h1>🔄 SWR & AutoSync</h1>
      <p class="subtitle">Stale-While-Revalidate + ETag polling</p>

      <div class="metric">
        <div>
          <div class="label">Cached Data</div>
          <div class="value" style="font-size:.95rem;">${swrState.data}</div>
          <div class="age">Age: ${age}s ago</div>
          <div class="status">
            <span class="dot ${dotClass}"></span>
            <span style="font-size:.75rem;">${statusText}</span>
          </div>
        </div>
      </div>

      <div style="display:flex;gap:8px;">
        <button class="btn btn-refresh" id="btn-refresh" ${swrState.isValidating ? 'disabled' : ''}>
          🔄 Force Refresh
        </button>
        <button class="btn btn-auto" id="btn-autosync">
          ${swrState.autoSyncEnabled ? '⏹ Stop' : '▶'} AutoSync
        </button>
        <button class="btn btn-invalidate" id="btn-invalidate">
          🗑 Invalidate Cache
        </button>
      </div>

      <div class="log">
        ${swrState.logs.map((l) => `<div class="${l.includes('⚠️') ? 'stale' : 'fresh'}">${l}</div>`).join('')}
      </div>
    </div>
  `;

  document.getElementById('btn-refresh')!.onclick = () => { swrState.isStale = true; fetchWithSWR(); };
  document.getElementById('btn-autosync')!.onclick = toggleAutoSync;
  document.getElementById('btn-invalidate')!.onclick = () => {
    swrState.isStale = true;
    addLog('🗑 Cache invalidated', 'stale');
  };
}

effect(() => { render(); });
render();
fetchWithSWR();

(window as any).swrState = swrState;
