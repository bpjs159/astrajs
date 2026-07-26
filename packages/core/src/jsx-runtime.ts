/**
 * @astrajs/core — JSX Runtime (automatic mode)
 *
 * This module implements the "automatic" JSX transform (React 17+ style).
 * Vite/TypeScript calls `jsx(type, props, key)` and `jsxs(type, props, key)`
 * to create elements.
 *
 * In AstraJS, JSX produces REAL DOM elements — not virtual nodes.
 * Each JSX call creates an HTMLElement or DocumentFragment directly.
 *
 * Configure in tsconfig.json:
 * ```json
 * {
 *   "compilerOptions": {
 *     "jsx": "react-jsx",
 *     "jsxImportSource": "@astrajs/core"
 *   }
 * }
 * ```
 */

// Re-export public API for convenience
export { store, toRaw, toProxy, captureReactiveExpression, STORE_SYMBOL } from './runtime/store.js';
export { effect, memo, batch, untrack } from './runtime/effect.js';
export {
  bindText,
  bindAttr,
  bindClass,
  bindTextContent,
  bindValue,
  bindList,
} from './runtime/dom.js';

import { captureReactiveExpression, STORE_SYMBOL } from './runtime/store.js';
import { effect } from './runtime/effect.js';
import { bindText } from './runtime/dom.js';

// ─── JSX Factory ─────────────────────────────────────────────────────────────

type JSXChild = Node | string | number | boolean | null | undefined | JSXChild[];

function flattenChildren(children: JSXChild): (Node | string | number)[] {
  if (children === null || children === undefined || children === false) return [];
  if (Array.isArray(children)) return children.flatMap(flattenChildren);
  if (children === true) return [];
  return [children as Node | string | number];
}

/**
 * Appends children to a parent element.
 * Strings/numbers become TextNodes with AUTO reactive binding
 * if the value came from a store access.
 */
function appendChildren(
  parent: HTMLElement | DocumentFragment,
  children: JSXChild
): void {
  const flat = flattenChildren(children);
  for (const child of flat) {
    if (child instanceof Node) {
      parent.appendChild(child);
    } else if (typeof child === 'function') {
      // Reactive getter: create TextNode + bindText
      const tn = document.createTextNode('');
      bindText(tn, child as () => string);
      parent.appendChild(tn);
    } else {
      parent.appendChild(document.createTextNode(String(child)));
    }
  }
}

/**
 * Sets attributes/properties on a DOM element from JSX props.
 * Handles both DOM events (onclick) and React-style (onClick).
 */
function setProps(
  el: HTMLElement,
  props: Record<string, unknown> | null
): void {
  if (!props) return;

  for (const [key, value] of Object.entries(props)) {
    if (key === 'children' || value === undefined) continue;

    if (key === 'class' || key === 'className') {
      el.className = String(value ?? '');
    } else if (key === 'style' && typeof value === 'object' && value !== null) {
      Object.assign(el.style, value);
    } else if (key === 'ref') {
      if (typeof value === 'function') (value as (el: HTMLElement) => void)(el);
    } else if (key.startsWith('on') && typeof value === 'function') {
      // Normalize: onClick → click, onChange → change, etc.
      let event = key.slice(2);
      // Convert camelCase to lowercase: onChange → change, onInput → input
      if (event !== event.toLowerCase()) {
        event = event.replace(/[A-Z]/g, (c) => c.toLowerCase());
      }
      el.addEventListener(event, value as EventListener);
    } else if (key === 'astra-data') {
      el.setAttribute('astra-data', typeof value === 'string' ? value : JSON.stringify(value));
    } else if (key.startsWith('astra-on:')) {
      el.setAttribute(key, String(value));
    } else if (key === 'htmlFor') {
      el.setAttribute('for', String(value));
    } else if (value === true) {
      el.setAttribute(key, '');
    } else if (value === false || value === null) {
      // Skip falsy boolean attrs
    } else {
      el.setAttribute(key, String(value));
    }
  }
}

/**
 * The `jsx` factory — creates a DOM element from JSX.
 */
export function jsx(
  type: string | ((props: Record<string, unknown>) => JSX.Element),
  props: Record<string, unknown> | null,
  _key?: string
): JSX.Element {
  const allProps = props ?? ({} as Record<string, unknown>);

  if (typeof type === 'function') {
    return type(allProps);
  }

  const el = document.createElement(type);
  setProps(el, allProps);

  if ('children' in allProps) {
    appendChildren(el, allProps.children as JSXChild);
  }

  return el;
}

export function jsxs(
  type: string | ((props: Record<string, unknown>) => JSX.Element),
  props: Record<string, unknown> | null,
  _key?: string
): JSX.Element {
  return jsx(type, props, _key);
}

export function Fragment(props: { children?: JSXChild }): DocumentFragment {
  const fragment = document.createDocumentFragment();
  if (props.children !== undefined) appendChildren(fragment, props.children);
  return fragment;
}
