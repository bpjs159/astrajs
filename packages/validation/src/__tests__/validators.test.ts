/**
 * @bpjs159/validation — Tests
 */
import { describe, it, expect } from 'vitest';
import {
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
} from '../validators.js';
import { all, any } from '../compose.js';

// ─── Standalone validators ───────────────────────────────────────────────────

describe('isEmail', () => {
  it('returns true for valid emails', () => {
    expect(isEmail('hello@world.com')).toBe(true);
    expect(isEmail('a@b.co')).toBe(true);
    expect(isEmail('user+tag@domain.io')).toBe(true);
  });

  it('returns error for invalid emails', () => {
    expect(isEmail('')).toBe(true); // empty passes — let isRequired handle it
    expect(isEmail('not-an-email')).toBe('Invalid email format');
    expect(isEmail('@missing-user.com')).toBe('Invalid email format');
    expect(isEmail('missing-domain@')).toBe('Invalid email format');
  });
});

describe('isRequired', () => {
  it('returns true for non-empty values', () => {
    expect(isRequired('hello')).toBe(true);
    expect(isRequired(' a ')).toBe(true);
  });

  it('returns error for empty values', () => {
    expect(isRequired('')).toBe('This field is required');
    expect(isRequired('   ')).toBe('This field is required');
  });
});

describe('isUrl', () => {
  it('returns true for valid URLs', () => {
    expect(isUrl('https://example.com')).toBe(true);
    expect(isUrl('http://localhost:3000/path')).toBe(true);
  });

  it('returns error for invalid URLs', () => {
    expect(isUrl('')).toBe(true);
    expect(isUrl('not-a-url')).toBe('Invalid URL format');
    expect(isUrl('ftp://example.com')).toBe('Invalid URL format');
  });
});

describe('isNumber', () => {
  it('returns true for numeric strings', () => {
    expect(isNumber('42')).toBe(true);
    expect(isNumber('3.14')).toBe(true);
    expect(isNumber('-10')).toBe(true);
  });

  it('returns error for non-numeric', () => {
    expect(isNumber('')).toBe(true);
    expect(isNumber('abc')).toBe('Must be a number');
  });
});

describe('isInteger', () => {
  it('returns true for integer strings', () => {
    expect(isInteger('42')).toBe(true);
    expect(isInteger('-7')).toBe(true);
    expect(isInteger('0')).toBe(true);
  });

  it('returns error for non-integers', () => {
    expect(isInteger('')).toBe(true);
    expect(isInteger('3.14')).toBe('Must be an integer');
    expect(isInteger('abc')).toBe('Must be an integer');
  });
});

describe('isAlphanumeric', () => {
  it('returns true for alphanumeric strings', () => {
    expect(isAlphanumeric('abc123')).toBe(true);
    expect(isAlphanumeric('XYZ')).toBe(true);
  });

  it('returns error for non-alphanumeric', () => {
    expect(isAlphanumeric('')).toBe(true);
    expect(isAlphanumeric('hello world')).toBe('Only letters and numbers allowed');
    expect(isAlphanumeric('a-b')).toBe('Only letters and numbers allowed');
  });
});

// ─── Factory validators ──────────────────────────────────────────────────────

describe('minLength', () => {
  it('returns true when length meets minimum', () => {
    const v = minLength(3);
    expect(v('abc')).toBe(true);
    expect(v('abcd')).toBe(true);
  });

  it('returns error when too short', () => {
    const v = minLength(3);
    expect(v('ab')).toBe('At least 3 characters required');
    expect(v('')).toBe('At least 3 characters required');
  });

  it('uses custom message', () => {
    const v = minLength(5, 'Too short!');
    expect(v('ab')).toBe('Too short!');
  });
});

describe('maxLength', () => {
  it('returns true when within limit', () => {
    const v = maxLength(5);
    expect(v('abc')).toBe(true);
    expect(v('abcde')).toBe(true);
  });

  it('returns error when too long', () => {
    const v = maxLength(5);
    expect(v('abcdef')).toBe('At most 5 characters allowed');
  });
});

describe('pattern', () => {
  it('returns true when pattern matches', () => {
    const v = pattern(/^\d{3}-\d{4}$/);
    expect(v('123-4567')).toBe(true);
  });

  it('returns error when no match', () => {
    const v = pattern(/^\d{3}-\d{4}$/);
    expect(v('abc')).toBe('Invalid format');
  });

  it('uses custom message', () => {
    const v = pattern(/^[A-Z]+$/, 'Uppercase only');
    expect(v('abc')).toBe('Uppercase only');
  });
});

describe('oneOf', () => {
  it('returns true when value is in the set', () => {
    const v = oneOf(['admin', 'user']);
    expect(v('admin')).toBe(true);
    expect(v('user')).toBe(true);
  });

  it('returns error when not in set', () => {
    const v = oneOf(['admin', 'user']);
    expect(v('guest')).toBe('Must be one of: admin, user');
  });
});

// ─── Composition ─────────────────────────────────────────────────────────────

describe('all', () => {
  it('returns true when all pass', async () => {
    const v = all([isRequired, isEmail]);
    expect(await v('hello@world.com')).toBe(true);
  });

  it('short-circuits on first failure', async () => {
    const v = all([isRequired, isEmail]);
    expect(await v('')).toBe('This field is required');
  });

  it('returns second validator error when first passes', async () => {
    const v = all([isRequired, isEmail]);
    expect(await v('bad')).toBe('Invalid email format');
  });

  it('supports mixed sync and async validators', async () => {
    const asyncCheck = async (val: string) => {
      await new Promise(r => setTimeout(r, 10));
      return val === 'admin' ? 'Taken' as const : true;
    };
    const v = all([isRequired, minLength(3), asyncCheck]);
    expect(await v('admin')).toBe('Taken');
    expect(await v('hello')).toBe(true);
  });
});

describe('any', () => {
  it('returns true when at least one passes', () => {
    const v = any([isEmail, isUrl]);
    expect(v('hello@world.com')).toBe(true);
    expect(v('https://example.com')).toBe(true);
  });

  it('returns last error when none pass', () => {
    const v = any([isEmail, isUrl]);
    expect(v('not-valid')).toBe('Invalid URL format');
  });
});
