/**
 * Featured products — constant-folded at BUILD TIME (`pre-build`).
 * The result is inlined into the client bundle as plain data: zero JS
 * runs to fetch it, and the SSR prerender embeds it in the HTML too.
 */
import { server } from 'astrajs.dev/server';

export interface FeaturedItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
}

// Pre-build bodies run in isolation at transform time: they must be PURE
// JavaScript (no TypeScript annotations, no module-scope references).
export const getFeatured = server({ type: 'pre-build' }, () => {
  const items = [
    { id: 'p1', name: 'Aurora Wireless Headphones', price: 299, emoji: '🎧' },
    { id: 'p2', name: 'Pulse Smart Watch', price: 449, emoji: '⌚' },
    { id: 'p4', name: 'Velocity Running Shoes', price: 179, emoji: '👟' },
    { id: 'p7', name: 'Nova Mechanical Keyboard', price: 159, emoji: '⌨️' },
  ];
  return items;
});
