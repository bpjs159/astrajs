/**
 * @bpjs159/core/jsx-runtime — Type Declarations
 *
 * TypeScript uses this when `"jsx": "react-jsx"` and
 * `"jsxImportSource": "@bpjs159/core"` are configured.
 *
 * The runtime implementations are in `jsx-runtime.ts` and
 * `jsx-dev-runtime.ts`.
 */

import type { JSX } from './jsx.js';

/**
 * The JSX factory for the automatic runtime.
 * Called by TypeScript/Vite when compiling JSX expressions.
 */
export function jsx(
  type: string | ((props: Record<string, unknown>) => JSX.Element),
  props: Record<string, unknown> | null,
  key?: string
): JSX.Element;

/**
 * The JSX factory for static children lists (optimization hint).
 */
export function jsxs(
  type: string | ((props: Record<string, unknown>) => JSX.Element),
  props: Record<string, unknown> | null,
  key?: string
): JSX.Element;

/**
 * Fragment component — renders children without a wrapper element.
 */
export function Fragment(props: { children?: JSX.Element | string | number | boolean | null | undefined | readonly (JSX.Element | string | number | boolean | null | undefined)[] }): DocumentFragment;
