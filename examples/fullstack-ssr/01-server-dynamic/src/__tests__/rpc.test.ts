import { describe, it, expect } from 'vitest';
import { RPCDemo } from '../main.js';

describe('RPC Demo', () => {
  it('renders without crashing', () => {
    const el = RPCDemo({}) as HTMLElement;
    expect(el).toBeInstanceOf(HTMLElement);
    expect(el.querySelector('button')).toBeTruthy();
  });
});
