/**
 * astrajs.dev/core/validation — Re-export of astrajs.dev/validation
 *
 * Convenience re-export so developers can import validators
 * directly from `astrajs.dev/core` without installing a separate package.
 *
 * ```ts
 * import { isEmail, isRequired, all } from 'astrajs.dev/core/validation';
 * // or
 * import { isEmail, isRequired, all } from 'astrajs.dev/validation';
 * ```
 */

export {
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

export type { Validator, AsyncValidator } from 'astrajs.dev/validation';
