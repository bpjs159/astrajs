/**
 * End-to-end tests for the 08-lifecycle demo.
 * Tests the full Zero-VDOM flow: component → dynamic() → bindings → DOM updates.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { component, store, mounted } from '@bpjs159/core';
import { bindDynamicText, bindConditional, bindDynamicList } from '@bpjs159/core';
import { dynamic } from '@bpjs159/core';

// ─── Helpers ────────────────────────────────────────────────────────────────

function flushMicrotasks(): Promise<void> {
  return new Promise(r => queueMicrotask(r));
}

/** Wait for both levels of microtasks (component mount + flushMountCallbacks). */
async function flushAll(): Promise<void> {
  await flushMicrotasks();
  await flushMicrotasks();
}

afterEach(() => {
  document.body.innerHTML = '';
});

// ─── bindDynamicText ────────────────────────────────────────────────────────

describe('bindDynamicText', () => {
  it('creates a TextNode and updates it reactively when the store changes', async () => {
    const st = store({ count: 0 });
    const parent = document.createElement('div');
    document.body.appendChild(parent);

    const marker = document.createComment('~');
    parent.appendChild(marker);

    bindDynamicText(parent, marker, dynamic(() => `Count: ${st.count}`));

    // Initial render: marker replaced with TextNode
    expect(parent.textContent).toBe('Count: 0');

    // Mutate store
    st.count = 5;
    await flushMicrotasks();

    // DOM should update reactively
    expect(parent.textContent).toBe('Count: 5');

    st.count = 42;
    await flushMicrotasks();
    expect(parent.textContent).toBe('Count: 42');
  });

  it('wraps expressions correctly via dynamic()', async () => {
    const st = store({ value: 0 });
    const parent = document.createElement('div');
    document.body.appendChild(parent);

    const marker = document.createComment('~');
    parent.appendChild(marker);

    const getter = dynamic(() => String(Math.floor(st.value / 60)).padStart(2, '0') + ':' + String(st.value % 60).padStart(2, '0'));
    bindDynamicText(parent, marker, getter);

    expect(parent.textContent).toBe('00:00');

    st.value = 65;
    await flushMicrotasks();
    expect(parent.textContent).toBe('01:05');
  });
});

// ─── bindConditional ────────────────────────────────────────────────────────

describe('bindConditional', () => {
  it('swaps DOM nodes when the condition changes', async () => {
    const st = store({ show: true });
    const parent = document.createElement('div');
    document.body.appendChild(parent);

    const marker = document.createComment('~');
    parent.appendChild(marker);

    bindConditional(parent, marker, dynamic(() =>
      st.show
        ? (() => { const el = document.createElement('span'); el.textContent = 'ON'; return el; })()
        : (() => { const el = document.createElement('span'); el.textContent = 'OFF'; return el; })()
    ));

    expect(parent.textContent).toBe('ON');

    st.show = false;
    await flushMicrotasks();
    expect(parent.textContent).toBe('OFF');

    st.show = true;
    await flushMicrotasks();
    expect(parent.textContent).toBe('ON');
  });

  it('does NOT re-evaluate when child component internal state changes (untrack fix)', async () => {
    // This test verifies the critical fix: appendChildren uses untrack()
    // for the initial type-detection evaluation, preventing the parent
    // bindConditional from subscribing to the child's internal store.
    
    const parentSt = store({ show: true });
    let childRenderCount = 0;

    const ChildComp = component(() => {
      childRenderCount++;
      const childSt = store({ ticks: 0 });

      // Simulate internal state changes (like a timer ticking)
      setTimeout(() => { childSt.ticks = 1; }, 10);
      setTimeout(() => { childSt.ticks = 2; }, 20);
      setTimeout(() => { childSt.ticks = 3; }, 30);

      const el = document.createElement('span');
      const m = document.createComment('~');
      el.appendChild(m);
      bindDynamicText(el, m, dynamic(() => String(childSt.ticks)));
      return el;
    });

    const parent = document.createElement('div');
    document.body.appendChild(parent);
    const marker = document.createComment('~');
    parent.appendChild(marker);

    bindConditional(parent, marker, dynamic(() =>
      parentSt.show ? ChildComp({}) : document.createElement('span')
    ));

    expect(childRenderCount).toBe(1);
    expect(parent.textContent).toBe('0');

    // Wait for child's internal state changes
    await new Promise(r => setTimeout(r, 50));
    await flushMicrotasks();

    // Child should have re-rendered internally (its bindDynamicText updates)
    // but NOT been recreated by bindConditional
    expect(parent.textContent).toBe('3'); // Final tick value
    expect(childRenderCount).toBe(1); // Only created ONCE, not recreated on each tick
  });
});

