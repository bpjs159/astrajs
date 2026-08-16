/**
 * @bpjs159/validation — Validator Functions
 *
 * Each validator is a pure function `(value: string) => string | true`:
 * - Returns `true` when the value passes validation.
 * - Returns a `string` (error message) when validation fails.
 *
 * Factory validators (minLength, maxLength, pattern) take configuration
 * and return a validator function.
 *
 * All validators are compatible with the JSX `validate` prop:
 *
 * ```tsx
 * <input validate={isEmail} />
 * <input validate={minLength(3)} />
 * <input validate={all([isRequired, isEmail])} />
 * ```
 */

/** Signature of a synchronous validator. Compatible with JSX `validate` prop. */
export type Validator = (value: string) => string | true;

/** Signature of an async validator. */
export type AsyncValidator = (value: string) => string | true | Promise<string | true>;

// ─── Regex constants ─────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
const ALPHANUMERIC_RE = /^[a-zA-Z0-9]+$/;

// ─── Standalone validators ───────────────────────────────────────────────────

/**
 * Validates that the value looks like an email address.
 *
 * @example
 * ```tsx
 * <input validate={isEmail} />
 * ```
 */
export function isEmail(value: string): string | true {
  if (!value || value.trim().length === 0) return true; // let isRequired handle emptiness
  return EMAIL_RE.test(value) ? true : 'Invalid email format';
}

/**
 * Validates that the value is not empty (after trimming).
 *
 * @example
 * ```tsx
 * <input validate={isRequired} />
 * ```
 */
export function isRequired(value: string): string | true {
  return value.trim().length > 0 ? true : 'This field is required';
}

/**
 * Validates that the value looks like a URL (http/https).
 *
 * @example
 * ```tsx
 * <input validate={isUrl} />
 * ```
 */
export function isUrl(value: string): string | true {
  if (!value || value.trim().length === 0) return true;
  return URL_RE.test(value) ? true : 'Invalid URL format';
}

/**
 * Validates that the value is a valid number string.
 *
 * @example
 * ```tsx
 * <input validate={isNumber} />
 * ```
 */
export function isNumber(value: string): string | true {
  if (!value || value.trim().length === 0) return true;
  return !isNaN(Number(value)) && value.trim().length > 0 ? true : 'Must be a number';
}

/**
 * Validates that the value is a valid integer string.
 *
 * @example
 * ```tsx
 * <input validate={isInteger} />
 * ```
 */
export function isInteger(value: string): string | true {
  if (!value || value.trim().length === 0) return true;
  return /^-?\d+$/.test(value.trim()) ? true : 'Must be an integer';
}

/**
 * Validates that the value contains only alphanumeric characters (a-z, A-Z, 0-9).
 *
 * @example
 * ```tsx
 * <input validate={isAlphanumeric} />
 * ```
 */
export function isAlphanumeric(value: string): string | true {
  if (!value || value.trim().length === 0) return true;
  return ALPHANUMERIC_RE.test(value) ? true : 'Only letters and numbers allowed';
}

// ─── Factory validators ──────────────────────────────────────────────────────

/**
 * Creates a validator that requires a minimum string length.
 *
 * @param n — Minimum number of characters required.
 * @param message — Optional custom error message.
 *
 * @example
 * ```tsx
 * <input validate={minLength(3)} />
 * <input validate={minLength(8, 'Password too short')} />
 * ```
 */
export function minLength(n: number, message?: string): Validator {
  return (value: string): string | true =>
    value.length >= n ? true : message ?? `At least ${n} characters required`;
}

/**
 * Creates a validator that enforces a maximum string length.
 *
 * @param n — Maximum number of characters allowed.
 * @param message — Optional custom error message.
 *
 * @example
 * ```tsx
 * <input validate={maxLength(100)} />
 * ```
 */
export function maxLength(n: number, message?: string): Validator {
  return (value: string): string | true =>
    value.length <= n ? true : message ?? `At most ${n} characters allowed`;
}

/**
 * Creates a validator that tests the value against a regular expression.
 *
 * @param regex — The regular expression to test against.
 * @param message — Optional custom error message.
 *
 * @example
 * ```tsx
 * <input validate={pattern(/^[A-Z]{2,}$/, 'Must be uppercase letters only')} />
 * ```
 */
export function pattern(regex: RegExp, message?: string): Validator {
  return (value: string): string | true =>
    regex.test(value) ? true : message ?? `Invalid format`;
}

/**
 * Creates a validator that checks the value is one of the allowed options.
 *
 * @param values — Allowed values.
 * @param message — Optional custom error message.
 *
 * @example
 * ```tsx
 * <select validate={oneOf(['admin', 'user', 'guest'])} />
 * ```
 */
export function oneOf(values: string[], message?: string): Validator {
  const set = new Set(values);
  return (value: string): string | true =>
    set.has(value) ? true : message ?? `Must be one of: ${values.join(', ')}`;
}
