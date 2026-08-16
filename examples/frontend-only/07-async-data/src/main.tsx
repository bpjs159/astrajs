/**
 * 07 — Async Data & SWR (Stale-While-Revalidate)
 *
 * `swr(fetcher)` — one import, zero boilerplate.
 * Auto cache key · localStorage · stale-while-revalidate · reactive state.
 */
import { component, swr } from '@bpjs159/core';
import type { SWRState } from '@bpjs159/core';
import { styles } from './styles.js';

type User = { id: number; name: string; email: string };

async function fetchUsers(): Promise<User[]> {
  await new Promise(r => setTimeout(r, 1500));
  if (Math.random() < 0.2) throw new Error('Network error — simulated failure');
  return [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com' },
    { id: 3, name: 'Carol Williams', email: 'carol@example.com' },
    { id: 4, name: 'Dave Brown', email: 'dave@example.com' },
  ];
}

const AVATARS = ['av0', 'av1', 'av2', 'av3'] as const;
const initials = (name: string) => name.split(' ').map(w => w[0]).join('');

export const AsyncDataDemo = component(() => {
  const users: SWRState<User[]> = swr(fetchUsers);

  return (
    <div class={styles.card}>
      {/* ── Header ─────────────────────────────────── */}
      <div class={styles.header}>
        <h1>Async Data & SWR</h1>
        <p><code>swr(fetchUsers)</code> — auto cache · localStorage · stale-while-revalidate</p>
      </div>

      <div class={styles.body}>
        {/* ── Loading ─────────────────────────────── */}
        {users.loading && !users.stale && (
          <div class={styles.loadingBox}>
            <div class={styles.spinner} />
            <p>Fetching users...</p>
          </div>
        )}

        {/* ── Stale indicator ─────────────────────── */}
        {users.stale && !users.loading && (
          <div class={styles.staleBar}>
            ⚡ Showing cached data — refreshing in background...
            <div class={styles.spinnerSm} />
          </div>
        )}

        {/* ── Error ───────────────────────────────── */}
        {users.error && (
          <div class={styles.errorBox}>
            <p>⚠️ {users.error}</p>
            <button class={styles.btnRetry} onClick={() => users.refetch()}>Retry</button>
          </div>
        )}

        {/* ── User Cards ──────────────────────────── */}
        {!users.loading && !users.error && users.data && (
          <div class={styles.userList}>
            {users.data.map((u, i) => (
              <div class={styles.userCard}>
                <div class={`${styles.avatar} ${styles[AVATARS[i % 4]!]}`}>{initials(u.name)}</div>
                <div class={styles.userInfo}>
                  <div class={styles.userName}>{u.name}</div>
                  <div class={styles.userEmail}>{u.email}</div>
                </div>
                <span class={styles.userId}>#{u.id}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Controls ────────────────────────────── */}
        <div class={styles.controls}>
          <button class={styles.btnRefresh} onClick={() => users.refetch()} disabled={users.loading}>
            {users.loading ? '⏳' : '🔄'} {users.loading ? 'Fetching...' : 'Refresh'}
          </button>
          <button class={styles.btnClear} onClick={() => { localStorage.clear(); users.refetch(); }}>
            🗑 Clear cache
          </button>
        </div>
      </div>
    </div>
  );
});
