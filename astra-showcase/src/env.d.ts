/* eslint-disable */
/**
 * AstraStore — JSX Type Augmentation
 *
 * WORKAROUND: TypeScript's built-in JSX child type (`string | Element`)
 * doesn't accept numbers or arrays. This augmentation widens the type.
 *
 * NOTE: This MUST be in a file with no imports/exports (ambient script).
 */

declare namespace JSX {
  // Override children to accept numbers and arrays
  interface HTMLAttributes<T> {
    children?: JSX.Element | string | number | boolean | null | undefined | readonly JSX.Element[];
  }
}
