/**
 * @astrajs/compiler — mounted() Cleanup Auto-Wiring Tests
 */
import { describe, it, expect } from 'vitest';
import { autoWrapMountedCleanup } from '../transformers/mounted-cleanup.js';

describe('mounted() cleanup auto-wiring', () => {
  it('appends `return x;` for a captured autoSync() disposer', () => {
    const source = `
      mounted(() => {
        const unsubscribe = autoSync('/api/astra/getStock', onUpdate, { interval: 3000 });
      });
    `;
    const result = autoWrapMountedCleanup(source);
    expect(result.changed).toBe(true);
    expect(result.code).toContain('return unsubscribe;');
  });

  it('rewrites a bare autoSync() call into `return autoSync(...)` when it is the last statement', () => {
    const source = `
      mounted(() => {
        autoSync('/api/astra/getStock', onUpdate);
      });
    `;
    const result = autoWrapMountedCleanup(source);
    expect(result.changed).toBe(true);
    expect(result.code).toContain("return autoSync('/api/astra/getStock', onUpdate);");
  });

  it('supports watchTags() the same way as autoSync()', () => {
    const source = `
      mounted(() => {
        const unsubscribe = watchTags(['products'], onInvalidate);
      });
    `;
    const result = autoWrapMountedCleanup(source);
    expect(result.changed).toBe(true);
    expect(result.code).toContain('return unsubscribe;');
  });

  it('captures a disposer declared before other statements', () => {
    const source = `
      mounted(() => {
        const unsubscribe = autoSync('/api/astra/getStock', onUpdate);
        getStock().then((data) => { state.level = data.level; });
      });
    `;
    const result = autoWrapMountedCleanup(source);
    expect(result.changed).toBe(true);
    expect(result.code).toContain('return unsubscribe;');
    // The return must come after the .then() call, at the end of the block.
    expect(result.code.indexOf('return unsubscribe;')).toBeGreaterThan(
      result.code.indexOf('.then(')
    );
  });

  it('does nothing when the block already has a return', () => {
    const source = `
      mounted(() => {
        const unsubscribe = autoSync('/api/astra/getStock', onUpdate);
        return unsubscribe;
      });
    `;
    const result = autoWrapMountedCleanup(source);
    expect(result.changed).toBe(false);
    expect(result.code).toBe(source);
  });

  it('does not touch returns inside nested closures', () => {
    const source = `
      mounted(() => {
        const unsubscribe = autoSync('/api/astra/getStock', (fresh) => {
          if (fresh.level < 0) return;
          state.level = fresh.level;
        });
      });
    `;
    const result = autoWrapMountedCleanup(source);
    expect(result.changed).toBe(true);
    expect(result.code).toContain('return unsubscribe;');
  });

  it('does nothing when there is no disposer call', () => {
    const source = `
      mounted(() => {
        const id = setInterval(() => tick(), 1000);
      });
    `;
    const result = autoWrapMountedCleanup(source);
    expect(result.changed).toBe(false);
  });

  it('does nothing when there are two disposer calls (ambiguous)', () => {
    const source = `
      mounted(() => {
        const a = autoSync('/api/astra/getStock', onStock);
        const b = autoSync('/api/astra/getOrders', onOrders);
      });
    `;
    const result = autoWrapMountedCleanup(source);
    expect(result.changed).toBe(false);
  });

  it('does not rewrite a bare disposer call that is not the last statement', () => {
    const source = `
      mounted(() => {
        autoSync('/api/astra/getStock', onUpdate);
        trackAnalytics('mounted');
      });
    `;
    const result = autoWrapMountedCleanup(source);
    expect(result.changed).toBe(false);
  });

  it('ignores mounted(() => expr) arrow expression bodies', () => {
    const source = `
      mounted(() => autoSync('/api/astra/getStock', onUpdate));
    `;
    const result = autoWrapMountedCleanup(source);
    expect(result.changed).toBe(false);
  });
});
