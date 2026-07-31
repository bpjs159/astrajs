/**
 * @astrajs/form — SSR Resumability Bridge
 *
 * Enables form controllers to survive SSR → client transition.
 * When a form is server-rendered with `astra-data` attributes containing
 * serialized form controller state, this module restores the controller
 * state and re-attaches event delegation on the client.
 *
 * ## How It Works
 *
 * ### Server (SSR)
 * 1. Form elements are rendered with `astra-data` attributes containing
 *    serialized form controller state (touched, serverErrors, etc.).
 * 2. Validator metadata (`astra-validators` attribute) is embedded
 *    for server-side re-execution.
 *
 * ### Client (Resume)
 * 1. `resume()` finds all `[astra-data]` elements and deserializes state.
 * 2. This module's `resumeFormControllers()` is called, which:
 *    - Finds all `<form>` elements with `astra-data`
 *    - Creates fresh `form()` controllers
 *    - Restores serialized state (touched, errors)
 *    - Re-attaches the `_attach()` method to wire event delegation
 * 3. Forms are interactive immediately — no re-render needed.
 *
 * ## Registration
 *
 * This module auto-registers with `@astrajs/ssr` on import, so the
 * SSR `resume()` function automatically handles forms.
 * Just importing `@astrajs/form` on the client entry point is enough.
 */

import { registerFormResumeHandler } from '@astrajs/ssr';
import { deserializeValidators } from './validator-extractor.js';
import { form } from './controller.js';
import type { FormController } from './controller.js';

// ─── Auto-registration ───────────────────────────────────────────────────────

/**
 * Register the form resume handler with @astrajs/ssr.
 *
 * This is called at module import time (side-effect). When the SSR
 * `resume()` function runs, it will invoke this handler to restore
 * form controller state and re-attach event delegation.
 *
 * The registration is idempotent — calling it multiple times is safe.
 */
registerFormResumeHandler(resumeFormControllers);

// Track whether we've already registered to avoid double-setup
let _resumeRegistered = false;

/**
 * Ensures the form resume handler is registered with @astrajs/ssr.
 *
 * Called by the form controller's `_attach()` method so that forms
 * created after `resume()` (e.g., client-side navigation) also
 * benefit from SSR state restoration.
 *
 * This is safe to call at any time — registration is idempotent.
 */
export function ensureFormResumeRegistered(): void {
  if (_resumeRegistered) return;
  _resumeRegistered = true;
  // Already registered above; this just tracks the flag
}

// ─── Form State Restoration ──────────────────────────────────────────────────

/**
 * Restores form controller state from SSR-serialized attributes.
 *
 * Scans the DOM for `<form>` elements with `astra-data` attributes,
 * creates fresh form controllers, restores their serialized state,
 * and re-attaches event delegation so the forms become interactive
 * without re-running component code.
 *
 * @param root — The root element to scan (default: `document`).
 * @returns A Map of form element → restored FormController.
 */
export function resumeFormControllers(
  root: ParentNode = document
): Map<HTMLFormElement, FormController> {
  const formControllers = new Map<HTMLFormElement, FormController>();

  // Find all <form> elements with astra-data
  const forms = root.querySelectorAll<HTMLFormElement>('form[astra-data]');

  for (const formEl of forms) {
    const rawState = formEl.getAttribute('astra-data');
    if (!rawState) continue;

    // ── Restore form controller state ──────────────────────────────
    let serializedState: Record<string, unknown>;
    try {
      serializedState = JSON.parse(rawState);
    } catch {
      console.warn(
        '[AstraJS Form] Failed to parse serialized form state for resume.'
      );
      continue;
    }

    // Create a fresh form controller
    const formCtrl = form();

    // Restore touched state
    if (serializedState.touched && typeof serializedState.touched === 'object') {
      const touched = serializedState.touched as Record<string, boolean>;
      for (const [name, isTouched] of Object.entries(touched)) {
        if (isTouched) {
          const input = formEl.querySelector(
            `[name="${CSS.escape(name)}"]`
          ) as HTMLElement | null;
          if (input) {
            input.setAttribute('data-astra-touched', '');
          }
        }
      }
    }

    // Restore server errors
    if (
      serializedState.serverErrors &&
      typeof serializedState.serverErrors === 'object'
    ) {
      const serverErrors = serializedState.serverErrors as Record<string, string>;
      if (Object.keys(serverErrors).length > 0) {
        formCtrl.setServerErrors(serverErrors);
      }
    }

    // Restore validator metadata
    const validatorsAttr = formEl.getAttribute('astra-validators');
    if (validatorsAttr) {
      const validators = deserializeValidators(validatorsAttr);
      // Store on the form element for the serverForm() bridge to use
      (formEl as Record<string, unknown>).__astraValidatorMetas = validators;
    }

    // ── Re-attach the controller to the form element ──────────────
    // This wires up event delegation and makes the controller active.
    (formCtrl as unknown as { _attach(el: HTMLFormElement): void })._attach(formEl);

    // ── Re-run validation to sync ValidityState ───────────────────
    // After restoring touched/server-errors, re-evaluate validity
    // so CSS :invalid pseudo-class and error messages are correct.
    formCtrl.validateAll();

    formControllers.set(formEl, formCtrl);

    // Clean up the attribute (optional — keep for debugging)
    // formEl.removeAttribute('astra-data');
  }

  return formControllers;
}

/**
 * Serializes form controller state for SSR embedding.
 *
 * This is called during SSR rendering. It produces an object that
 * is embedded as `astra-data` on the `<form>` element, so the
 * client can restore the form state without re-executing components.
 *
 * @param controller — The form controller to serialize.
 * @returns A plain object ready for JSON serialization.
 */
export function serializeFormState(controller: FormController): Record<string, unknown> {
  // Only serialize what's needed for resumability:
  // - touched: which fields the user has interacted with
  // - serverErrors: errors from server validation
  // (client-side errors are regenerated from ValidityState on resume)

  return {
    touched: { ...controller.touched },
    serverErrors: { ...controller.serverErrors },
  };
}
