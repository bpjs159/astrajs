/// <reference path="./jsx.d.ts" />

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
export { store, toRaw, toProxy, captureReactiveExpression, STORE_SYMBOL, getLastReactiveAccess, clearLastReactiveAccess } from './runtime/store.js';
export { effect, memo, batch, untrack } from './runtime/effect.js';
export {
  bindText,
  bindAttr,
  bindClass,
  bindTextContent,
  bindValue,
  bindList,
  bindConditional,
  bindDynamicList,
  bindDynamicText,
} from './runtime/dom.js';

import { bindValue, bindConditional, bindDynamicList, bindDynamicText, bindAttr } from './runtime/dom.js';
import { getLastReactiveAccess, clearLastReactiveAccess } from './runtime/store.js';
import { untrack } from './runtime/effect.js';

// ─── dynamic() — Zero-VDOM reactive expression marker ────────────────────

/**
 * Symbol to mark expressions wrapped with `dynamic()`.
 * Detected by `appendChildren` to create individual micro-effects
 * instead of evaluating the expression eagerly.
 */
const DYNAMIC_SYM = Symbol('astra-dynamic');

/**
 * Wraps a reactive JSX expression so the runtime creates a granular
 * DOM binding (O(1) update) instead of evaluating it inline.
 *
 * Without `dynamic()`, JSX expressions are evaluated once at component
 * creation time and never update. With `dynamic()`, the runtime creates
 * a micro-effect that updates only the specific DOM node(s) affected
 * by the expression.
 *
 * @example
 * ```tsx
 * // Conditional rendering — bindConditional swaps the DOM node
 * <div>{dynamic(() => show ? <Timer /> : <p>Hidden</p>)}</div>
 *
 * // List rendering — bindDynamicList reconciles children
 * <div>{dynamic(() => items.map(i => <li>{i}</li>))}</div>
 *
 * // Scalar text — bindDynamicText updates the TextNode
 * <span>{dynamic(() => `Count: ${count}`)}</span>
 * ```
 */
export function dynamic<T>(fn: () => T): () => T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (fn as any)[DYNAMIC_SYM] = true;
  return fn;
}

function isDynamic(value: unknown): value is (() => unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof value === 'function' && (value as any)[DYNAMIC_SYM] === true;
}

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
 *
 * Zero-VDOM granular rendering:
 * - `dynamic()` expressions → individual micro-effects (bindConditional,
 *   bindDynamicList, bindDynamicText) targeting only that DOM node.
 * - Static Nodes → appended once, never recreated.
 * - Static scalars → TextNodes created once.
 * - No full re-render, no VDOM diffing — O(1) surgical DOM updates.
 */
