/**
 * astrajs.dev/core — CSS Class Name Composer
 *
 * `classes()` composes CSS class names from strings, objects, and arrays.
 * Falsy values (`false`, `null`, `undefined`, `0`, `''`) are silently
 * filtered out. Objects use their keys as class names when the value is truthy.
 *
 * Designed to replace manual string concatenation patterns like:
 *   `styles.box + ' ' + styles['box-' + theme]`
 * with:
 *   `classes(styles.box, styles['box-' + theme])`
 *
 * @example
 * ```ts
 * classes('btn', isActive && 'btn-active', { 'btn-disabled': isDisabled })
 * // → 'btn btn-active' or 'btn btn-disabled'
 * ```
 */

export type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ClassValue[]
  | { [key: string]: boolean | null | undefined };

/**
 * Composes CSS class names from mixed arguments.
 * Falsy values are filtered out. Nested arrays are flattened.
 * Object keys are included when their values are truthy.
 */
export function classes(...args: ClassValue[]): string {
  const result: string[] = [];

  for (const arg of args) {
    if (!arg) continue;

    if (typeof arg === 'string' || typeof arg === 'number') {
      result.push(String(arg));
    } else if (Array.isArray(arg)) {
      for (const item of arg) {
        if (item && (typeof item === 'string' || typeof item === 'number')) {
          result.push(String(item));
        }
      }
    } else if (typeof arg === 'object') {
      for (const [key, value] of Object.entries(arg)) {
        if (value) result.push(key);
      }
    }
  }

  return result.join(' ');
}
