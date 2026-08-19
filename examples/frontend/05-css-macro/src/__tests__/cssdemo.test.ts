import { describe, it, expect } from 'vitest';
import { CSSDemo } from '../main.js';

describe('CSS Macro Demo', () => {
  it('renders the demo', () => {
    document.body.innerHTML = '<div id="css-demo"></div>';
    const el = CSSDemo({});
    expect(el).toBeDefined();
  });
});
