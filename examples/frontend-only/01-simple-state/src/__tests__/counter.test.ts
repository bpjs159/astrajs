import { describe, it, expect } from 'vitest';
import { Counter } from '../main.js';

describe('Counter', () => {
  it('renders a DOM element with counter heading', () => {
    const el = Counter({}) as HTMLElement;
    expect(el).toBeInstanceOf(HTMLElement);
    expect(el.querySelector('h2')?.textContent).toContain('Counter');
    expect(el.querySelector('strong')?.textContent).toBe('0');
  });

  it('has two buttons', () => {
    const el = Counter({}) as HTMLElement;
    const buttons = el.querySelectorAll('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0]?.textContent).toContain('− 1');
    expect(buttons[1]?.textContent).toContain('+ 1');
  });
});
