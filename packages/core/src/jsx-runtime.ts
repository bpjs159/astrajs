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
    } else if (key === 'validate' && typeof value === 'function') {
      // Deferred: installed after the element is in the DOM (see jsx())
      (el as any).__astraValidate = value;
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

/** Map: input element → validate function. */
const _validators = new WeakMap<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  (value: string) => string | true | Promise<string | true>
>();

/** Map: form element → set of validated inputs inside it. */
const _formInputs = new WeakMap<
  HTMLFormElement,
  Set<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
>();

/** Debounce timers per input. */
const _timers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

const DEBOUNCE_MS = 300;

/** Clear error visual state on an input. */
function clearInputError(el: HTMLElement): void {
  el.removeAttribute('data-astra-error');
  el.removeAttribute('aria-invalid');
  el.classList.remove('astra-invalid');
}

/** Set error visual state on an input. */
function setInputError(el: HTMLElement, message: string): void {
  el.setAttribute('data-astra-error', message);
  el.setAttribute('aria-invalid', 'true');
  el.classList.add('astra-invalid');
}

/** Register an input with its nearest parent form and set up debounced validation. */
function installInputValidator(
  input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  validateFn: (value: string) => string | true | Promise<string | true>
): void {
  _validators.set(input, validateFn);

  // Find the nearest parent form
  const form = input.closest('form');
  if (form) {
    let set = _formInputs.get(form);
    if (!set) {
      set = new Set();
      _formInputs.set(form, set);
      installFormGuard(form);
    }
    set.add(input);
  }

  // Debounced input listener
  input.addEventListener('input', () => {
    const timer = _timers.get(input);
    if (timer) clearTimeout(timer);
    _timers.set(
      input,
      setTimeout(async () => {
        const result = await validateFn(input.value);
        if (result === true) {
          clearInputError(input);
        } else {
          setInputError(input, result);
        }
      }, DEBOUNCE_MS)
    );
  });
}

/** Add a submit guard to a form that blocks submission if any input has errors. */
function installFormGuard(form: HTMLFormElement): void {
  form.addEventListener('submit', async (e: SubmitEvent) => {
    const inputs = _formInputs.get(form);
    if (!inputs || inputs.size === 0) return;

    // Run ALL validators (including async ones) before deciding
    const results = await Promise.all(
      [...inputs].map(async (input) => {
        const fn = _validators.get(input);
        if (!fn) return { input, ok: true as const };
        const result = await fn(input.value);
        return { input, ok: result === true ? (true as const) : (false as const), error: result === true ? undefined : result };
      })
    );

    const failures = results.filter((r) => !r.ok);
    if (failures.length > 0) {
      e.preventDefault();
      e.stopImmediatePropagation();
      // Highlight all failing inputs
      for (const f of failures) {
        setInputError(f.input as HTMLElement, f.error ?? 'Invalid');
      }
    }
    // If all passed, let the event proceed to the user's onSubmit handler
  }, { capture: true });
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