function appendChildren(
  parent: HTMLElement | DocumentFragment,
  children: JSXChild
): void {
  const flat = flattenChildren(children);
  for (const child of flat) {
    // ── dynamic() expression → granular micro-effect ──
    if (isDynamic(child)) {
      const marker = document.createComment('~');
      parent.appendChild(marker);

      // Evaluate once to determine the binding type.
      // CRITICAL: Use untrack() to prevent the current effect (e.g.,
      // bindConditional) from subscribing to the inner store. Without
      // untrack, a conditional's getter accessing a child's store would
      // cause the conditional to re-evaluate on every child store change,
      // destroying and recreating the child component.
      const initial = untrack(() => child());
      if (Array.isArray(initial)) {
        // List: each item is already a rendered Node
        bindDynamicList(parent, marker, child as () => readonly Node[]);
      } else if (initial instanceof Node) {
        // Conditional or component: the getter returns a Node
        bindConditional(parent, marker, child as () => Node);
      } else {
        // Scalar: string, number, etc.
        bindDynamicText(parent, marker, child as () => string | number);
      }
    }
    // ── Static Node → append once ──
    else if (child instanceof Node) {
      parent.appendChild(child);
    }
    // ── Static scalar → TextNode once ──
    else {
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

  // ── Auto-bind detection ──────────────────────────────────────────
  // If the developer writes <input value={ui.password} /> without an
  // explicit onInput, we detect the store access and create a two-way
  // binding automatically. If onInput IS provided, it takes precedence.
  const tag = el.tagName.toLowerCase();
  const isFormControl = tag === 'input' || tag === 'textarea' || tag === 'select';
  const hasExplicitInput = Object.keys(props).some(
    k => (k === 'onInput' || k === 'oninput' || k === 'onChange' || k === 'onchange') && typeof props[k] === 'function'
  );

  for (const [key, value] of Object.entries(props)) {
    if (key === 'children' || value === undefined) continue;

    // ── Auto value binding ─────────────────────────────────────────
    // Detects <input value={store.prop} /> and sets up two-way binding.
    if (key === 'value' && isFormControl && !hasExplicitInput) {
      const access = getLastReactiveAccess();
      if (access) {
        const proxy = access.proxy as Record<string, unknown>;
        bindValue(
          el as HTMLInputElement,
          () => String(Reflect.get(access.raw, access.prop)),
          (v: string) => { proxy[access.prop] = v; }
        );
        clearLastReactiveAccess();
        continue;
      }
    }

    if (key === 'class' || key === 'className') {
      if (typeof value === 'function') {
        bindAttr(el, 'class', value as () => string | null);
      } else {
        el.className = String(value ?? '');
      }
    } else if (key === 'style' && typeof value === 'object' && value !== null) {
      Object.assign(el.style, value);
    } else if (key === 'ref') {
      if (typeof value === 'function') (value as (el: HTMLElement) => void)(el);
    } else if (key === 'controller' && typeof value === 'object' && value !== null) {
      // Directive: <form controller={formController}> — wires up form metadata.
      // Duck-type check: the controller exposes an _attach method.
      const controller = value as Record<string, unknown>;
      if (typeof controller._attach === 'function') {
        (controller._attach as (el: HTMLElement) => void)(el);
      }
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
    } else if (key === 'validate' && typeof value === 'function') {
      // Deferred: installed after children are appended (see jsx())
      (el as any).__astraValidate = value;
    } else if (key === 'minLength' || key === 'maxLength') {
      // Map JSX camelCase to native lowercase attribute (minlength, maxlength)
      el.setAttribute(key.toLowerCase(), String(value));
    } else if (typeof value === 'function') {
      // ── Reactive attribute getter ──────────────────────────────────
      // Compiler wraps reactive attrs as `attr={() => store.prop}`.
      // bindAttr creates an effect that updates the attribute reactively.
      bindAttr(el, key, value as () => string | null);
    } else if (value === true) {
      el.setAttribute(key, '');
    } else if (value === false || value === null) {
      // Skip falsy boolean attrs
    } else {
      el.setAttribute(key, String(value));
    }
  }
}

// ─── Per-input validate runtime ─────────────────────────────────────────────
//
//  ASTRAJS PHILOSOPHY: We delegate to the WEB PLATFORM.
//
//  The `validate={fn}` prop is transformed by the AST into a native
//  `input.addEventListener('input', ...)` that calls `fn` and passes
//  the result to `input.setCustomValidity()`.
//
//  This means:
//  - The browser's Constraint Validation API handles submit blocking.
//  - `form.checkValidity()` / `form.reportValidity()` work natively.
//  - CSS `input:invalid` pseudo-class works automatically.
//  - No manual error state, no effect(), no ui.errors.
//

/** Debounce timers per input (for async validators only). */
const _validateTimers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

const VALIDATE_DEBOUNCE_MS = 300;

/**
 * Installs a validate function on an input element.
 * Called by setProps when it encounters `validate={fn}`.
 */
function installInputValidator(
  input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  validateFn: (value: string) => string | true | Promise<string | true>
): void {
  // Debounced input listener → calls setCustomValidity()
  input.addEventListener('input', () => {
    const timer = _validateTimers.get(input);
    if (timer) clearTimeout(timer);

    _validateTimers.set(
      input,
      setTimeout(async () => {
        try {
          const result = await validateFn(input.value);
          if (result === true) {
            // Clear custom validity → browser falls back to native validation
            input.setCustomValidity('');
          } else {
            // Set custom error → browser treats input as :invalid
            input.setCustomValidity(typeof result === 'string' ? result : 'Invalid');
          }
        } catch {
          // If the validator throws, clear so the input isn't stuck
          input.setCustomValidity('');
        }
      }, VALIDATE_DEBOUNCE_MS)
    );
  });

  // Also run immediately so the initial state is validated.
  // Do NOT bubble — would trigger form controller refresh during render.
  input.dispatchEvent(new Event('input'));
}

/** Called after setProps to finalize validate on inputs. */
function finalizeValidate(el: HTMLElement): void {
  const v = (el as any).__astraValidate;
  if (!v) return;
  delete (el as any).__astraValidate;
  installInputValidator(
    el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    v
  );
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

  // ── Per-input validate: finalize deferred installation ──
  finalizeValidate(el);

  // ── astra-schema: declarative form validation (coexists with validate) ──
  if (type === 'form' && allProps['astra-schema']) {
    const schema = allProps['astra-schema'] as {
      validate(data: unknown): { success: boolean; errors?: Record<string, string>; data?: unknown };
    };
    const onErrorFn = allProps['onError'] as ((e: Record<string, string>) => void) | undefined;
    const onSubmitFn = allProps['onSubmit'] as ((...args: unknown[]) => unknown) | undefined;

    const form = el as HTMLFormElement;

    if (onSubmitFn) form.removeEventListener('submit', onSubmitFn as EventListener);

    form.addEventListener('submit', (e: SubmitEvent) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data: Record<string, unknown> = {};
      formData.forEach((v, k) => { data[k] = v; });

      const result = schema.validate(data);
      if (!result.success) {
        onErrorFn?.(result.errors ?? {});
      } else {
        void onSubmitFn?.(formData);
      }
    });
  }

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
