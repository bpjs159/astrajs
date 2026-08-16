/**
 * @bpjs159/schema — ObjectSchema
 *
 * Composes multiple field schemas into one structured validator.
 * The phantom `_type` enables full type inference from the shape.
 */
import type { BaseSchema, ValidationResult } from './types.js';

type SchemaShape = Record<string, BaseSchema<unknown>>;

/** Extract the inferred type from a schema shape. */
type ShapeToType<T extends SchemaShape> = {
  [K in keyof T]: T[K]['_type'];
};

export class ObjectSchema<T extends SchemaShape> implements BaseSchema<ShapeToType<T>> {
  readonly _type!: ShapeToType<T>;

  constructor(private _shape: T) {}

  get shape(): T {
    return this._shape;
  }

  validate(data: unknown): ValidationResult<ShapeToType<T>> {
    if (typeof data !== 'object' || data === null) {
      return { success: false, errors: { _: 'Expected an object' } as any };
    }

    const record = data as Record<string, unknown>;
    const errors: Record<string, string> = {};
    const parsed: Record<string, unknown> = {};
    let hasErrors = false;

    for (const [key, schema] of Object.entries(this._shape)) {
      const fieldResult = schema.validate(record[key]);
      if (!fieldResult.success) {
        hasErrors = true;
        // Grab the first error from the field schema
        const fieldErrors = fieldResult.errors ?? {};
        errors[key] = (Object.values(fieldErrors)[0] as string) ?? 'Invalid';
      } else {
        parsed[key] = fieldResult.data;
      }
    }

    if (hasErrors) {
      return { success: false, errors: errors as Partial<Record<string, string>> };
    }
    return { success: true, data: parsed as ShapeToType<T> };
  }

  parse(data: unknown): ShapeToType<T> {
    const result = this.validate(data);
    if (!result.success) {
      throw new Error(Object.values(result.errors ?? {}).join(', ') || 'Validation failed');
    }
    return result.data!;
  }
}
