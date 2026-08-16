/**
 * @bpjs159/schema — Public API
 *
 * ```ts
 * import { schema } from '@bpjs159/schema';
 *
 * const User = schema.object({
 *   name: schema.string().min(2),
 *   email: schema.string().email(),
 *   age: schema.number().min(0).optional(),
 * });
 *
 * type User = typeof User._type; // { name: string; email: string; age?: number }
 * ```
 */
import { StringSchema } from './string.js';
import { NumberSchema } from './number.js';
import { ObjectSchema } from './object.js';
import type { BaseSchema } from './types.js';

/** A schema shape is a record of field-name → schema. */
type SchemaShape = Record<string, BaseSchema<unknown>>;

export const schema = {
  /** Create a string validator. */
  string: () => new StringSchema(),

  /** Create a number validator. */
  number: () => new NumberSchema(),

  /**
   * Create an object validator from a shape of field schemas.
   * The resulting type is fully inferred — no manual type annotations needed.
   */
  object: <T extends SchemaShape>(shape: T) => new ObjectSchema(shape),
};

export { StringSchema, NumberSchema, ObjectSchema };
export type { ValidationResult, BaseSchema, Infer } from './types.js';
