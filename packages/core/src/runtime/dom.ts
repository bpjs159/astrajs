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
import { setBindingUpdate } from './store.js';

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
  getter: () => string | null | boolean
): void {
  effect(() => {
    const value = getter();
    if (value === null || value === undefined || value === false || value === '') {
      el.removeAttribute(attr);
    } else if (el.getAttribute(attr) !== String(value)) {
      el.setAttribute(attr, String(value));
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
      // Mark this mutation as coming from a DOM input binding.
      // This prevents the component() wrapper from re-rendering
      // and replacing the input element (which would lose focus).
      setBindingUpdate(true);
      setter(el.value);
      setBindingUpdate(false);
    };
    el.addEventListener('input', handler);
    // Store for potential cleanup
    (el as unknown as Record<string, unknown>).__astra_value_handler = handler;
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
          ? (rendered.firstChild ?? rendered) as ChildNode
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
  });
}

// ─── Granular Bindings for dynamic() expressions ──────────────────────────

/**
 * Converts a dynamic() getter result into a DOM Node.
 * - Node → returned as-is
 * - string/number → TextNode
 * - null/undefined/false → empty Comment (placeholder)
 */
function toNode(value: unknown): Node {
  if (value instanceof Node) return value;
  if (value === null || value === undefined || value === false) return document.createComment('');
  return document.createTextNode(String(value));
}

/**
 * Binds a conditional DOM node to a reactive getter.
 *
 * When the getter returns a different node, the old one is replaced
 * in-place (O(1) swap). Used internally by appendChildren when it
 * encounters a `dynamic()` expression that returns a Node.
 *
 * @param parent  — The parent element containing the conditional.
 * @param anchor  — Comment marker that marks the insertion point.
 * @param getter  — A function returning the current Node (reactive).
 */
export function bindConditional(
  parent: HTMLElement | DocumentFragment,
  anchor: Comment,
  getter: () => Node | string | number | null | undefined | false
): void {
  let current: Node = anchor;

  effect(() => {
    const next = toNode(getter());

    // Same node instance → nothing to do
    if (next === current) return;

    // The anchor may have been removed by an external operation
    if (!current.parentNode || current.parentNode !== parent) {
      current = next;
      return;
    }

    // Insert new node before the current one, then remove current
    parent.insertBefore(next, current);
    (current as ChildNode).remove();
    current = next;
  });
}

/**
 * Binds a dynamic list of DOM nodes to a reactive getter.
 *
 * Each time the getter returns a new array, the old nodes are removed
 * and the new ones inserted before the anchor marker.
 *
 * @param parent  — The parent element.
 * @param anchor  — Comment marker for insertion point.
 * @param getter  — A function returning an array of Nodes (reactive).
 */
export function bindDynamicList(
  parent: HTMLElement | DocumentFragment,
  anchor: Comment,
  getter: () => readonly Node[]
): void {
  let currentNodes: Node[] = [];

  effect(() => {
    const nextNodes = getter();

    // Fast path: same reference
    if (nextNodes === currentNodes) return;

    // Remove old nodes
    for (const n of currentNodes) {
      if (n.parentNode === parent) (n as ChildNode).remove();
    }

    // Insert new nodes before anchor
    for (const n of nextNodes) {
      if (n instanceof Node) {
        parent.insertBefore(n, anchor);
      }
    }

    currentNodes = [...nextNodes];
  });
}

/**
 * Binds a dynamic text value to a reactive getter.
 *
 * Replaces the anchor comment with a TextNode on first evaluation,
 * then updates the TextNode's data on subsequent changes.
 *
 * @param parent  — The parent element.
 * @param anchor  — Comment marker for insertion point.
 * @param getter  — A function returning a string (reactive).
 */
export function bindDynamicText(
  parent: HTMLElement | DocumentFragment,
  anchor: Comment,
  getter: () => string | number
): void {
  let current: Node = anchor;

  effect(() => {
    const value = String(getter());
    if (current instanceof Text) {
      if (current.data !== value) {
        current.data = value;
      }
    } else {
      const tn = document.createTextNode(value);
      parent.insertBefore(tn, current);
      (current as ChildNode).remove();
      current = tn;
    }
  });
}
