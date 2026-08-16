/**
 * @bpjs159/core/validation — Re-export of @bpjs159/validation
 *
 * Convenience re-export so developers can import validators
 * directly from `@bpjs159/core` without installing a separate package.
 *
 * ```ts
 * import { isEmail, isRequired, all } from '@bpjs159/core/validation';
 * // or
 * import { isEmail, isRequired, all } from '@bpjs159/validation';
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
} from '@bpjs159/validation';

export type { Validator, AsyncValidator } from '@bpjs159/validation';
