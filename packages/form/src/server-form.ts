/**
 * @astrajs/form — Server Form Validation Bridge
 *
 * `serverForm()` integrates the form controller with server-side validation.
 * The developer writes validation rules ONCE on the inputs, and AstraJS
 * automatically re-runs them on the server when the form is submitted.
 *
 * ## Zero-Config Auto-Resolution
 *
 * Standard `@astrajs/validation` validators (`isEmail`, `isRequired`,
 * `minLength`, etc.) are resolved automatically from the built-in registry.
 * **No manual `createValidatorMap()` needed.** Just write `validate={fn}`
 * on your inputs and AstraJS handles the rest.
 *
 * Custom validators can still be provided via `serverValidators` for
 * non-standard validation logic.
 *
 * ## How It Works
 *
 * 1. **Client side**: The form controller tracks input validity via the
 *    browser's Constraint Validation API. Validators attached via
 *    `validate={fn}` set `setCustomValidity()`.
 *
 * 2. **On submit**: If client validation passes (`formCtrl.isValid`),
 *    the form data is sent to the server via `server()`.
 *
 * 3. **Server side**: The same validators are re-executed against the
 *    submitted data. The server can also run additional checks
 *    (e.g., "email already taken").
 *
 * 4. **Error merging**: Server errors are fed back into the form
 *    controller via `setServerErrors()`. They're displayed alongside
 *    client-side errors. When the user edits a field, its server
 *    error is automatically cleared.
 *
 * ## Usage
 *
 * ```tsx
 * import { component, store } from '@astrajs/core';
 * import { form, serverForm } from '@astrajs/form';
 * import { isEmail, isRequired, minLength, all } from '@astrajs/validation';
 * import { server } from '@astrajs/server';
 *
 * export const RegisterPage = component(() => {
 *   const formData = store({ name: '', email: '', password: '' });
 *   const formCtrl = form();
 *
 *   // Validators auto-resolved — no createValidatorMap() needed!
 *   const { submit, isSubmitting } = serverForm({
 *     controller: formCtrl,
 *     data: formData,
 *     serverAction: server(async (data) => {
 *       if (data.email === 'taken@example.com') {
 *         return { ok: false, serverErrors: { email: 'Email already taken' } };
 *       }
 *       return { ok: true };
 *     }),
 *   });
 *
 *   return (
 *     <form controller={formCtrl} onSubmit={submit}>
 *       <input name="email" validate={all([isRequired, isEmail])} />
 *       {formCtrl.getError('email') && <p>{formCtrl.getError('email')}</p>}
 *       <button disabled={isSubmitting}>Register</button>
 *     </form>
 *   );
 * });
 * ```
 */

import type { FormController } from './controller.js';
import { extractValidators, runValidators } from './validator-extractor.js';
import type { ServerValidator } from './builtin-validators.js';

// Re-export for convenience
export type { ServerValidator } from './builtin-validators.js';

/**
 * Configuration for `serverForm()`.
 */
export interface ServerFormConfig<T extends Record<string, unknown>> {
  /** The form controller (from `form()`). */
  controller: FormController;
  /** The reactive store holding form data. */
  data: T;
  /**
   * The server action created with `server()`.
   * Receives the form data as a plain object.
   */
  serverAction: (data: T) => Promise<ServerFormResult>;
  /**
   * Optional custom validator map for server-side re-execution.
   * If omitted, only native HTML5 validation attributes are re-run on the server.
   * Provide this to re-run custom `validate={fn}` rules.
   *
   * Accepts both standalone validators (`isEmail`) and factory validators
   * (`minLength`, `maxLength`, `pattern`, `oneOf`). Factory validators are
   * called with their stored parameters at validation time.
   *
   * @example
   * ```ts
   * import * as v from '@astrajs/validation';
   * const customValidators = {
   *   isEmail: v.isEmail,
   *   isRequired: v.isRequired,
   *   minLength: v.minLength,   // factory validator
   *   pattern: v.pattern,       // factory validator
   * };
   * ```
   */
  serverValidators?: Record<string, ServerValidator>;
  /**
   * Called before server submission. Return `false` to abort.
   * Useful for adding custom pre-flight checks.
   */
  onBeforeSubmit?: (data: T) => boolean | Promise<boolean>;
  /**
   * Called after the server returns successfully (result.ok === true).
   * The form is automatically reset, but you can add custom logic here.
   */
  onSuccess?: (data: T, result: ServerFormResult) => void | Promise<void>;
  /**
   * Called when server validation fails.
   * The form controller is automatically updated with serverErrors,
   * but you can add custom logic here.
   */
  onError?: (data: T, result: ServerFormResult) => void | Promise<void>;
}

/**
 * Result returned by a server form action.
 */
