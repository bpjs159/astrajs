/**
 * @bpjs159/form — Validator Extractor
 *
 * Extracts validation rules attached to form inputs (via the `validate` prop)
 * and serializes them so the same rules can be re-executed on the server.
 *
 * ## Architecture
 *
 * 1. **At build time / SSR render**: The DOM form is walked and `validate`
 *    functions attached to each input are collected.
 * 2. **On the server**: The same validators are re-executed against
 *    submitted form data, ensuring identical validation logic runs on
 *    both client and server.
 * 3. **The developer writes validation ONCE** — on the input's `validate` prop.
 *
 * ## How It Works
 *
 * AstraJS validators are pure functions: `(value: string) => string | true`.
 * Since they're pure and serializable (by name/reference), we can:
 * - Serialize their names/references for SSR embedding
 * - Re-import them on the server and re-run against form data
 * - Merge server results back into the form controller via `setServerErrors()`
 */

import type { Validator, AsyncValidator } from '@bpjs159/validation';
import { resolveBuiltinValidator } from './builtin-validators.js';
import type { ServerValidator } from './builtin-validators.js';

// Re-export for convenience
export type { ServerValidator } from './builtin-validators.js';

// ─── Validator Metadata ──────────────────────────────────────────────────────

/**
 * Metadata describing a validation rule attached to an input.
 * This is what gets serialized into the HTML for SSR resumability.
 */
export interface ValidatorMeta {
  /** The `name` attribute of the input this validator belongs to. */
  field: string;
  /** The validator function name (e.g., "isEmail", "minLength"). */
  validatorName: string;
  /** Optional parameters for factory validators (e.g., [3] for minLength(3)). */
  params?: unknown[];
  /** The original error message template. */
  message?: string;
  /**
   * Direct reference to the validator function (client-side only).
   * When available, this takes priority over name-based lookup,
   * enabling zero-config server-side re-execution for standard validators.
   */
  fn?: Validator | AsyncValidator;
}

/**
 * Maps a validator function reference to its metadata.
 * Used to serialize validation rules for SSR.
 */
const _validatorRegistry = new Map<Validator | AsyncValidator, ValidatorMeta>();

/**
 * Registers a validator for extraction.
 * Called by the JSX runtime when `validate={fn}` is processed.
 */
export function registerValidator(
  inputName: string,
  fn: Validator | AsyncValidator,
  meta: Omit<ValidatorMeta, 'field'>
): void {
  _validatorRegistry.set(fn, { field: inputName, ...meta });
}

/**
 * Extracts all validation metadata from a DOM form element.
 *
 * Walks all inputs within the form and collects:
 * - Native HTML5 validation attributes (required, minLength, maxLength, pattern, type)
 * - Custom `validate` functions attached via the `__astraValidate` property
 *
 * @param formEl — The HTML form element to scan.
 * @returns An array of validator metadata, serializable to JSON.
 */
export function extractValidators(formEl: HTMLFormElement): ValidatorMeta[] {
  const result: ValidatorMeta[] = [];

  const inputs = formEl.querySelectorAll<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >('input, textarea, select');

  for (const input of inputs) {
    if (!input.name) continue;
    const field = input.name;

    // ── Extract native HTML5 validation attributes ──
    if (input.hasAttribute('required') || input.required) {
      result.push({ field, validatorName: 'isRequired' });
    }

    const tag = input.tagName.toLowerCase();
    if (tag === 'input') {
      const type = (input as HTMLInputElement).type;
      if (type === 'email') {
        result.push({ field, validatorName: 'isEmail' });
      }
      if (type === 'url') {
        result.push({ field, validatorName: 'isUrl' });
      }
    }

    const minLen = input.getAttribute('minlength') ?? input.getAttribute('minLength');
    if (minLen !== null) {
      result.push({
        field,
        validatorName: 'minLength',
        params: [parseInt(minLen, 10)],
      });
    }

    const maxLen = input.getAttribute('maxlength') ?? input.getAttribute('maxLength');
    if (maxLen !== null) {
      result.push({
        field,
        validatorName: 'maxLength',
        params: [parseInt(maxLen, 10)],
      });
    }

    const patternAttr = input.getAttribute('pattern');
    if (patternAttr !== null) {
      result.push({
        field,
        validatorName: 'pattern',
        params: [patternAttr],
      });
    }

    // ── Extract custom validate={fn} functions ──
    const customValidate = (input as unknown as Record<string, unknown>).__astraValidate as
      | Validator
      | AsyncValidator
      | undefined;
    if (customValidate) {
      // Try to resolve the function name (for serialization / SSR)
      const fnName =
        (input as unknown as Record<string, unknown>).__astraValidateName as string | undefined
        ?? customValidate.name
        ?? 'custom';

      // Check the registry first
      const registered = _validatorRegistry.get(customValidate);
      if (registered) {
        result.push({ ...registered, fn: customValidate });
      } else {
        result.push({
          field,
          validatorName: fnName,
          fn: customValidate, // direct reference for client-side auto-resolution
        });
      }
    }
  }

  return result;
}

