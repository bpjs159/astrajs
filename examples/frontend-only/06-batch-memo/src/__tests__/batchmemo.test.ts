import { describe, it, expect } from 'vitest';
import { BatchMemoDemo } from '../main.js';

describe('Batch & Memo Demo', () => {
  it('renders without crashing', () => {
    const el = BatchMemoDemo({}) as HTMLElement;
    expect(el).toBeInstanceOf(HTMLElement);
  });
});
