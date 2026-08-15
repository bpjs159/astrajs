import { defineConfig } from 'vitest/config';

// Tests import the BUILT package (`../dist/*`) — run `npm run build` first.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['__tests__/**/*.test.ts'],
  },
});
