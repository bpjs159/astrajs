import { defineConfig } from 'vite';
import astra from '@bpjs159/compiler';
import path from 'path';

export default defineConfig({
  plugins: [
    astra({
      apiPrefix: '/api/astra',
    }),
  ],
  resolve: {
    alias: {
      '@bpjs159/core': path.resolve(__dirname, '../../../packages/core/src'),
      '@bpjs159/core/jsx-runtime': path.resolve(__dirname, '../../../packages/core/src/jsx-runtime'),
      '@bpjs159/core/jsx-dev-runtime': path.resolve(__dirname, '../../../packages/core/src/jsx-dev-runtime'),
      '@bpjs159/compiler/css': path.resolve(__dirname, '../../../packages/compiler/src/css'),
      '@bpjs159/compiler': path.resolve(__dirname, '../../../packages/compiler/src'),
      '@bpjs159/router': path.resolve(__dirname, '../../../packages/router/src'),
      '@bpjs159/server': path.resolve(__dirname, '../../../packages/server/src'),
    },
  },
});
