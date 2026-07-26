import { describe, it, expect } from 'vitest';
import { matchRoutes, collectLeafRoutes } from '../matcher.js';

describe('matchRoutes()', () => {
  const routes = [
    { path: '/products' },
    { path: '/products/:id' },
    { path: '/about' },
    { path: '/docs/*' },
  ];

  it('matches static route', () => {
    const matches = matchRoutes('/products', routes);
    expect(matches).toHaveLength(1);
    expect(matches[0]!.route.path).toBe('/products');
  });

  it('extracts dynamic params', () => {
    const matches = matchRoutes('/products/42', routes);
    expect(matches).toHaveLength(1);
    expect(matches[0]!.params.id).toBe('42');
  });

  it('handles URL-encoded params', () => {
    const matches = matchRoutes('/products/hello%20world', routes);
    expect(matches).toHaveLength(1);
    expect(matches[0]!.params.id).toBe('hello world');
  });

  it('matches wildcard catch-all', () => {
    const matches = matchRoutes('/docs/getting-started/intro', routes);
    expect(matches).toHaveLength(1);
    expect(matches[0]!.params['*']).toBe('getting-started/intro');
  });

  it('returns empty array for unmatched path', () => {
    const matches = matchRoutes('/nonexistent', routes);
    expect(matches).toHaveLength(0);
  });
});

describe('collectLeafRoutes()', () => {
  it('collects all leaf routes', () => {
    const routes = [
      { path: '/' },
      { path: '/about' },
      { path: '/products', children: [{ path: ':id' }] },
    ];
    const leaves = collectLeafRoutes(routes);
    // /, /about, /products/:id = 3 leaves
    expect(leaves).toHaveLength(3);
    expect(leaves.map((l) => l.path)).toContain('/');
    expect(leaves.map((l) => l.path)).toContain('/about');
  });
});
