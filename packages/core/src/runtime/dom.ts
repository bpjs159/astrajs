/**
 * @astrajs/core — DOM Binding Utilities
 *
 * These functions bridge the reactive system with the real DOM.
 * When the Vite compiler transforms JSX, it emits calls to these
 * binding functions instead of re-running components.
 *
 * ## Design
 *
 * Each binding creates an `effect()` that targets a specific DOM node
 * property (`.textContent`, `.className`, `.value`, an attribute, etc.).
 * When the store property changes, only that single DOM property is mutated
 * — no diffing, no re-render, no component re-execution.
 */

import { effect } from './effect.js';

/**
 * Binds a TextNode's `.data` (or `.textContent`) to a reactive expression.
 *
 * The compiler transforms `<span>{store.count}</span>` into:
 * ```ts
 * const el = document.createElement('span');
 * const tn = document.createTextNode('');
 * el.appendChild(tn);
 * bindText(tn, () => String(store.count));
 * ```
 *
 * @param node — The TextNode to keep updated.
 * @param getter — A function returning the current string value (reactive).
 */
export function bindText(node: Text, getter: () => string): void {
  effect(() => {
    const value = getter();
    // Only update if the value actually changed (avoids layout thrashing)
    if (node.data !== value) {
      node.data = value;
    }
  });
}

/**
 * Binds an element attribute to a reactive expression.
 *
 * @param el — The target element.
 * @param attr — The attribute name (e.g., `'href'`, `'title'`).
 * @param getter — A function returning the attribute value (or null to remove).
 */
export function bindAttr(
  el: HTMLElement,
  attr: string,
  getter: () => string | null
): void {
  effect(() => {
    const value = getter();
    if (value === null || value === undefined || value === '') {
      el.removeAttribute(attr);
    } else if (el.getAttribute(attr) !== value) {
      el.setAttribute(attr, value);
    }
  });
}

/**
 * Binds a CSS class name to a boolean reactive expression.
 * Adds/removes the class based on the getter's truthiness.
 *
 * @param el — The target element.
 * @param className — The class name to toggle.
 * @param getter — A function returning a boolean (or truthy/falsy value).
 */
export function bindClass(
  el: HTMLElement,
  className: string,
  getter: () => boolean
): void {
  effect(() => {
    el.classList.toggle(className, !!getter());
  });
}

/**
 * Binds an element's `.textContent` to a reactive expression.
 * Similar to `bindText` but operates on Element nodes.
 *
 * @param el — The target element.
 * @param getter — A function returning the text content.
 */
export function bindTextContent(el: HTMLElement, getter: () => string): void {
  effect(() => {
    const value = getter();
    if (el.textContent !== value) {
      el.textContent = value;
    }
  });
}

/**
 * Binds an input/textarea/select element's `.value` to a reactive expression,
 * with optional two-way binding support.
 *
 * If `setter` is provided, the binding listens for `input` events on the
 * element and calls `setter` with the new value.
 *
 * @param el — The form element (input, textarea, select).
 * @param getter — A function returning the current value.
 * @param setter — Optional: called with the new value on user input.
 */
export function bindValue(
  el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  getter: () => string,
  setter?: (value: string) => void
): void {
  effect(() => {
    const value = getter();
    if (el.value !== value) {
      el.value = value;
    }
  });

  if (setter) {
    const handler = (): void => {
      setter(el.value);
    };
    el.addEventListener('input', handler);
    // Store for potential cleanup
    (el as Record<string, unknown>).__astra_value_handler = handler;
  }
}

/**
 * Binds a list of children to a reactive array expression.
 * Efficiently reconciles DOM children with the array using key-based diffing.
 *
 * The compiler transforms `{items.map(i => <li>{i}</li>)}` into:
 * ```ts
 * bindList(el, () => items, (item) => createListItem(item));
 * ```
 *
 * @param el — The parent element.
 * @param getter — A function returning the reactive array.
 * @param render — A function that creates a DOM node for each item.
 * @param keyFn — Optional: extracts a stable key from each item.
 */
export function bindList<T>(
  el: HTMLElement,
  getter: () => readonly T[],
  render: (item: T, index: number) => HTMLElement | DocumentFragment,
  keyFn?: (item: T, index: number) => string | number
): void {
  let prevItems: readonly T[] = [];
  // Map from key to DOM node
  const nodeMap = new Map<string | number, ChildNode>();

  effect(() => {
    const nextItems = getter();
    const nextKeys = new Map<string | number, T>();

    // Build key → item mapping for next state
    for (let i = 0; i < nextItems.length; i++) {
      const item = nextItems[i]!;
      const key = keyFn ? keyFn(item, i) : i;
      nextKeys.set(key, item);
    }

    // Remove nodes that are no longer in the list
    for (const [key, node] of nodeMap) {
      if (!nextKeys.has(key)) {
        node.remove();
        nodeMap.delete(key);
      }
    }

    // Build the new child list in order
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < nextItems.length; i++) {
      const item = nextItems[i]!;
      const key = keyFn ? keyFn(item, i) : i;
      let node = nodeMap.get(key);

      if (!node) {
        // New item — render and store
        const rendered = render(item, i);
        node = rendered instanceof DocumentFragment
          ? rendered.firstChild ?? rendered
          : rendered;
        if (node) {
          nodeMap.set(key, node);
        }
      }

      if (node) {
        fragment.appendChild(node);
      }
    }

    // Replace all children at once (single DOM operation)
    el.textContent = '';
    el.appendChild(fragment);

    prevItems = nextItems;
  });
}
