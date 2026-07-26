import { describe, it, expect } from 'vitest';
import { css } from '../css.js';

describe('css() (dev mode)', () => {
  it('returns a Proxy that maps class names to themselves', () => {
    const styles = css`.card { color: red; } .title { font-size: 1rem; }`;
    expect(styles.card).toBe('card');
    expect(styles.title).toBe('title');
  });

  it('returns the property name for any access', () => {
    const styles = css`.foo { }`;
    expect(styles.foo).toBe('foo');
    expect(styles.bar).toBe('bar');
    expect(styles['any-class']).toBe('any-class');
  });
});