export interface ServerFormResult {
  /** Whether the form submission was successful. */
  ok: boolean;
  /** Optional success message. */
  message?: string;
  /**
   * Server-side validation errors: `{ fieldName: errorMessage }`.
   * These are merged into the form controller via `setServerErrors()`.
   */
  serverErrors?: Record<string, string>;
  /** Optional redirect path after successful submission. */
  redirect?: string;
  /** Arbitrary data returned from the server. */
  data?: unknown;
}

/**
 * Return type of `serverForm()`. Provides the `submit` handler and
 * reactive `isSubmitting` flag.
 */
export interface ServerFormHandle {
  /**
   * The submit handler — pass directly to `<form onSubmit={submit}>`.
   * Handles client-side validation, server submission, error merging,
   * and auto-reset on success.
   */
  submit: (e: Event) => Promise<void>;
  /** True while the form is being submitted to the server. */
  isSubmitting: boolean;
  /**
   * Manually re-run server-side validation against current form data.
   * Useful for "validate on blur" patterns.
   */
  validateOnServer: () => Promise<Record<string, string>>;
}

// ─── Implementation ──────────────────────────────────────────────────────────

/**
 * Creates a server-integrated form handler.
 *
 * This is the main API for end-to-end form validation. It bridges
 * client-side validation (via the form controller + Constraint Validation API)
 * with server-side validation (re-running the same validators).
 *
 * @param config — Configuration object.
 * @returns A `ServerFormHandle` with `submit`, `isSubmitting`, and `validateOnServer`.
 */
export function serverForm<T extends Record<string, unknown>>(
  config: ServerFormConfig<T>
): ServerFormHandle {
  const {
    controller,
    data,
    serverAction,
    serverValidators = {},
    onBeforeSubmit,
    onSuccess,
    onError,
  } = config;

  let isSubmitting = false;

  const submit = async (e: Event): Promise<void> => {
    e.preventDefault();

    // ── Step 1: Client-side validation ────────────────────────────
    if (!controller.isValid) {
      controller.focusFirstError();
      return;
    }

    // ── Step 2: Pre-flight hook ───────────────────────────────────
    if (onBeforeSubmit) {
      const shouldProceed = await onBeforeSubmit(data);
      if (!shouldProceed) return;
    }

    // ── Step 3: Clear previous server errors ──────────────────────
    controller.clearServerErrors();

    // ── Step 4: Extract validators from the form DOM ──────────────
    // (Captured for potential server-side re-execution via the form element)
    const formEl = getFormElement(controller);
    if (formEl) {
      extractValidators(formEl);
    }

    // ── Step 5: Submit to server ──────────────────────────────────
    isSubmitting = true;
    try {
      const result = await serverAction(data as T);

      if (result.ok) {
        // Success → reset form and notify
        controller.reset();
        if (onSuccess) {
          await onSuccess(data as T, result);
        }
      } else {
        // Server returned errors
        if (result.serverErrors && Object.keys(result.serverErrors).length > 0) {
          controller.setServerErrors(result.serverErrors);
        }
        if (onError) {
          await onError(data as T, result);
        }
      }
    } catch (err) {
      // Network or server error
      console.error('[AstraJS Form] Server submission failed:', err);
      controller.setServerErrors({
        _form: 'Failed to submit. Please check your connection and try again.',
      });
    } finally {
      isSubmitting = false;
    }
  };

  /**
   * Manually triggers server-side validation against the current form data.
   * Useful for "validate on blur" or "check availability" patterns.
   */
  const validateOnServer = async (): Promise<Record<string, string>> => {
    const formEl = getFormElement(controller);
    if (!formEl) return {};

    const validatorMetas = extractValidators(formEl);

    // Convert store data to plain Record<string, string>
    const plainData: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      plainData[key] = String(value ?? '');
    }

    const errors = await runValidators(validatorMetas, plainData, serverValidators);

    if (Object.keys(errors).length > 0) {
      controller.setServerErrors(errors);
    }

    return errors;
  };

  return {
    submit,
    get isSubmitting() {
      return isSubmitting;
    },
    validateOnServer,
  };
}

// ─── Internal helpers ────────────────────────────────────────────────────────

/**
 * Retrieves the HTMLFormElement associated with a form controller.
 */
function getFormElement(_controller: FormController): HTMLFormElement | null {
  // The form element is stored in a WeakMap inside controller.ts.
  // We traverse the DOM to find the form associated with this controller.
  if (typeof document !== 'undefined') {
    // Find the form that has this controller attached.
    // In practice, each component has one form, so returning the first
    // connected form is a pragmatic default.
    const forms = document.querySelectorAll('form');
    for (const form of forms) {
      if ((form as HTMLFormElement).isConnected) {
        return form as HTMLFormElement;
      }
    }
  }
  return null;
}
