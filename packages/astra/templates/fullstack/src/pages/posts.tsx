import { component, store, mounted } from 'astrajsx/core';
import { getPosts, type Post } from '../server/posts.server.js';

export const PostsPage = component(() => {
  const state = store({ posts: [] as Post[], loading: true, error: '' });

  mounted(() => {
    getPosts()
      .then((posts) => {
        state.posts = posts;
        state.loading = false;
      })
      .catch(() => {
        state.error = 'Could not load posts';
        state.loading = false;
      });
  });

  return (
    <div class="page">
      <h1>Posts from the server</h1>
      {(() => {
        if (state.loading) return <p>Loading posts…</p>;
        if (state.error) return <p style="color:#f87171">{state.error}</p>;
        return (
          <ul style="list-style:none;display:flex;flex-direction:column;gap:12px">
            {state.posts.map((post) => (
              <li
                key={post.id}
                style="background:#0a0f1a;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:20px"
              >
                <strong style="color:#fff">{post.title}</strong>
                <p style="color:#64748b;font-size:.85rem;margin-top:4px">{post.body}</p>
              </li>
            ))}
          </ul>
        );
      })()}
    </div>
  );
});
