import { describe, expect, it } from 'vitest';
import { createAstraHandler } from '../core.js';

describe('probe core', () => {
  it('loads core', () => {
    expect(typeof createAstraHandler).toBe('function');
  });
});
