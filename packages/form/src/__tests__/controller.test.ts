/**
 * @astrajs/form — Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { form } from '../controller.js';
import { getErrorCode } from '../validity-map.js';

// ─── Validity Map ────────────────────────────────────────────────────────────

describe('getErrorCode', () => {
  let input: HTMLInputElement;

  beforeAll(() => {
    // jsdom doesn't fully support ValidityState, so we mock it
  });

  it('returns null for valid input', () => {
    const el = document.createElement('input');
    el.required = false;
    // Mock validity
    Object.defineProperty(el, 'validity', {
      value: {
        valid: true,
        valueMissing: false,
        tooShort: false,
        tooLong: false,
        typeMismatch: false,
        patternMismatch: false,
        customError: false,
      },
      configurable: true,
    });
    expect(getErrorCode(el)).toBeNull();
  });

  it('returns "required" for valueMissing', () => {
    const el = document.createElement('input');
    el.required = true;
    Object.defineProperty(el, 'validity', {
      value: {
        valid: false,
        valueMissing: true,
        tooShort: false,
        tooLong: false,
        typeMismatch: false,
        patternMismatch: false,
        customError: false,
      },
      configurable: true,
    });
    expect(getErrorCode(el)).toBe('required');
  });

  it('returns "minlength" for tooShort', () => {
    const el = document.createElement('input');
    Object.defineProperty(el, 'validity', {
      value: {
        valid: false,
        valueMissing: false,
        tooShort: true,
        tooLong: false,
        typeMismatch: false,
        patternMismatch: false,
        customError: false,
      },
      configurable: true,
    });
    expect(getErrorCode(el)).toBe('minlength');
  });

  it('returns "maxlength" for tooLong', () => {
    const el = document.createElement('input');
    Object.defineProperty(el, 'validity', {
      value: {
        valid: false,
        valueMissing: false,
        tooShort: false,
        tooLong: true,
        typeMismatch: false,
        patternMismatch: false,
        customError: false,
      },
      configurable: true,
    });
    expect(getErrorCode(el)).toBe('maxlength');
  });

  it('returns "type" for typeMismatch', () => {
    const el = document.createElement('input');
    Object.defineProperty(el, 'validity', {
      value: {
        valid: false,
        valueMissing: false,
        tooShort: false,
        tooLong: false,
        typeMismatch: true,
        patternMismatch: false,
        customError: false,
      },
      configurable: true,
    });
    expect(getErrorCode(el)).toBe('type');
  });

  it('returns "pattern" for patternMismatch', () => {
    const el = document.createElement('input');
    Object.defineProperty(el, 'validity', {
      value: {
        valid: false,
        valueMissing: false,
        tooShort: false,
        tooLong: false,
        typeMismatch: false,
        patternMismatch: true,
        customError: false,
      },
      configurable: true,
    });
    expect(getErrorCode(el)).toBe('pattern');
  });

  it('returns validationMessage for customError', () => {
    const el = document.createElement('input');
    Object.defineProperty(el, 'validity', {
      value: {
        valid: false,
        valueMissing: false,
        tooShort: false,
        tooLong: false,
        typeMismatch: false,
        patternMismatch: false,
        customError: true,
      },
      configurable: true,
    });
    Object.defineProperty(el, 'validationMessage', {
      value: 'Username already taken',
      configurable: true,
    });
    expect(getErrorCode(el)).toBe('Username already taken');
  });
});

// ─── Controller ──────────────────────────────────────────────────────────────

describe('form() controller', () => {
  it('returns an object with expected shape', () => {
    const f = form();
    expect(f.errors).toEqual({});
    expect(f.touched).toEqual({});
    expect(f.isDirty).toBe(false);
    expect(f.isValid).toBe(true);
    expect(f.isValidating).toBe(false);
    expect(typeof f.getError).toBe('function');
    expect(typeof f.focusFirstError).toBe('function');
    expect(typeof f.reset).toBe('function');
    expect(typeof f.validateAll).toBe('function');
    expect(typeof (f as any)._attach).toBe('function');
  });

  it('getError returns undefined for unknown field', () => {
    const f = form();
    expect(f.getError('nonexistent')).toBeUndefined();
  });

  it('reset() clears all metadata', () => {
    const f = form();
    (f as any).errors = { email: 'required' };
    (f as any).touched = { email: true };
    (f as any).isDirty = true;
    (f as any).isValid = false;
    (f as any).isValidating = true;

    f.reset();

    expect(f.errors).toEqual({});
    expect(f.touched).toEqual({});
    expect(f.isDirty).toBe(false);
    expect(f.isValid).toBe(true);
    expect(f.isValidating).toBe(false);
  });

  it('focusFirstError does not throw when not attached', () => {
    const f = form();
    expect(() => f.focusFirstError()).not.toThrow();
  });

  it('validateAll does not throw when not attached', () => {
    const f = form();
    expect(() => f.validateAll()).not.toThrow();
  });
});
