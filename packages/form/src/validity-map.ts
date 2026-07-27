/**
 * @astrajs/form — ValidityState → Error Code Mapping
 *
 * Translates the browser's native ValidityState flags into
 * stable, i18n-friendly error codes. The developer uses these
 * codes to render localized error messages.
 *
 * ## Error Codes
 *
 * | ValidityState   | Code        | Meaning                          |
 * |-----------------|-------------|----------------------------------|
 * | valueMissing    | 'required'  | Field is required but empty      |
 * | tooShort        | 'minlength' | Below minLength attribute        |
 * | tooLong         | 'maxlength' | Above maxLength attribute        |
 * | typeMismatch    | 'type'      | Value doesn't match input type   |
 * | patternMismatch | 'pattern'   | Value doesn't match regex        |
 * | customError     | (raw msg)   | From validate={fn} setCustomValidity |
 */

export type ErrorCode = 'required' | 'minlength' | 'maxlength' | 'type' | 'pattern' | string;

/**
 * Reads the native ValidityState from an input and returns the
 * corresponding error code. Returns `null` if the input is valid.
 *
 * For `customError`, returns the raw `validationMessage` string
 * (which was set by our `validate={fn}` via `setCustomValidity()`).
 */
export function getErrorCode(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): ErrorCode | null {
  const v = input.validity;

  if (v.valid) return null;

  if (v.valueMissing) return 'required';
  if (v.tooShort) return 'minlength';
  if (v.tooLong) return 'maxlength';
  if (v.typeMismatch) return 'type';
  if (v.patternMismatch) return 'pattern';
  if (v.customError) return input.validationMessage; // Our own string from validate={fn}

  // Fallback for other validity states (rangeUnderflow, stepMismatch, etc.)
  return input.validationMessage;
}

/**
 * Reads all form inputs and builds a `Record<name, errorCode>` map.
 * Inputs without a `name` attribute are skipped.
 */
export function getFormErrors(form: HTMLFormElement): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const el of form.querySelectorAll('input, textarea, select')) {
    const input = el as HTMLInputElement;
    if (!input.name) continue;
    const code = getErrorCode(input);
    if (code !== null) {
      errors[input.name] = code;
    }
  }
  return errors;
}
