/**
 * @bpjs159/validation — Public API
 *
 * Lightweight, standalone validator functions for forms and schemas.
 * Each validator returns `true` on success or an error `string` on failure.
 *
 * ## Quick Start
 *
 * ```ts
 * import { isEmail, isRequired, minLength, all } from '@bpjs159/validation';
 *
 * // Use directly as validate prop in JSX:
 * // <input validate={isEmail} />
 * // <input validate={all([isRequired, minLength(3)])} />
 *
 * // Or call standalone:
 * isEmail('hello@world.com'); // true
 * isEmail('bad');             // 'Invalid email format'
 * ```
 *
 * ## Available Validators
 *
 * | Validator       | Type          | Description                              |
 * |-----------------|---------------|------------------------------------------|
 * | `isEmail`       | standalone    | Validates email format                   |
 * | `isRequired`    | standalone    | Non-empty after trim                     |
 * | `isUrl`         | standalone    | Validates http/https URL                 |
 * | `isNumber`      | standalone    | Valid numeric string                     |
 * | `isInteger`     | standalone    | Valid integer string                     |
 * | `isAlphanumeric`| standalone    | Only a-z, A-Z, 0-9                       |
 * | `minLength(n)`  | factory       | Minimum character count                  |
 * | `maxLength(n)`  | factory       | Maximum character count                  |
 * | `pattern(re)`   | factory       | Custom regex test                        |
 * | `oneOf([...])`  | factory       | Value must be in the allowed set         |
 * | `all([...])`    | composition   | All must pass (AND, supports async)      |
 * | `any([...])`    | composition   | At least one must pass (OR)              |
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
} from './validators.js';

export { all, any } from './compose.js';

export type { Validator, AsyncValidator } from './validators.js';
