/**
 * @astrajs/compiler — JSX → DOM Transform Tests
 *
 * Tests that the AST compiler transforms JSX into correct DOM code.
 */
import { describe, it, expect } from 'vitest';
import { transformJSX } from '../transformers/jsx.js';

describe('JSX → DOM Transform', () => {
  it('transforms a simple div to document.createElement', () => {
    const source = `
      const el = <div class="hello">world</div>;
    `;
    const result = transformJSX(source, 'test.tsx');
    // Should contain createElement('div')
    expect(result.code).toContain("createElement('div')");
    // Should contain className
    expect(result.code).toContain('hello');
    // Should contain text node
    expect(result.code).toContain('world');
  });

  it('detects reactive store and adds bindText', () => {
    const source = `
      import { store } from '@astrajs/core';
      const ui = store({ value: 0 });
      const el = <h1>{ui.value}</h1>;
    `;
    const result = transformJSX(source, 'test.tsx');
    // Should detect ui is a store and add bindText
    expect(result.code).toContain('bindText');
    expect(result.code).toContain('ui.value');
    // Should import bindText
    expect(result.code).toContain("import { bindText }");
  });

  it('transforms event handlers to addEventListener', () => {
    const source = `
      const el = <button onClick={() => handleClick()}>Click</button>;
    `;
    const result = transformJSX(source, 'test.tsx');
    expect(result.code).toContain("addEventListener('click'");
  });

  it('transforms self-closing elements', () => {
    const source = `
      const el = <br />;
    `;
    const result = transformJSX(source, 'test.tsx');
    expect(result.code).toContain("createElement('br')");
  });

  it('transforms nested JSX', () => {
    const source = `
      const el = (
        <div class="outer">
          <span>Hello</span>
        </div>
      );
    `;
    const result = transformJSX(source, 'test.tsx');
    expect(result.code).toContain("createElement('div')");
    expect(result.code).toContain("createElement('span')");
    expect(result.code).toContain('Hello');
  });

  it('handles Counter component (01-simple-state pattern)', () => {
    const source = `
      import { component, store } from '@astrajs/core';
      const Counter = component(() => {
        const ui = store({ value: 0 });
        return (
          <div class="box">
            <h2>Counter: <strong>{ui.value}</strong></h2>
            <div class="buttons">
              <button onClick={() => ui.value--}>- 1</button>
              <button onClick={() => ui.value++}>+ 1</button>
            </div>
          </div>
        );
      });
    `;
    const result = transformJSX(source, 'test.tsx');

    // Should create elements
    expect(result.code).toContain("createElement('div')");
    expect(result.code).toContain("createElement('h2')");
    expect(result.code).toContain("createElement('strong')");
    expect(result.code).toContain("createElement('button')");

    // Should add event listeners
    expect(result.code).toContain("addEventListener('click'");

    // Should bind reactive value
    expect(result.code).toContain('bindText');
    expect(result.code).toContain('ui.value');

    // Should import bindText
    expect(result.code).toContain("import { bindText }");
  });

  it('handles bindValue for input value={store.prop}', () => {
    const source = `
      import { store } from '@astrajs/core';
      const ui = store({ name: '' });
      const el = <input value={ui.name} />;
    `;
    const result = transformJSX(source, 'test.tsx');
    expect(result.code).toContain('bindValue');
  });

  it('no bindValue when onInput is also present', () => {
    const source = `
      import { store } from '@astrajs/core';
      const ui = store({ name: '' });
      const el = <input value={ui.name} onInput={(e) => ui.name = e.target.value} />;
    `;
    const result = transformJSX(source, 'test.tsx');
    // Should NOT add bindValue since onInput is explicit
    expect(result.code).not.toContain('bindValue');
  });
});
