/**
 * server functions — one file, two worlds.
 * The compiler splits each server() into a typed fetch wrapper (client)
 * and an endpoint handler (server). This module has NO DOM code, so the
 * production server entry can import it safely.
 */
import { server } from '@astrajs/server';

export interface Quote {
  id: number;
  text: string;
  author: string;
}

const QUOTES: Quote[] = [
  { id: 1, text: 'Zero Virtual DOM, zero hydration, zero bloat.', author: 'AstraJS' },
  { id: 2, text: 'Compile TypeScript to direct DOM mutations.', author: 'AstraJS' },
  { id: 3, text: 'The server function you write is the API.', author: 'AstraJS' },
];

/** Plain dynamic endpoint: runs on the server on every call. */
export const getQuote = server(async () => {
  const idx = Math.floor(Math.random() * QUOTES.length);
  return QUOTES[idx]!;
});

/** ISR endpoint: cached 60s at the edge (Cache-Control + Cache-Tag). */
export const getStats = server({ tags: ['stats'], maxAge: 60 }, async () => {
  return {
    quotes: QUOTES.length,
    generatedAt: new Date().toISOString(),
  };
});

/** Mutation with args. */
export const addVisit = server(async (page: string) => {
  return { ok: true, page, at: new Date().toISOString() };
});
