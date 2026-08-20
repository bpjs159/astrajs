/**
 * Typed RPC with server().
 *
 * You write ONE async function. The compiler generates:
 *   - client:  getPosts() → fetch('/api/astra/getPosts') wrapper
 *   - server:  a handler registered in the Vite middleware (dev) /
 *              serverless function (production)
 *
 * Types are inferred end-to-end. No codegen, no duplication.
 */
import { server } from 'astrajs.dev/server';

export interface Post {
  id: number;
  title: string;
  body: string;
}

/** Cache with surgical invalidation: revalidate(['posts']) busts only this. */
export const getPosts = server(
  { tags: ['posts'], maxAge: 60 },
  async (): Promise<Post[]> => {
    // This code NEVER ships to the browser — it runs on the server only.
    return [
      { id: 1, title: 'Zero Virtual DOM', body: 'Surgical DOM updates, O(1) reactivity.' },
      { id: 2, title: 'Typed RPC', body: 'One function, client stub + server handler.' },
      { id: 3, title: 'Resumability', body: 'Resume state, never hydrate.' },
    ];
  }
);
