/**
 * @astrajs/form — Public API
 *
 * Reactive form metadata controller. Delegates validation to
 * the browser's native Constraint Validation API.
 *
 * ```ts
 * import { form } from '@astrajs/form';
 *
 * const registerForm = form();
 * // <form controller={registerForm}> — wired automatically by JSX runtime
 * ```
 */
export { form } from './controller.js';
export type { FormController } from './controller.js';
export { getFormErrors, getErrorCode } from './validity-map.js';
export type { ErrorCode } from './validity-map.js';
