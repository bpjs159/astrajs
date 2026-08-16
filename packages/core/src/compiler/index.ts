/**
 * @bpjs159/core/vite — Vite Plugin Entry Point
 *
 * This is the entry point for the `@bpjs159/core/vite` export condition.
 * It re-exports the compiler's Vite plugin, keeping the public import path
 * clean: `import astra from '@bpjs159/core/vite'`.
 *
 * The actual plugin implementation lives in `@bpjs159/compiler`.
 */

// Re-export types
export type { AstraViteConfig } from '@bpjs159/compiler';

// Re-export the Vite plugin factory as default
export { astraVitePlugin as default, astraVitePlugin } from '@bpjs159/compiler';
