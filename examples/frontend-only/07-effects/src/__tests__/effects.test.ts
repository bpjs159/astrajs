import { describe, it, expect } from 'vitest';
import { EffectsDemo } from '../main.js';

describe('Effects Demo', () => {
  it('renders without crashing', () => {
    const el = EffectsDemo({}) as HTMLElement;
    expect(el).toBeInstanceOf(HTMLElement);
  });
});
