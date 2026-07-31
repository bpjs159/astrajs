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

// Server form integration — E2E validation bridge
export {
  serverForm,
  createValidatorMap,
} from './server-form.js';
export type {
  ServerFormConfig,
  ServerFormResult,
  ServerFormHandle,
  ServerValidator,
} from './server-form.js';

// Validator extraction — for SSR and server-side re-execution
export {
  extractValidators,
  serializeValidators,
  deserializeValidators,
  runValidators,
  registerValidator,
} from './validator-extractor.js';
export type { ValidatorMeta } from './validator-extractor.js';

// SSR Resumability — form state survives SSR → client transition
export {
  resumeFormControllers,
  serializeFormState,
  ensureFormResumeRegistered,
} from './ssr-bridge.js';
