import { describe, it, expect } from 'vitest';
import { SWRDemo } from '../main.js';

describe('SWR Demo', () => {
  it('renders without crashing', () => {
    const el = SWRDemo({}) as HTMLElement;
    expect(el).toBeInstanceOf(HTMLElement);
  });
});
