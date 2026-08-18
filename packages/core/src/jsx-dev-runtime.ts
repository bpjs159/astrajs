/**
 * astrajs.dev/core — JSX Dev Runtime
 */

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
  bindConditional,
  bindDynamicList,
  bindDynamicText,
  dynamic,
  Fragment,
} from './jsx-runtime.js';

import { jsx as _jsx } from './jsx-runtime.js';

export function jsxDEV(
  type: string | ((props: Record<string, unknown>) => JSX.Element),
  props: (Record<string, unknown> & {
    __source?: { fileName: string; lineNumber: number; columnNumber: number };
    __self?: unknown;
  }) | null,
  key?: string,
  _isStaticChildren?: boolean,
  _source?: { fileName: string; lineNumber: number; columnNumber: number },
  _self?: unknown
): JSX.Element {
  const { __source, __self, ...rest } = props ?? ({} as Record<string, unknown>);
  return _jsx(type, rest, key);
}

export { jsx as jsx, jsx as jsxs } from './jsx-runtime.js';