/**
 * Serializes validator metadata to a JSON string suitable for
 * embedding in an HTML attribute (for SSR resumability).
 *
 * @param validators — Array of validator metadata.
 * @returns A URL-safe base64-encoded JSON string.
 */
export function serializeValidators(validators: ValidatorMeta[]): string {
  try {
    const json = JSON.stringify(validators);
    // Use base64url for safe HTML attribute embedding
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(json).toString('base64url');
    }
    // Browser fallback
    return btoa(json)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch {
    return '';
  }
}

/**
 * Deserializes validator metadata from a serialized string.
 *
 * @param encoded — The base64url-encoded JSON string.
 * @returns Array of validator metadata.
 */
export function deserializeValidators(encoded: string): ValidatorMeta[] {
  try {
    let json: string;
    if (typeof Buffer !== 'undefined') {
      json = Buffer.from(encoded, 'base64url').toString('utf-8');
    } else {
      // Browser fallback
      json = atob(encoded.replace(/-/g, '+').replace(/_/g, '/'));
    }
    return JSON.parse(json) as ValidatorMeta[];
  } catch {
    return [];
  }
}

/**
 * Runs validators against form data — server-side compatible.
 *
 * Given the validator metadata extracted from the form and the submitted
 * form data, re-runs every validation rule and returns a map of
 * `{ fieldName: errorMessage }` for any failing fields.
 *
 * **Auto-resolution**: Standard @bpjs159/validation validators are resolved
 * automatically from the built-in registry. No manual `createValidatorMap()`
 * needed. Custom validators can be provided via `customValidators`.
 *
 * This function is designed to work on BOTH client and server.
 *
 * @param validators — The validator metadata (extracted from the form).
 * @param formData — The submitted form data as a plain object.
 * @param customValidators — Optional map for non-standard/custom validators.
 * @returns A record of `{ fieldName: errorMessage }` for failing fields.
 *
 * @example
 * ```ts
 * // Standard validators — auto-resolved, no map needed:
 * const errors = await runValidators(
 *   [{ field: 'email', validatorName: 'isEmail' }],
 *   { email: 'bad' }
 * );
 * // → { email: 'Invalid email format' }
 *
 * // With custom validators:
 * const errors = await runValidators(
 *   [{ field: 'username', validatorName: 'isUnique' }],
 *   { username: 'taken' },
 *   { isUnique: async (v) => v === 'taken' ? 'Taken' : true }
 * );
 * ```
 */
export async function runValidators(
  validators: ValidatorMeta[],
  formData: Record<string, string>,
  customValidators?: Record<string, ServerValidator>
): Promise<Record<string, string>> {
  const errors: Record<string, string> = {};

  for (const meta of validators) {
    const { field, validatorName, params = [], fn: directFn } = meta;
    const value = formData[field] ?? '';

    // ── Resolution order ──────────────────────────────────────────
    // 1. Direct function reference (captured from DOM on client)
    // 2. Custom validators map (provided by developer for non-standard)
    // 3. Built-in registry (@bpjs159/validation standard validators)
    let validatorFn: ServerValidator | undefined;

    if (directFn) {
      // Direct reference — use immediately (client-side path)
      validatorFn = directFn;
    } else if (customValidators && customValidators[validatorName]) {
      validatorFn = customValidators[validatorName];
    } else {
      // Auto-resolve from built-in registry
      validatorFn = resolveBuiltinValidator(validatorName);
    }

    if (!validatorFn) {
      // Unknown validator — skip (may be client-only custom inline function)
      continue;
    }

    // If it's a factory validator (returns a function), call it with params.
    // Otherwise, use it directly as a concrete validator.
    const fn: Validator | AsyncValidator = params.length > 0
      ? (validatorFn as (...args: unknown[]) => Validator | AsyncValidator)(...params)
      : (validatorFn as Validator | AsyncValidator);

    try {
      const result = await fn(value);
      if (result !== true && typeof result === 'string') {
        // Only set if not already set (first error wins per field)
        if (!errors[field]) {
          errors[field] = result;
        }
      }
    } catch {
      // Validator threw — treat as validation failure
      if (!errors[field]) {
        errors[field] = `Validation failed for ${field}`;
      }
    }
  }

  return errors;
}
