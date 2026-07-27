import { describe, it, expect } from 'vitest';
import { schema } from '../schema.js';
import type { Infer } from '../types.js';

describe('schema.string()', () => {
  it('validates plain strings', () => {
    const s = schema.string();
    expect(s.validate('hello').success).toBe(true);
    expect(s.validate('hello').data).toBe('hello');
  });

  it('min() enforces minimum length', () => {
    const s = schema.string().min(5);
    expect(s.validate('hi').success).toBe(false);
    expect(s.validate('hi').errors?._).toContain('at least 5');
    expect(s.validate('hello!').success).toBe(true);
  });

  it('email() validates email format', () => {
    const s = schema.string().email();
    expect(s.validate('user@example.com').success).toBe(true);
    expect(s.validate('not-an-email').success).toBe(false);
    expect(s.validate('not-an-email').errors?._).toBe('Invalid email');
  });

  it('required() rejects empty strings', () => {
    const s = schema.string().required();
    expect(s.validate('').success).toBe(false);
    expect(s.validate('hello').success).toBe(true);
  });

  it('optional() allows empty/undefined/null', () => {
    const s = schema.string().optional();
    expect(s.validate('').success).toBe(true);
    expect(s.validate(undefined).success).toBe(true);
    expect(s.validate(null).success).toBe(true);
  });

  it('parse() throws on failure', () => {
    const s = schema.string().min(5);
    expect(() => s.parse('hi')).toThrow();
    expect(s.parse('hello!')).toBe('hello!');
  });

  it('chains multiple checks', () => {
    const s = schema.string().min(3).max(10);
    expect(s.validate('ab').success).toBe(false);
    expect(s.validate('abcdefghijk').success).toBe(false);
    expect(s.validate('hello').success).toBe(true);
  });
});

describe('schema.number()', () => {
  it('validates numbers', () => {
    const s = schema.number();
    expect(s.validate(42).success).toBe(true);
    expect(s.validate('42').success).toBe(true);
    expect(s.validate('abc').success).toBe(false);
  });

  it('min()/max() enforce bounds', () => {
    const s = schema.number().min(0).max(100);
    expect(s.validate(-1).success).toBe(false);
    expect(s.validate(101).success).toBe(false);
    expect(s.validate(50).success).toBe(true);
  });

  it('integer() rejects floats', () => {
    const s = schema.number().integer();
    expect(s.validate(3.14).success).toBe(false);
    expect(s.validate(3).success).toBe(true);
  });

  it('optional() allows missing values', () => {
    const s = schema.number().optional();
    expect(s.validate(undefined).success).toBe(true);
  });
});

describe('schema.object()', () => {
  const UserSchema = schema.object({
    name: schema.string().min(2),
    email: schema.string().email(),
    age: schema.number().min(0).optional(),
  });

  it('validates a complete object', () => {
    const result = UserSchema.validate({
      name: 'Alice',
      email: 'alice@example.com',
      age: 30,
    });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ name: 'Alice', email: 'alice@example.com', age: 30 });
  });

  it('returns per-field errors', () => {
    const result = UserSchema.validate({
      name: 'A',
      email: 'bad',
    });
    expect(result.success).toBe(false);
    expect(result.errors?.name).toBeDefined();
    expect(result.errors?.email).toBeDefined();
  });

  it('optional fields can be omitted', () => {
    const result = UserSchema.validate({
      name: 'Bob',
      email: 'bob@example.com',
    });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ name: 'Bob', email: 'bob@example.com', age: 0 });
  });

  it('rejects non-objects', () => {
    expect(UserSchema.validate('nope').success).toBe(false);
    expect(UserSchema.validate(null).success).toBe(false);
  });

  it('parse() throws with all errors', () => {
    expect(() => UserSchema.parse({ name: '', email: '' })).toThrow();
  });

  it('TypeScript inference works', () => {
    // Compile-time check: Infer<UserSchema> should have name, email, age?
    type User = Infer<typeof UserSchema>;
    const _user: User = { name: 'x', email: 'x@x.com', age: 0 };
    expect(_user.name).toBe('x');
  });
});