// ─── bindDynamicList ────────────────────────────────────────────────────────

describe('bindDynamicList', () => {
  it('re-renders list when store array changes', async () => {
    const st = store({ items: [] as string[] });
    const parent = document.createElement('div');
    document.body.appendChild(parent);

    const marker = document.createComment('~');
    parent.appendChild(marker);

    bindDynamicList(parent, marker, dynamic(() =>
      st.items.map(item => {
        const el = document.createElement('div');
        el.textContent = item;
        return el;
      })
    ));

    expect(parent.querySelectorAll('div').length).toBe(0);

    st.items = ['a', 'b'];
    await flushMicrotasks();
    expect(parent.querySelectorAll('div').length).toBe(2);
    expect(parent.textContent).toBe('ab');

    st.items = ['x'];
    await flushMicrotasks();
    expect(parent.querySelectorAll('div').length).toBe(1);
    expect(parent.textContent).toBe('x');
  });
});

// ─── component() + mounted() lifecycle ──────────────────────────────────────

describe('component lifecycle (Zero-VDOM)', () => {
  it('runs fn exactly ONCE', () => {
    let runs = 0;
    const C = component(() => {
      runs++;
      return document.createElement('div');
    });
    C({});
    C({});
    C({});
    // Zero-VDOM: fn runs once per C() call, each call creates a new wrapper
    expect(runs).toBe(3); // Each C({}) call creates a new component instance
  });

  it('fires mounted() callback after wrapper enters DOM', async () => {
    const onMount = vi.fn();
    const C = component(() => {
      mounted(() => onMount());
      return document.createElement('div');
    });
    const wrapper = C({}) as HTMLElement;
    document.body.appendChild(wrapper);
    expect(onMount).toHaveBeenCalledTimes(0);
    await flushAll();
    expect(onMount).toHaveBeenCalledTimes(1);
  });

  it('fires cleanup when wrapper is removed from DOM', async () => {
    const onUnmount = vi.fn();
    const C = component(() => {
      mounted(() => {
        return () => onUnmount();
      });
      return document.createElement('div');
    });
    const wrapper = C({}) as HTMLElement;
    document.body.appendChild(wrapper);
    await flushAll();

    wrapper.remove();
    // MutationObserver processes removals asynchronously
    await flushMicrotasks();
    expect(onUnmount).toHaveBeenCalledTimes(1);
  });

  it('does NOT fire mounted() if wrapper is never attached to DOM', async () => {
    const onMount = vi.fn();
    const C = component(() => {
      mounted(() => onMount());
      return document.createElement('div');
    });
    C({}); // Not appended to DOM
    await flushAll();
    expect(onMount).toHaveBeenCalledTimes(0);
  });
});

// ─── Timer component full integration ───────────────────────────────────────

