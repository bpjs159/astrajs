/**
 * @bpjs159/schema — StringSchema
 */
import type { BaseSchema, FieldValidator, ValidationResult } from './types.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class StringSchema implements BaseSchema<string> {
  readonly _type!: string;
  private _checks: { name: string; fn: FieldValidator }[] = [];
  private _isOptional = false;

  /** Minimum length. */
  min(n: number): this {
    this._checks.push({
      name: `min(${n})`,
      fn: (v) =>
        typeof v === 'string' && v.length >= n
          ? null
          : `Must be at least ${n} characters`,
    });
    return this;
  }

  /** Maximum length. */
  max(n: number): this {
    this._checks.push({
      name: `max(${n})`,
      fn: (v) =>
        typeof v === 'string' && v.length <= n
          ? null
          : `Must be at most ${n} characters`,
    });
    return this;
  }

  /** Must be a valid email. */
  email(): this {
    this._checks.push({
      name: 'email',
      fn: (v) =>
        typeof v === 'string' && EMAIL_RE.test(v) ? null : 'Invalid email',
    });
    return this;
  }

  /** Mark as required (non-empty). */
  required(): this {
    this._isOptional = false;
    this._checks.unshift({
      name: 'required',
      fn: (v) =>
        typeof v === 'string' && v.trim().length > 0 ? null : 'Required',
    });
    return this;
  }

  /** Mark as optional — undefined/null/empty passes. */
  optional(): this {
    this._isOptional = true;
    return this;
  }

  validate(data: unknown): ValidationResult<string> {
    if ((data === undefined || data === null || data === '') && this._isOptional) {
      return { success: true, data: '' };
    }
    for (const check of this._checks) {
      const err = check.fn(data);
      if (err) return { success: false, errors: { _: err } as Record<string, string> as any };
    }
    return { success: true, data: data as string };
  }

  parse(data: unknown): string {
    const result = this.validate(data);
    if (!result.success) {
      throw new Error((result.errors as Record<string, string> | undefined)?._ ?? 'Validation failed');
    }
    return result.data!;
  }
}
