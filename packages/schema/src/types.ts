/**
 * astrajs.dev/schema — Core Types
 *
 * All schemas return their inferred TypeScript type via the
 * phantom `_type` property, enabling full type inference
 * from schema definitions without manual type annotations.
 */

/** Result of validating data against a schema. */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Partial<Record<keyof T & string, string>>;
}

/** Internal: a single field validator returns null on success or an error string. */
export type FieldValidator = (value: unknown) => string | null;

/** Base interface all schemas share. */
export interface BaseSchema<T> {
  /** Phantom type carrier — never actually read at runtime. */
  readonly _type: T;
  /** Validate unknown data, returning structured result. */
  validate(data: unknown): ValidationResult<T>;
  /** Validate and return typed data, throwing on failure. */
  parse(data: unknown): T;
}

/** Extracts the TypeScript type from any schema. */
export type Infer<T extends BaseSchema<unknown>> = T['_type'];
