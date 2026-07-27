/**
 * @astrajs/schema — NumberSchema
 */
import type { BaseSchema, ValidationResult } from './types.js';

export class NumberSchema implements BaseSchema<number> {
  readonly _type!: number;
  private _checks: { name: string; fn: (v: number) => string | null }[] = [];
  private _isOptional = false;

  min(n: number): this {
    this._checks.push({ name: `min(${n})`, fn: (v) => (v >= n ? null : `Must be >= ${n}`) });
    return this;
  }

  max(n: number): this {
    this._checks.push({ name: `max(${n})`, fn: (v) => (v <= n ? null : `Must be <= ${n}`) });
    return this;
  }

  integer(): this {
    this._checks.push({ name: 'integer', fn: (v) => (Number.isInteger(v) ? null : 'Must be an integer') });
    return this;
  }

  required(): this {
    this._isOptional = false;
    return this;
  }

  optional(): this {
    this._isOptional = true;
    return this;
  }

  validate(data: unknown): ValidationResult<number> {
    if ((data === undefined || data === null || data === '') && this._isOptional) {
      return { success: true, data: 0 };
    }
    const num = Number(data);
    if (isNaN(num)) return { success: false, errors: { _: 'Must be a number' } as any };
    for (const check of this._checks) {
      const err = check.fn(num);
      if (err) return { success: false, errors: { _: err } as any };
    }
    return { success: true, data: num };
  }

  parse(data: unknown): number {
    const result = this.validate(data);
    if (!result.success) throw new Error(result.errors?._ ?? 'Validation failed');
    return result.data!;
  }
}
