// 06 — Optimistic Mutations · Update the UI before the server confirms
import { component, store } from 'astrajs.dev/core';
import { server } from 'astrajs.dev/server';

interface Post { id: string; title: string; likes: number; }

const posts = store({
  items: [
    { id: 'post-1', title: 'Zero-VDOM in practice', likes: 12 },
    { id: 'post-2', title: 'Resumability without hydration', likes: 7 },
    { id: 'post-3', title: 'AST-compiled reactivity', likes: 21 },
  ] as Post[],
});

const ui = store({ pending: new Set<string>(), lastError: undefined as string | undefined });

// Simulates a flaky backend — roughly 30% of likes are rejected server-side.
// The latency makes the optimistic increment visible in the UI before the
// server confirms (keeps the like) or rejects (rolls it back).
const likePost = server(async (id: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  if (Math.random() < 0.3) throw new Error(`Server rejected the like for "${id}"`);
  return { id };
});

// There's no "optimistic" flag on server() — optimism is a client-side
// pattern: mutate local state first, then reconcile or roll back based on
// the real response. It stays out of server() because only the caller
// knows what "optimistic" means for its own UI.
async function toggleLike(post: Post): Promise<void> {
  if (ui.pending.has(post.id)) return;
  ui.lastError = undefined;

  post.likes++; // 1) optimistic update — instant feedback
  ui.pending = new Set(ui.pending).add(post.id);

  try {
    await likePost(post.id); // 2) confirm with the server
  } catch (e) {
    post.likes--; // 3) rollback — the optimistic guess was wrong
    ui.lastError = e instanceof Error ? e.message : 'Unknown error';
  } finally {
    const next = new Set(ui.pending);
    next.delete(post.id);
    ui.pending = next;
  }
}

export const OptimisticDemo = component(() => (
  <div class="card">
    <div class="header">
      <h1>Optimistic Mutations</h1>
      <p>Update the store immediately, roll back if <code>server()</code> throws</p>
    </div>
    <div class="body">
      <div class="errorSlot">
        {ui.lastError && <p class="error">{ui.lastError} — rolled back.</p>}
      </div>
      <div class="list">
        {posts.items.map(p => (
          <div class="row">
            <span class="rowName">{p.title}</span>
            <button class="likeBtn" disabled={ui.pending.has(p.id)} onClick={() => toggleLike(p)}>
              ▲ {p.likes}
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
));
