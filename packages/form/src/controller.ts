/**
 * astrajs.dev/form — Form Controller
 *
 * `form()` returns a reactive proxy that manages form metadata:
 * errors, touched, isDirty, isValid, isSubmitting, isValidating, submitCount.
 *
 * ## Architecture
 *
 * - **Data** lives in `astrajs.dev/core` stores (the developer's responsibility).
 * - **Metadata** lives in this controller (auto-managed via native DOM events).
 * - **Validation** is delegated 100% to the browser's Constraint Validation API.
 * - **No manual validation loops** — we read `ValidityState` from the DOM.
 */

import { store, mounted } from 'astrajs.dev/core';
import { getFormErrors } from './validity-map.js';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FormController {
  /** Client-side error codes keyed by input `name`. Populated from ValidityState. Read-only. */
  readonly errors: Record<string, string>;
  /** Server-side error messages keyed by input `name`. Set via `setServerErrors()`. Read-only. */
  readonly serverErrors: Record<string, string>;
  /** Whether each field has been blurred. Read-only. */
  readonly touched: Record<string, boolean>;
  /** True if any field has been modified. Read-only. */
  readonly isDirty: boolean;
  /** True if all fields pass native HTML5 validation. Read-only. */
  readonly isValid: boolean;
  /** True while async validators are running. Read-only. */
  readonly isValidating: boolean;

  /** Get the current error code for a specific field (merges client + server errors). */
  getError(name: string): string | undefined;
  /** Focus the first invalid field with smooth scroll. */
  focusFirstError(): void;
  /** Reset all metadata and the physical DOM form. */
  reset(): void;
  /** Force re-evaluation of all inputs' validity state. */
  validateAll(): void;
  /**
   * Set server-side validation errors.
   * Merged with client errors so `formCtrl.errors` reflects all errors.
   */
  setServerErrors(errors: Record<string, string>): void;
  /** Clear server-side errors (e.g., when user starts editing again). */
  clearServerErrors(): void;
  /**
   * Release all internal references.
   *
   * **Normally not needed** — dispose() is called automatically when the
   * parent component unmounts (via `mounted()` cleanup). Use this only
   * if you need to manually detach the controller before unmount.
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
    _serverErrors: {} as Record<string, string>,
    touched: {} as Record<string, boolean>,
    isDirty: false,
    isValid: true,
    isValidating: false,

    // Computed: merges client + server errors (server wins for same field).
    get serverErrors(): Record<string, string> {
      return (this as unknown as Record<string, unknown>)._serverErrors as Record<string, string>;
    },

    getError(name: string): string | undefined {
      const self = this as unknown as Record<string, unknown>;
      const serverErrs = self._serverErrors as Record<string, string>;
      const clientErrs = self.errors as Record<string, string>;
      // Server errors take priority over client errors
      return serverErrs[name] ?? clientErrs[name];
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
      s._serverErrors = {};
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

    /**
     * Set server-side validation errors. These are merged with client errors.
     * When the user starts editing a field that had a server error,
     * the server error for that field is automatically cleared.
     */
    setServerErrors(errors: Record<string, string>): void {
      const s = state as unknown as Record<string, unknown>;
      s._serverErrors = { ...errors };

      // Mark inputs with server errors using setCustomValidity
      // so the native Constraint Validation API reflects them
      const form = _formEls.get(state);
      if (form) {
        for (const [name, message] of Object.entries(errors)) {
          const input = form.querySelector(`[name="${CSS.escape(name)}"]`) as
            | HTMLInputElement
            | HTMLTextAreaElement
            | HTMLSelectElement
            | null;
          if (input) {
            input.setCustomValidity(message);
            input.setAttribute('data-astra-server-error', '');
          }
        }
        // Refresh to update errors map
        _refresh(state);
      }
    },

    clearServerErrors(): void {
      const s = state as unknown as Record<string, unknown>;
      s._serverErrors = {};

      // Clear custom validity from inputs that had server errors
      const form = _formEls.get(state);
      if (form) {
        for (const el of form.querySelectorAll('[data-astra-server-error]')) {
          const input = el as HTMLInputElement;
          input.setCustomValidity('');
          input.removeAttribute('data-astra-server-error');
          // Re-run the input validator to restore client-only state
          input.dispatchEvent(new Event('input'));
        }
        _refresh(state);
      }
    },

    // Called by JSX runtime via <form controller={...}> directive.
    _attach(formEl: HTMLFormElement): void {
      _formEls.set(state, formEl);

      if (_wired.has(state)) return;
      _wired.add(state);

      // Event delegation on document — survives component() re-renders
      _delegate(state as unknown as FormController);

      // Wire up server-error auto-clear on input
      _wireServerErrorAutoClear(formEl, state as unknown as Record<string, unknown>);

      // Auto-dispose when the parent component unmounts.
      // _attach() runs synchronously inside the component function,
      // so mounted() correctly registers against the current wrapper.
      // The developer never needs to call dispose() manually.
      mounted(() => () => {
        _formEls.delete(state);
        _wired.delete(state);
      });
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

// ─── Server error auto-clear on user input ───────────────────────────────────

/**
 * When the user starts editing a field that had a server error,
 * clear the server error for that field so the user sees fresh
 * client-side validation.
 */
function _wireServerErrorAutoClear(
  formEl: HTMLFormElement,
  internalState: Record<string, unknown>
): void {
  formEl.addEventListener(
    'input',
    (e: Event) => {
      const input = e.target as HTMLElement | null;
      if (!input) return;
      const name =
        (input as HTMLInputElement).name ??
        input.getAttribute('name');
      if (!name) return;

      const serverErrs = internalState._serverErrors as Record<string, string>;
      if (serverErrs[name]) {
        // Clear server error for this field
        const newServerErrs = { ...serverErrs };
        delete newServerErrs[name];
        internalState._serverErrors = newServerErrs;

        // Clear custom validity marker
        (input as HTMLInputElement).setCustomValidity('');
        input.removeAttribute('data-astra-server-error');
        // Trigger re-validation to show client-side errors
        (input as HTMLInputElement).dispatchEvent(new Event('input'));
      }
    },
    true // capture phase — fires before the form controller's input handler
  );
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

// ─── Reentrancy guard ────────────────────────────────────────────────────────
//
// `_refresh()` calls `form.checkValidity()`, and per the HTML spec
// `checkValidity()` **fires an `invalid` event** on every control that
// fails constraint validation. Our document-level `invalid` listener
// (capture phase) calls `_refresh()` again, which calls `checkValidity()`
// again → infinite synchronous recursion → RangeError / browser OOM.
//
// The guard below breaks that loop: while a refresh is in flight, re-entrant
// calls (triggered by the `invalid` events that checkValidity() itself
// dispatched) are ignored. The very first `_refresh()` still runs to
// completion and writes the real errors/validity state.
let _refreshing = false;

function _refresh(controller: FormController): void {
  // Re-entrancy guard: `form.checkValidity()` fires `invalid` events, which
  // the document listener forwards back into `_refresh()`. Swallow those
  // re-entrant calls instead of recursing forever.
  if (_refreshing) return;

  const form = _formEls.get(controller as unknown as object);
  if (!form) return;

  _refreshing = true;
  try {
    const newErrors = getFormErrors(form);
    const newValid = form.checkValidity();

    // Only update if values actually changed (avoids infinite re-render)
    const ctrl = controller as unknown as Record<string, unknown>;
    const oldErrors = ctrl.errors as Record<string, string>;
    if (_shallowEqual(oldErrors, newErrors) && ctrl.isValid === newValid) return;

    ctrl.errors = newErrors;
    ctrl.isValid = newValid;
  } finally {
    _refreshing = false;
  }
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
