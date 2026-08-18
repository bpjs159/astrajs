import { describe, it, expect, vi, afterEach } from 'vitest';
import { store, registerHandler } from 'astrajs.dev/core';
import { serializeState, deserializeState, handleDelegatedEvent } from '../serialize.js';
import { nodeToHTML, escapeHtmlText } from '../renderer.js';

describe('serializeState()', () => {
  it('serializes a store to JSON', () => {
    const state = store({ count: 0, name: 'test' });
    const json = serializeState(state);
    const parsed = JSON.parse(json);
    expect(parsed.count).toBe(0);
    expect(parsed.name).toBe('test');
  });

  it('handles nested objects in a store', () => {
    const state = store({ user: { name: 'Alice', age: 30 } });
    const json = serializeState(state);
    const parsed = JSON.parse(json);
    expect(parsed.user.name).toBe('Alice');
    expect(parsed.user.age).toBe(30);
  });
});

describe('deserializeState()', () => {
  it('deserializes JSON back to a reactive proxy', () => {
    const state = deserializeState<{ count: number }>('{"count":42}');
    expect(state.count).toBe(42);
  });

  it('returns an object on invalid JSON', () => {
    const state = deserializeState('not json');
    expect(state).toBeDefined();
    expect(typeof state).toBe('object');
  });
});

// ─── SECURITY regressions (2026-08-18 audit) ───────────────────────────────

describe('escapeHtmlText()', () => {
  it('escapes all HTML-significant characters', () => {
    expect(escapeHtmlText('<script>alert(1)</script> & <b>2>1</b>'))
      .toBe('&lt;script&gt;alert(1)&lt;/script&gt; &amp; &lt;b&gt;2&gt;1&lt;/b&gt;');
  });

  it('is idempotent-safe on already-escaped text', () => {
    expect(escapeHtmlText('a &amp; b')).toBe('a &amp;amp; b');
  });
});

describe('nodeToHTML() text escaping', () => {
  it('escapes text-node content (XSS regression)', () => {
    const textNode = {
      nodeType: 3,
      textContent: '<img src=x onerror=alert(1)> & co',
    } as unknown as Node;
    const html = nodeToHTML(textNode);
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
    expect(html).toContain('&amp; co');
  });

  it('escapes text children inside elements', () => {
    const textChild = {
      nodeType: 3,
      textContent: '</div><script>alert(1)</script>',
      nextSibling: null,
    } as unknown as Node;
    const el = {
      nodeType: 1,
      tagName: 'div',
      attributes: [] as { name: string; value: string }[],
      style: { cssText: '' },
      firstChild: textChild,
    } as unknown as HTMLElement;
    const html = nodeToHTML(el);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;/div&gt;&lt;script&gt;alert(1)&lt;/script&gt;');
  });
});

describe('handleDelegatedEvent() allowlist', () => {
  afterEach(() => vi.restoreAllMocks());

  it('resolves handlers ONLY from the registered handler registry', () => {
    const seen: unknown[] = [];
    function __t_security_click(event: unknown) {
      seen.push(event);
    }
    registerHandler(__t_security_click);

    const ev = { type: 'click' } as unknown as Event;
    handleDelegatedEvent(ev, '__t_security_click', null as unknown as HTMLElement);
    expect(seen).toEqual([ev]);
  });

  it('never falls back to globalThis (fetch/eval/alert are not callable)', () => {
    const globalFn = vi.fn();
    (globalThis as Record<string, unknown>)['__t_global_attack'] = globalFn;
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Registered? no. Must NOT call the global function either.
    handleDelegatedEvent({} as unknown as Event, '__t_global_attack', null as unknown as HTMLElement);
    expect(globalFn).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalled();
    delete (globalThis as Record<string, unknown>)['__t_global_attack'];
  });

  it('rejects untrusted module#export handler references', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const ev = {} as unknown as Event;

    handleDelegatedEvent(ev, 'https://evil.example/x.js#run', null as unknown as HTMLElement);
    handleDelegatedEvent(ev, '/etc/passwd#run', null as unknown as HTMLElement);
    handleDelegatedEvent(ev, '//evil.example/x.js#run', null as unknown as HTMLElement);
    handleDelegatedEvent(ev, '/assets/ok.js#bad name', null as unknown as HTMLElement);

    expect(warn).toHaveBeenCalledTimes(4);
  });
});
