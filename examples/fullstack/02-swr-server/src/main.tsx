// 02 — SWR + Server · Stale-While-Revalidate with server functions
import { component, swr } from '@bpjs159/core';
import type { SWRState } from '@bpjs159/core';
import { server } from '@bpjs159/server';

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  revenue: number;
  serverTimestamp: string;
  serverId: string;
}

const getDashboardStats = server(async () => {
  return {
    totalUsers: 12400 + Math.floor(Math.random() * 200),
    totalOrders: 3800 + Math.floor(Math.random() * 300),
    revenue: 95600 + Math.floor(Math.random() * 5000),
    serverTimestamp: new Date().toISOString(),
    serverId: crypto.randomUUID().slice(0, 8),
  };
});

export const SWRDemo = component(() => {
  // Wrap server call with simulated network delay so SWR behavior is visible
  const stats: SWRState<DashboardStats> = swr(async () => {
    await new Promise(r => setTimeout(r, 1500));
    return getDashboardStats();
  });

  return (
    <div class="card">
      <div class="header">
        <h1>SWR + Server</h1>
        <p>
          <code>swr</code> + <code>server</code> — auto cache, localStorage, stale-while-revalidate
        </p>
      </div>
      <div class="body">
        {stats.loading && !stats.stale && (
          <div class="loadingBox">
            <div class="spinner" />
            <p>Fetching dashboard stats from server...</p>
          </div>
        )}
        {stats.stale && !stats.loading && (
          <div class="staleBar">
            Showing cached data — revalidating in background...
            <div class="spinnerSm" />
          </div>
        )}
        {stats.error && (
          <div class="errorBox">
            <p>Error: {stats.error}</p>
            <button class="btnRetry" onClick={() => stats.refetch()}>Retry</button>
          </div>
        )}
        {stats.data && !stats.loading && !stats.error && (
          <div>
            <div class="statsGrid">
              <div class="statCard">
                <div class="statIcon">Users</div>
                <div class="statValue">{stats.data.totalUsers.toLocaleString()}</div>
                <div class="statLabel">Total Users</div>
              </div>
              <div class="statCard">
                <div class="statIcon">Orders</div>
                <div class="statValue">{stats.data.totalOrders.toLocaleString()}</div>
                <div class="statLabel">Total Orders</div>
              </div>
              <div class="statCard">
                <div class="statIcon">Revenue</div>
                <div class="statValue">${stats.data.revenue.toLocaleString()}</div>
                <div class="statLabel">Revenue</div>
              </div>
            </div>
            <div class="serverInfo">
              <span>Server ID: <strong>{stats.data.serverId}</strong></span>
              <span>{new Date(stats.data.serverTimestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        )}
        <div class="controls">
          <button class="btnRefresh" onClick={() => stats.refetch()} disabled={stats.loading}>
            {stats.loading ? 'Fetching...' : 'Refresh'}
          </button>
          <button class="btnClear" onClick={() => { localStorage.clear(); stats.refetch(); }}>
            Clear cache
          </button>
        </div>
      </div>
    </div>
  );
});
