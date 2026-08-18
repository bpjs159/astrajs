/**
 * astrajs.dev/compiler — JSX → DOM Transform Tests
 *
 * Tests that the AST compiler transforms JSX into correct DOM code.
 */
import { describe, it, expect } from 'vitest';
import { transformJSX, autoWrapDynamic } from '../transformers/jsx.js';

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
      import { store } from 'astrajs.dev/core';
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
      import { component, store } from 'astrajs.dev/core';
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
      import { store } from 'astrajs.dev/core';
      const ui = store({ name: '' });
      const el = <input value={ui.name} />;
    `;
    const result = transformJSX(source, 'test.tsx');
    expect(result.code).toContain('bindValue');
  });

  it('no bindValue when onInput is also present', () => {
    const source = `
      import { store } from 'astrajs.dev/core';
      const ui = store({ name: '' });
      const el = <input value={ui.name} onInput={(e) => ui.name = e.target.value} />;
    `;
    const result = transformJSX(source, 'test.tsx');
    // Should NOT add bindValue since onInput is explicit
    expect(result.code).not.toContain('bindValue');
  });
});

describe('autoWrapDynamic', () => {
  it('wraps reactive child expressions in dynamic()', () => {
    const source = `
      const ui = store({ show: true, count: 0 });
      const el = <p>{ui.count}</p>;
    `;
    const result = autoWrapDynamic(source, new Set(['ui']));
    expect(result.needsDynamic).toBe(true);
    expect(result.code).toContain('dynamic(() => (ui.count))');
  });

  it('does NOT wrap value on form controls (preserves two-way binding)', () => {
    const source = `
      const formData = store({ name: '' });
      const el = <input value={formData.name} />;
    `;
    const result = autoWrapDynamic(source, new Set(['formData']));
    // The eager `value={formData.name}` read must survive untouched so the
    // JSX runtime can auto-detect the two-way binding via getLastReactiveAccess.
    expect(result.code).toContain('value={formData.name}');
    expect(result.code).not.toContain('value={() =>');
  });

  it('still wraps other reactive attributes as lazy getters', () => {
    const source = `
      const ui = store({ ok: false });
      const el = <input disabled={ui.ok} />;
    `;
    const result = autoWrapDynamic(source, new Set(['ui']));
    expect(result.code).toContain('disabled={() => (ui.ok)}');
  });

  it('does not wrap value on non-form-control elements', () => {
    const source = `
      const ui = store({ name: '' });
      const el = <div value={ui.name}></div>;
    `;
    const result = autoWrapDynamic(source, new Set(['ui']));
    expect(result.code).toContain('value={() => (ui.name)}');
  });

  it('does not wrap a whole form subtree that contains value bindings', () => {
    // Regression for the 03-form-server blank page: wrapping the <form>
    // in dynamic() would rebuild (destroy + recreate) every input on each
    // reactive tick because the getter reads the form's own stores.
    const source = `
      const formData = store({ name: '' });
      const result = formData.result;
      const el = (
        <div>
          {!result && (
            <form>
              <input value={formData.name} />
            </form>
          )}
        </div>
      );
    `;
    const result = autoWrapDynamic(source, new Set(['formData']));
    // The form's value bindings must stay eager even though the conditional
    // itself gets wrapped.
    expect(result.code).toContain('value={formData.name}');
  });

  it('wraps form controller expressions in dynamic() without manual dyn()', () => {
    // Regression for the 03-form-server DX: the developer must NOT write
    // `dyn(() => formCtrl.getError(...))` by hand. Once `formCtrl` is
    // recognised as reactive (via form()), the compiler auto-wraps the
    // child expression.
    const source = `
      const formCtrl = form();
      const el = <p>{formCtrl.getError('name')}</p>;
    `;
    const result = autoWrapDynamic(source, new Set(['formCtrl']));
    expect(result.needsDynamic).toBe(true);
    expect(result.code).toContain('dynamic(() => (formCtrl.getError(\'name\')))');
  });

  it('wraps serverForm handle expressions without manual dyn()', () => {
    const source = `
      const formHandle = serverForm({});
      const el = <button disabled={formHandle.isSubmitting}>{formHandle.isSubmitting ? 'S' : 'R'}</button>;
    `;
    const result = autoWrapDynamic(source, new Set(['formHandle']));
    expect(result.needsDynamic).toBe(true);
    expect(result.code).toContain('disabled={() => (formHandle.isSubmitting)}');
    expect(result.code).toContain('dynamic(() => (formHandle.isSubmitting ? \'S\' : \'R\'))');
  });

  it('does NOT wrap controller/validate directives as getters', () => {
    // The <form controller={formCtrl}> directive and validate={fn} must
    // receive their raw value — wrapping them as `() => formCtrl` would
    // break the form controller wiring in setProps().
    const source = `
      const formCtrl = form();
      const el = (
        <form controller={formCtrl}>
          <input name="email" validate={validation.isEmail} />
        </form>
      );
    `;
    const result = autoWrapDynamic(source, new Set(['formCtrl']));
    expect(result.code).toContain('controller={formCtrl}');
    expect(result.code).not.toContain('controller={() =>');
    expect(result.code).toContain('validate={validation.isEmail}');
    expect(result.code).not.toContain('validate={() =>');
  });

  it('wraps reactive attrs on form controls (disabled) but keeps value eager', () => {
    const source = `
      const formCtrl = form();
      const formData = store({ name: '' });
      const el = <input value={formData.name} disabled={!formCtrl.isValid} />;
    `;
    const result = autoWrapDynamic(source, new Set(['formCtrl', 'formData']));
    expect(result.code).toContain('value={formData.name}');
    expect(result.code).toContain('disabled={() => (!formCtrl.isValid)}');
  });

  it('wraps route()/fallbackRoute() child expressions so views update on navigation', () => {
    const source = `
      const el = (
        <div>
          {route('/products', { exact: true }) && <ProductList />}
          {route('/products/:id') && <ProductDetail />}
          {fallbackRoute() && <NotFound />}
        </div>
      );
    `;
    const result = autoWrapDynamic(source, new Set([]));
    expect(result.needsDynamic).toBe(true);
    expect(result.code).toContain("dynamic(() => (route('/products', { exact: true }) &&");
    expect(result.code).toContain("dynamic(() => (route('/products/:id') &&");
    expect(result.code).toContain('dynamic(() => (fallbackRoute() &&');
  });

  it('wraps params reads in child expressions', () => {
    const source = `
      const el = <p>Fetching product {params.id} from server...</p>;
    `;
    const result = autoWrapDynamic(source, new Set([]));
    expect(result.needsDynamic).toBe(true);
    expect(result.code).toContain('dynamic(() => (params.id))');
  });
});
