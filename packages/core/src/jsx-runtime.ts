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
 *
 * Or in Vite:
 * ```ts
 * import { defineConfig } from 'vite';
 * import astra from '@astrajs/core/vite';
 * export default defineConfig({ plugins: [astra()] });
 * ```
 */

// Re-export public API for convenience
export { store, toRaw, toProxy } from './runtime/store.js';
export { effect, memo, batch, untrack } from './runtime/effect.js';
export {
  bindText,
  bindAttr,
  bindClass,
  bindTextContent,
  bindValue,
  bindList,
} from './runtime/dom.js';

// ─── JSX Factory ─────────────────────────────────────────────────────────────

/**
 * JSX child value — anything that can appear as a child in JSX.
 */
type JSXChild = Node | string | number | boolean | null | undefined | JSXChild[];

/**
 * Flattens JSX children recursively. Arrays are flattened, falsy values
 * (except 0 and '') are filtered out.
 */
function flattenChildren(children: JSXChild): (Node | string | number)[] {
  if (children === null || children === undefined || children === false) {
    return [];
  }
  if (Array.isArray(children)) {
    return children.flatMap(flattenChildren);
  }
  if (children === true) {
    return [];
  }
  return [children as Node | string | number];
}

/**
 * Appends children to a parent element. Strings/numbers become TextNodes.
 */
function appendChildren(
  parent: HTMLElement | DocumentFragment,
  children: JSXChild
): void {
  const flat = flattenChildren(children);
  for (const child of flat) {
    if (child instanceof Node) {
      parent.appendChild(child);
    } else {
      parent.appendChild(document.createTextNode(String(child)));
    }
  }
}

/**
 * Sets attributes/properties on a DOM element from JSX props.
 *
 * Special handling:
 * - `class` / `className` → `el.className`
 * - `style` (object) → `Object.assign(el.style, ...)`
 * - `on*` event handlers → `el.addEventListener`
 * - `astra-data` → `el.setAttribute` (serialized state)
 * - `astra-on:*` → `el.setAttribute` (resumable events)
 * - `ref` → calls the ref function with the element
 * - Everything else → `el.setAttribute`
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
      if (typeof value === 'function') {
        (value as (el: HTMLElement) => void)(el);
      }
    } else if (key.startsWith('on') && typeof value === 'function') {
      const event = key.slice(2).toLowerCase();
      el.addEventListener(event, value as EventListener);
    } else if (key === 'astra-data') {
      el.setAttribute(
        'astra-data',
        typeof value === 'string' ? value : JSON.stringify(value)
      );
    } else if (key.startsWith('astra-on:')) {
      el.setAttribute(key, String(value));
    } else if (key === 'htmlFor') {
      el.setAttribute('for', String(value));
    } else if (value === true) {
      el.setAttribute(key, '');
    } else if (value === false || value === null) {
      // Don't set falsy boolean attributes
    } else {
      el.setAttribute(key, String(value));
    }
  }
}

/**
 * The `jsx` factory — creates a DOM element from JSX.
 *
 * Called by TypeScript/Vite when processing `<div prop={value}>...</div>`.
 *
 * @param type — The tag name (string) or component function.
 * @param props — Props object (including `children`).
 * @param _key — Optional key for list reconciliation (unused in runtime).
 */
export function jsx(
  type: string | ((props: Record<string, unknown>) => JSX.Element),
  props: Record<string, unknown> | null,
  _key?: string
): JSX.Element {
  const allProps = props ?? ({} as Record<string, unknown>);

  // Component function
  if (typeof type === 'function') {
    return type(allProps);
  }

  // Intrinsic element (HTML tag)
  const el = document.createElement(type);
  setProps(el, allProps);

  // Append children
  if ('children' in allProps) {
    appendChildren(el, allProps.children as JSXChild);
  }

  return el;
}

/**
 * The `jsxs` factory — same as `jsx` but for static children lists
 * (compiler optimization hint). In AstraJS they behave identically.
 */
export function jsxs(
  type: string | ((props: Record<string, unknown>) => JSX.Element),
  props: Record<string, unknown> | null,
  _key?: string
): JSX.Element {
  return jsx(type, props, _key);
}

/**
 * Creates a DocumentFragment from JSX children.
 * Used by the compiler for fragments (`<>...</>`).
 */
export function Fragment(props: { children?: JSXChild }): DocumentFragment {
  const fragment = document.createDocumentFragment();
  if (props.children !== undefined) {
    appendChildren(fragment, props.children);
  }
  return fragment;
}
