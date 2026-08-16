import { defineConfig } from 'vite';
import astra from 'astrajs.dev/compiler';
import path from 'path';

export default defineConfig({
  plugins: [
    astra({
      apiPrefix: '/api/astra',
    }),
  ],
  resolve: {
  __ASTRA_ALIASES__
  },
});
