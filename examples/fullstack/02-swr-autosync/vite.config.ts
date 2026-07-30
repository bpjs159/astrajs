import { defineConfig } from 'vite';
import astra from '@astrajs/compiler';
import path from 'path';

export default defineConfig({
  plugins: [
    astra({
      apiPrefix: '/api/astra',
    }),
  ],
  resolve: {
    alias: {
      '@astrajs/core': path.resolve(__dirname, '../../../packages/core/src'),
      '@astrajs/core/jsx-runtime': path.resolve(__dirname, '../../../packages/core/src/jsx-runtime'),
      '@astrajs/core/jsx-dev-runtime': path.resolve(__dirname, '../../../packages/core/src/jsx-dev-runtime'),
      '@astrajs/compiler/css': path.resolve(__dirname, '../../../packages/compiler/src/css'),
      '@astrajs/compiler': path.resolve(__dirname, '../../../packages/compiler/src'),
      '@astrajs/router': path.resolve(__dirname, '../../../packages/router/src'),
      '@astrajs/server': path.resolve(__dirname, '../../../packages/server/src'),
      '@astrajs/ssr': path.resolve(__dirname, '../../../packages/ssr/src'),
    },
  },
});