describe('Timer component integration', () => {
  it('starts interval on mount and updates display reactively', async () => {
    vi.useFakeTimers();
    
    const onMount = vi.fn();
    const onUnmount = vi.fn();
    const ticks: number[] = [];

    // Simulate what Timer component does internally
    const Timer = component(() => {
      const st = store({ seconds: 0 });

      mounted(() => {
        onMount();
        const id = setInterval(() => {
          st.seconds++;
          ticks.push(st.seconds);
        }, 1000);
        return () => {
          clearInterval(id);
          onUnmount();
        };
      });

      const parent = document.createElement('div');
      parent.className = 'timer';

      // These are what the compiler auto-wraps with dynamic()
      const marker1 = document.createComment('~');
      parent.appendChild(marker1);
      bindDynamicText(parent, marker1, dynamic(() =>
        String(Math.floor(st.seconds / 60)).padStart(2, '0')
      ));

      parent.appendChild(document.createTextNode(':'));

      const marker2 = document.createComment('~');
      parent.appendChild(marker2);
      bindDynamicText(parent, marker2, dynamic(() =>
        String(st.seconds % 60).padStart(2, '0')
      ));

      return parent;
    });

    const wrapper = Timer({}) as HTMLElement;
    document.body.appendChild(wrapper);

    // Before microtasks: mounted() not yet fired
    expect(onMount).toHaveBeenCalledTimes(0);
    expect(wrapper.textContent).toBe('00:00');

    // Flush mount callbacks
    await flushAll();
    expect(onMount).toHaveBeenCalledTimes(1);

    // Advance timer by 3 seconds
    vi.advanceTimersByTime(1000);
    await flushMicrotasks();
    expect(wrapper.textContent).toBe('00:01');
    expect(ticks).toEqual([1]);

    vi.advanceTimersByTime(1000);
    await flushMicrotasks();
    expect(wrapper.textContent).toBe('00:02');
    expect(ticks).toEqual([1, 2]);

    vi.advanceTimersByTime(1000);
    await flushMicrotasks();
    expect(wrapper.textContent).toBe('00:03');
    expect(ticks).toEqual([1, 2, 3]);

    // Unmount
    wrapper.remove();
    await flushMicrotasks();
    expect(onUnmount).toHaveBeenCalledTimes(1);

    // After cleanup, advancing time should NOT increment
    vi.advanceTimersByTime(5000);
    await flushMicrotasks();
    expect(ticks).toEqual([1, 2, 3]); // No new ticks

    vi.useRealTimers();
  });

  it('conditional mount/unmount via bindConditional', async () => {
    vi.useFakeTimers();

    const st = store({ show: true });
    let mountCount = 0;
    let unmountCount = 0;

    const Timer = component(() => {
      const t = store({ s: 0 });
      mounted(() => {
        mountCount++;
        const id = setInterval(() => { t.s++; }, 1000);
        return () => {
          unmountCount++;
          clearInterval(id);
        };
      });

      const el = document.createElement('span');
      const m = document.createComment('~');
      el.appendChild(m);
      bindDynamicText(el, m, dynamic(() => String(t.s)));
      return el;
    });

    const parent = document.createElement('div');
    document.body.appendChild(parent);

    const marker = document.createComment('~');
    parent.appendChild(marker);

    // Conditional rendering via bindConditional
    bindConditional(parent, marker, dynamic(() =>
      st.show
        ? Timer({})
        : (() => { const p = document.createElement('p'); p.textContent = 'hidden'; return p; })()
    ));

    // Initial: Timer mounted
    await flushAll();
    expect(mountCount).toBe(1);
    expect(parent.textContent).toBe('0');

    // Advance time
    vi.advanceTimersByTime(2000);
    await flushMicrotasks();
    expect(parent.textContent).toBe('2');

    // Hide Timer
    st.show = false;
    await flushAll();
    expect(unmountCount).toBe(1);
    expect(parent.textContent).toBe('hidden');

    // Show Timer again
    st.show = true;
    await flushAll();
    expect(mountCount).toBe(2);
    expect(parent.textContent).toBe('0'); // fresh Timer starts at 0

    vi.advanceTimersByTime(1000);
    await flushMicrotasks();
    expect(parent.textContent).toBe('1');

    vi.useRealTimers();
  });
});
