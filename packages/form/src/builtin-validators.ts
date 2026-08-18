/**
 * astrajs.dev/form — Built-in Validator Registry
 *
 * Ships with the standard astrajs.dev/validation validators pre-registered.
 * When `serverForm()` runs validators server-side, it resolves validator
 * names against this registry automatically — the developer does NOT
 * need to provide a manual `createValidatorMap()`.
 *
 * Custom validators can still be provided via `serverValidators` in
 * the rare case where non-standard validation logic is needed.
 *
 * ## How It Works
 *
 * 1. Developer writes: `<input name="email" validate={isEmail} />`
 * 2. `extractValidators()` captures: `{ field: 'email', validatorName: 'isEmail' }`
 * 3. `runValidators()` resolves `'isEmail'` → built-in `isEmail` function
 * 4. Validation runs identically on client AND server — zero boilerplate
 */

import {
  isEmail,
  isRequired,
  isUrl,
  isNumber,
  isInteger,
  isAlphanumeric,
  minLength,
  maxLength,
  pattern,
  oneOf,
  all,
  any,
} from 'astrajs.dev/validation';
import type { Validator, AsyncValidator } from 'astrajs.dev/validation';

// ─── Registry Type ───────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ServerValidator = ((...args: any[]) => any) | Validator | AsyncValidator;

/**
 * Built-in validator registry.
 *
 * Maps validator function names → implementations. All standard
 * astrajs.dev/validation validators are pre-registered, so `serverForm()`
 * can auto-resolve them without a manual map.
 *
 * Custom validators can extend this via the `serverValidators` option
 * in `serverForm()`.
 */
export const BUILTIN_VALIDATORS: Record<string, ServerValidator> = {
  // Standalone validators
  isEmail,
  isRequired,
  isUrl,
  isNumber,
  isInteger,
  isAlphanumeric,

  // Factory validators (called with params at runtime)
  minLength,
  maxLength,
  pattern,
  oneOf,

  // Composition helpers
  all,
  any,
};

/**
 * Resolves a validator by name from the built-in registry.
 *
 * Returns the validator implementation if found, or `undefined` if
 * it's a custom/unknown validator.
 *
 * @param name — The validator function name (e.g., "isEmail", "minLength").
 * @returns The validator implementation, or undefined.
 */
export function resolveBuiltinValidator(name: string): ServerValidator | undefined {
  return BUILTIN_VALIDATORS[name];
}
