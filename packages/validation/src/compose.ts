/**
 * @bpjs159/validation — Composition Helpers
 *
 * Compose multiple validators together:
 * - `all([...])` — every validator must pass (AND semantics).
 * - `any([...])` — at least one validator must pass (OR semantics).
 *
 * ```tsx
 * <input validate={all([isRequired, isEmail])} />
 * <input validate={any([isEmail, isUrl])} />
 * ```
 */

import type { Validator, AsyncValidator } from './validators.js';

/**
 * Returns a validator that passes only if ALL validators pass.
 * Short-circuits on the first failure, returning that error message.
 * Accepts both sync and async validators.
 *
 * @example
 * ```tsx
 * <input validate={all([isRequired, isEmail])} />
 * <input validate={all([isRequired, minLength(3), asyncCheck])} />
 * ```
 */
export function all(validators: AsyncValidator[]): AsyncValidator {
  return async (value: string): Promise<string | true> => {
    // Run sequentially to short-circuit on first error
    for (const v of validators) {
      const result = await v(value);
      if (result !== true) return result;
    }
    return true;
  };
}

/**
 * Returns a validator that passes if ANY validator passes.
 * If none pass, returns the last error message.
 *
 * @example
 * ```tsx
 * <input validate={any([isEmail, isUrl])} />
 * ```
 */
export function any(validators: Validator[]): Validator {
  return (value: string): string | true => {
    let lastError: string | true = true;
    for (const v of validators) {
      const result = v(value);
      if (result === true) return true;
      lastError = result;
    }
    return lastError;
  };
}
