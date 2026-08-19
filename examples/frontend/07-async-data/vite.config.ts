import { defineConfig } from 'vite';
import path from 'path';
import astra from '../../../packages/compiler/src/plugin.js';

export default defineConfig({
  plugins: [astra({ transformMode: 'dynamic' })],
  resolve: {
    alias: {
      'astrajs.dev/core': path.resolve(__dirname, '../../../packages/core/src'),
      'astrajs.dev/core/jsx-runtime': path.resolve(__dirname, '../../../packages/core/src/jsx-runtime'),
      'astrajs.dev/core/jsx-dev-runtime': path.resolve(__dirname, '../../../packages/core/src/jsx-dev-runtime'),
      'astrajs.dev/compiler/css': path.resolve(__dirname, '../../../packages/compiler/src/css'),
      'astrajs.dev/compiler': path.resolve(__dirname, '../../../packages/compiler/src'),
    },
  },
});
