import { describe, it, expect } from 'vitest';
import { RouterDemo } from '../main.js';

describe('Router Demo', () => {
  it('renders without crashing', () => {
    document.body.innerHTML = '<div id="app" class="shell"></div>';
    const el = RouterDemo({});
    expect(el).toBeDefined();
  });
});
