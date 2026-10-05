/**
 * astrajs.dev/core — Environment Detection
 *
 * `NODE_ENV` is read through this single module so bundlers (Vite/esbuild) can
 * statically replace `process.env.NODE_ENV` and dead-code-eliminate dev-only
 * branches from production builds — the same contract React and Vue use.
 *
 * IMPORTANT: do NOT wrap these reads in `typeof process !== 'undefined'`.
 * That guard stops the bundler from replacing the expression, so a browser
 * build would evaluate the guard as `false` and dev checks would silently
 * never fire. Applications are always bundled by Vite, so the literal is safe.
 */

/** True when NOT running in a production build. */
export function isDev(): boolean {
  return process.env.NODE_ENV !== 'production';
}

/** True when running under a test runner (NODE_ENV === 'test'). */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}
