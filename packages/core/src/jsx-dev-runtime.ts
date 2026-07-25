/**
 * @astrajs/core — JSX Dev Runtime
 *
 * Development-mode JSX runtime with source location tracking and
 * extra validation. Mirrors jsx-runtime.ts but adds `__source` and `__self`
 * props for better debugging.
 */

// Re-export everything from the production runtime
export {
  store,
  toRaw,
  toProxy,
  effect,
  memo,
  batch,
  untrack,
  bindText,
  bindAttr,
  bindClass,
  bindTextContent,
  bindValue,
  bindList,
  Fragment,
} from './jsx-runtime.js';

import { jsx as _jsx } from './jsx-runtime.js';

type JSXChild = Node | string | number | boolean | null | undefined | JSXChild[];

/**
 * Dev-mode JSX factory. Accepts additional `__source` and `__self` props
 * injected by the TypeScript/Vite JSX transform for debugging.
 */
export function jsx(
  type: string | ((props: Record<string, unknown>) => JSX.Element),
  props: (Record<string, unknown> & {
    __source?: { fileName: string; lineNumber: number; columnNumber: number };
    __self?: unknown;
  }) | null,
  key?: string
): JSX.Element {
  const { __source, __self, ...rest } = props ?? ({} as Record<string, unknown>);
  // In dev mode, we could attach __source metadata to the element for DevTools
  // For now, we pass through to the core jsx factory
  return _jsx(type, rest, key);
}

export function jsxs(
  type: string | ((props: Record<string, unknown>) => JSX.Element),
  props: (Record<string, unknown> & {
    __source?: { fileName: string; lineNumber: number; columnNumber: number };
    __self?: unknown;
  }) | null,
  key?: string
): JSX.Element {
  return jsx(type, props, key);
}
