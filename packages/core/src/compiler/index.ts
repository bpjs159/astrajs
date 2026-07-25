/**
 * @astrajs/core/vite — Vite Plugin Entry Point
 *
 * This is the entry point for the `@astrajs/core/vite` export condition.
 * It re-exports the compiler's Vite plugin, keeping the public import path
 * clean: `import astra from '@astrajs/core/vite'`.
 *
 * The actual plugin implementation lives in `@astrajs/compiler`.
 */

// Re-export types
export type { AstraViteConfig } from '@astrajs/compiler';

// Re-export the Vite plugin factory as default
export { astraVitePlugin as default, astraVitePlugin } from '@astrajs/compiler';
