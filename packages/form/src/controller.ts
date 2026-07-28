/**
 * @astrajs/form — Form Controller
 *
 * `form()` returns a reactive proxy that manages form metadata:
 * errors, touched, isDirty, isValid, isSubmitting, isValidating, submitCount.
 *
 * ## Architecture
 *
 * - **Data** lives in `@astrajs/core` stores (the developer's responsibility).
 * - **Metadata** lives in this controller (auto-managed via native DOM events).
 * - **Validation** is delegated 100% to the browser's Constraint Validation API.
 * - **No manual validation loops** — we read `ValidityState` from the DOM.
 */

import { store } from '@astrajs/core';
import { getFormErrors } from './validity-map.js';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FormController {
  /** Error codes keyed by input `name`. Populated from ValidityState. Read-only. */
  readonly errors: Record<string, string>;
  /** Whether each field has been blurred. Read-only. */
  readonly touched: Record<string, boolean>;
  /** True if any field has been modified. Read-only. */
  readonly isDirty: boolean;
  /** True if all fields pass native HTML5 validation. Read-only. */
  readonly isValid: boolean;
  /** True while async validators are running. Read-only. */
  readonly isValidating: boolean;

  /** Get the current error code for a specific field. */
  getError(name: string): string | undefined;
  /** Focus the first invalid field with smooth scroll. */
  focusFirstError(): void;
  /** Reset all metadata and the physical DOM form. */
  reset(): void;
  /** Force re-evaluation of all inputs' validity state. */
  validateAll(): void;
  /**
   * Release all internal references and stop listening to DOM events.
   * Call this when the form is unmounted (e.g., in a `mounted()` cleanup)
   * to allow the garbage collector to reclaim the controller and form element.
   *
   * @example
   * ```ts
   * const loginForm = form();
   * mounted(() => () => loginForm.dispose());
   * ```
   */
  dispose(): void;
}

// ─── WeakMap: controller → form element ──────────────────────────────────────

const _formEls = new WeakMap<object, HTMLFormElement>();
const _wired = new WeakSet<object>();

// ─── Factory ─────────────────────────────────────────────────────────────────

export function form(): FormController {
  const state = store({
    errors: {} as Record<string, string>,
    touched: {} as Record<string, boolean>,
    isDirty: false,
    isValid: true,
    isValidating: false,

    getError(name: string): string | undefined {
      return (this as unknown as FormController).errors[name];
    },

    focusFirstError(): void {
      const form = _formEls.get(state);
      if (!form) return;
      const first = form.querySelector(
        'input:invalid, textarea:invalid, select:invalid'
      ) as HTMLElement | null;
      if (first) {
        first.focus();
        first.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      }
    },

    reset(): void {
      const form = _formEls.get(state);
      // Directly assign to trigger reactive updates
      const s = state as unknown as Record<string, unknown>;
      s.errors = {};
      s.touched = {};
      s.isDirty = false;
      s.isValid = true;
      s.isValidating = false;
      // Clear touched markers from DOM
      if (form) {
        for (const el of form.querySelectorAll('[data-astra-touched]')) {
          el.removeAttribute('data-astra-touched');
        }
        form.reset();
      }
    },

    validateAll(): void {
      const form = _formEls.get(state);
      if (form) _refresh(state);
    },

    // Called by JSX runtime via <form controller={...}> directive.
    _attach(formEl: HTMLFormElement): void {
      _formEls.set(state, formEl);

      if (_wired.has(state)) return;
      _wired.add(state);

      // Event delegation on document — survives component() re-renders
      _delegate(state as unknown as FormController);
    },

    /**
     * Release all internal references and stop listening to DOM events.
     * After calling dispose(), the controller is inert — event listeners
     * will skip this form (isConnected guard) and the WeakMap entry is
     * cleared, allowing GC to reclaim both the controller and form element.
     */
    dispose(): void {
      _formEls.delete(state);
      _wired.delete(state);
    },
  });

  return state as unknown as FormController;
}

// ─── Internal: document-level event delegation ──────────────────────────────

function _delegate(controller: FormController): void {
  // input → errors + isDirty
  document.addEventListener('input', (e: Event) => {
    const input = e.target as HTMLElement | null;
    if (!input) return;
    const form = _formEls.get(controller as unknown as object);
    // Guard: skip if form was disposed or detached from DOM (routing, unmount)
    if (!form || !form.isConnected || !form.contains(input)) return;

    _refresh(controller);
    let dirty = false;
    for (const el of form.querySelectorAll('input, textarea, select')) {
      if ((el as HTMLInputElement).value !== '') { dirty = true; break; }
    }
    (controller as unknown as Record<string, unknown>).isDirty = dirty;
  });

  // blur → touched
  document.addEventListener('blur', (e: FocusEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target || (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && target.tagName !== 'SELECT')) return;
    const input = target as HTMLInputElement;
    if (!input.name) return;
    const form = _formEls.get(controller as unknown as object);
    // Guard: skip if form was disposed or detached from DOM
    if (!form || !form.isConnected || !form.contains(input)) return;

    const touched = { ...controller.touched, [input.name]: true };
    (controller as unknown as Record<string, unknown>).touched = touched;
    // Mark the DOM element so CSS can target touched:invalid
    input.setAttribute('data-astra-touched', '');
  }, true);

  // invalid → errors
  document.addEventListener('invalid', (e: Event) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const form = _formEls.get(controller as unknown as object);
    // Guard: skip if form was disposed or detached from DOM
    if (!form || !form.isConnected || !form.contains(target)) return;
    _refresh(controller);
  }, true);

  // Initial sync — deferred to avoid render-cycle re-entry
  queueMicrotask(() => _refresh(controller));
}

function _refresh(controller: FormController): void {
  const form = _formEls.get(controller as unknown as object);
  if (!form) return;

  const newErrors = getFormErrors(form);
  const newValid = form.checkValidity();

  // Only update if values actually changed (avoids infinite re-render)
  const ctrl = controller as unknown as Record<string, unknown>;
  const oldErrors = ctrl.errors as Record<string, string>;
  if (_shallowEqual(oldErrors, newErrors) && ctrl.isValid === newValid) return;

  ctrl.errors = newErrors;
  ctrl.isValid = newValid;
}

function _shallowEqual(a: Record<string, string>, b: Record<string, string>): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const k of aKeys) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}
