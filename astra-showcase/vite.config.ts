import { defineConfig } from 'vite';
import astra from '@astrajs/core/vite';

export default defineConfig({
  plugins: [
    astra({
      cssPrefix: 'sc-',
      cssHashLength: 6,
      apiPrefix: '/api/rpc',
      sourceMaps: true,
    }),
  ],
  resolve: {
    conditions: ['development'],
  },
});
