import { describe, it, expect } from 'vitest';
import { ServerDemo } from '../main.js';

describe('Server Demo', () => {
  it('renders without crashing', () => {
    const el = ServerDemo({}) as HTMLElement;
    expect(el).toBeInstanceOf(HTMLElement);
    expect(el.querySelector('button')).toBeTruthy();
  });
});
