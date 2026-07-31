/**
 * @astrajs/form — Validator Extractor
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

import type { Validator, AsyncValidator } from '@astrajs/validation';

// ─── Validator Types ─────────────────────────────────────────────────────────

/**
 * A validator function or a factory that produces one.
 * Factory validators (like `minLength`) are called with stored params
 * at runtime to produce a concrete validator.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ServerValidator = ((...args: any[]) => any) | Validator | AsyncValidator;

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
      // Check the registry first
      const registered = _validatorRegistry.get(customValidate);
      if (registered) {
        result.push(registered);
      } else {
        // Fallback: try to detect the function name
        const name = customValidate.name || 'custom';
        result.push({ field, validatorName: name });
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
 * This function is designed to work on BOTH client and server.
 *
 * @param validators — The validator metadata (extracted from the form).
 * @param formData — The submitted form data as a plain object.
 * @param validatorMap — A map of validator name → implementation function.
 * @returns A record of `{ fieldName: errorMessage }` for failing fields.
 *
 * @example
 * ```ts
 * import { isEmail, isRequired, minLength } from '@astrajs/validation';
 *
 * const errors = runValidators(
 *   [
 *     { field: 'email', validatorName: 'isRequired' },
 *     { field: 'email', validatorName: 'isEmail' },
 *     { field: 'password', validatorName: 'minLength', params: [8] },
 *   ],
 *   { email: '', password: '123' },
 *   { isRequired, isEmail, minLength }
 * );
 * // → { email: 'This field is required', password: 'At least 8 characters required' }
 * ```
 */
export async function runValidators(
  validators: ValidatorMeta[],
  formData: Record<string, string>,
  validatorMap: Record<string, ServerValidator>
): Promise<Record<string, string>> {
  const errors: Record<string, string> = {};

  for (const meta of validators) {
    const { field, validatorName, params = [] } = meta;
    const value = formData[field] ?? '';

    // Resolve the validator function
    const validatorFn = validatorMap[validatorName];
    if (!validatorFn) {
      // Skip unknown validators (they may be client-only custom functions)
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
