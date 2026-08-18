/**
 * astrajs.dev/core/jsx-dev-runtime — Type Declarations
 *
 * Development-mode JSX runtime with source tracking.
 */

export { jsx, jsxs, Fragment } from './jsx-runtime.js';
export function jsxDEV(
  type: string | ((props: Record<string, unknown>) => JSX.Element),
  props: Record<string, unknown> | null,
  key?: string,
  isStaticChildren?: boolean,
  source?: { fileName: string; lineNumber: number; columnNumber: number },
  self?: unknown
): JSX.Element;
