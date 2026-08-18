import { defineConfig } from 'vitest/config';

// Tests import the BUILT package (`../../dist/*`) — exactly what consumers
// get — so sibling `astrajs.dev/*` packages resolve natively through
// node_modules (the `import` condition) without Vite rewriting `.js`
// specifiers inside their TS sources.
// Run `npm run build` before `npm test`.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
