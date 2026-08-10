import { describe, it, expect } from 'vitest';
import { PreBuildDemo } from '../main.js';

describe('Pre-Build Demo', () => {
  it('renders product data table', () => {
    const el = PreBuildDemo({}) as HTMLElement;
    expect(el).toBeInstanceOf(HTMLElement);
    expect(el.querySelector('table')).toBeTruthy();
  });
});
