/**
 * @astrajs/core/validation — Re-export of @astrajs/validation
 *
 * Convenience re-export so developers can import validators
 * directly from `@astrajs/core` without installing a separate package.
 *
 * ```ts
 * import { isEmail, isRequired, all } from '@astrajs/core/validation';
 * // or
 * import { isEmail, isRequired, all } from '@astrajs/validation';
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
} from '@astrajs/validation';

export type { Validator, AsyncValidator } from '@astrajs/validation';
