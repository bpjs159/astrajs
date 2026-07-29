import { defineConfig } from 'vite';
import path from 'path';
import astra from '../../../packages/compiler/src/plugin.js';

export default defineConfig({
  plugins: [astra({ transformMode: 'dynamic' })],
  resolve: {
    alias: {
      '@astrajs/core': path.resolve(__dirname, '../../../packages/core/src'),
      '@astrajs/core/jsx-runtime': path.resolve(__dirname, '../../../packages/core/src/jsx-runtime'),
      '@astrajs/core/jsx-dev-runtime': path.resolve(__dirname, '../../../packages/core/src/jsx-dev-runtime'),
      '@astrajs/compiler/css': path.resolve(__dirname, '../../../packages/compiler/src/css'),
      '@astrajs/compiler': path.resolve(__dirname, '../../../packages/compiler/src'),
    },
  },
});
