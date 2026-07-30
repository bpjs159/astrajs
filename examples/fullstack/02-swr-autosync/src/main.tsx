import { component, store, mounted } from '@astrajs/core';
import { styles as s } from './styles.js';

const swrState = store({ data: 'Loading...', lastFetched: 0, isStale: true, isValidating: false, autoSyncEnabled: false, logs: [] as string[] });
let syncInterval: ReturnType<typeof setInterval> | null = null;

async function fetchWithSWR(): Promise<void> {
  if (swrState.isValidating) return;
  swrState.isValidating = true;
  swrState.logs = [...swrState.logs.slice(-20), '[' + new Date().toLocaleTimeString() + '] Revalidating...'];
  await new Promise(r => setTimeout(r, 1500));
  swrState.data = 'Data v' + Math.floor(Math.random() * 100) + ' (at ' + new Date().toLocaleTimeString() + ')';
  swrState.lastFetched = Date.now();
  swrState.isStale = false;
  swrState.isValidating = false;
  swrState.logs = [...swrState.logs.slice(-20), '[' + new Date().toLocaleTimeString() + '] Fresh data arrived!'];
  setTimeout(() => { swrState.isStale = true; }, 10000);
}

function toggleAutoSync(): void {
  swrState.autoSyncEnabled = !swrState.autoSyncEnabled;
  if (swrState.autoSyncEnabled) {
    swrState.logs = [...swrState.logs, 'AutoSync enabled (polling every 5s)'];
    syncInterval = setInterval(() => { swrState.isStale = true; fetchWithSWR(); }, 5000);
  } else {
    swrState.logs = [...swrState.logs, 'AutoSync disabled'];
    if (syncInterval) clearInterval(syncInterval);
  }
}

export const SWRDemo = component(() => {
  const age = swrState.lastFetched ? Math.round((Date.now() - swrState.lastFetched) / 1000) : 0;
  const dotClass = swrState.isValidating ? s.dotSyncing : swrState.isStale ? s.dotStale : s.dotFresh;
  const statusText = swrState.isValidating ? 'Syncing...' : swrState.isStale ? 'Stale' : 'Fresh';

  effect(() => { if (swrState.data === 'Loading...') fetchWithSWR(); });

  return (
    <div class={s.card}>
      <h1>SWR & AutoSync</h1>
      <p class={s.subtitle}>Stale-While-Revalidate + ETag polling</p>
      <div class={s.metric}>
        <div>
          <div class={s.label}>Cached Data</div>
          <div class={s.value} style="font-size:.95rem;">{swrState.data}</div>
          <div class={s.age}>Age: {age}s ago</div>
          <div class={s.status}><span class={dotClass}></span><span style="font-size:.75rem;">{statusText}</span></div>
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class={s.btnRefresh} onClick={() => { swrState.isStale = true; fetchWithSWR(); }} disabled={swrState.isValidating}>Force Refresh</button>
        <button class={s.btnAuto} onClick={toggleAutoSync}>{swrState.autoSyncEnabled ? 'Stop' : 'Start'} AutoSync</button>
        <button class={s.btnInvalidate} onClick={() => { swrState.isStale = true; swrState.logs = [...swrState.logs, 'Cache invalidated']; }}>Invalidate Cache</button>
      </div>
      <div class={s.log}>{swrState.logs.slice(-8).map(l => <div class={l.includes('Revalidating') ? s.stale : s.fresh}>{l}</div>)}</div>
    </div>
  );
});
