/**
 * astrajs.dev/compiler — Vite Plugin Entry Point
 *
 * This is the entry point for the `astrajs.dev/compiler` export condition.
 * It re-exports the compiler's Vite plugin, keeping the public import path
 * clean: `import astra from 'astrajs.dev/compiler'`.
 *
 * The actual plugin implementation lives in `astrajs.dev/compiler`.
 */

// Re-export types
export type { AstraViteConfig } from 'astrajs.dev/compiler';

// Re-export the Vite plugin factory as default
export { astraVitePlugin as default, astraVitePlugin } from 'astrajs.dev/compiler';
