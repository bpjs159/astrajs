import { component, dynamic } from '@astrajs/core';
import { DocSidebar } from '../../components/docs-sidebar.js';
import { DocRightToc } from '../../components/doc-right-toc.js';
import { i18n } from '../../i18n.js';
import { CodeBlock } from '../../components/code-block.js';

const s = `
  .docs-layout{display:flex;min-height:100vh}
  .docs-main{flex:1;margin-left:260px;padding:48px 56px;max-width:860px}
  @media(max-width:960px){.docs-main{margin-left:0;padding:32px 24px}}
  .docs-content h1{font-size:2rem;font-weight:800;color:#f7f7ff;margin-bottom:12px;letter-spacing:-.02em}
  .docs-content h2{font-size:1.3rem;font-weight:700;color:#f7f7ff;margin:40px 0 14px;padding-top:20px;border-top:1px solid rgba(255,255,255,.06);letter-spacing:-.01em}
  .docs-content h2:first-of-type{border-top:none;margin-top:28px}
  .docs-content h3{font-size:1.05rem;font-weight:700;color:#f7f7ff;margin:28px 0 10px}
  .docs-content p{font-size:.88rem;color:#94a3b8;line-height:1.75;margin-bottom:16px}
  .docs-content strong{color:#e2e8f0}
  .docs-content code{background:rgba(139,77,255,.1);color:#c4a0ff;padding:2px 7px;border-radius:4px;font-size:.8rem;font-weight:500;font-family:'JetBrains Mono',monospace}
  .docs-content pre{background:#060b14;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:0;overflow-x:auto;margin-bottom:24px;position:relative}
  .docs-content pre::before{content:'TS';position:absolute;top:0;right:16px;font-size:.62rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.08em;padding:8px 0}
  .docs-content pre code{display:block;background:none;color:#cbd5e1;padding:20px 24px;font-size:.76rem;line-height:1.85;border-radius:0;overflow-x:auto;white-space:pre;tab-size:2}
  .docs-content ul,.docs-content ol{padding-left:24px;margin-bottom:16px}
  .docs-content li{font-size:.88rem;color:#94a3b8;line-height:1.75;margin-bottom:6px}
  .docs-content table{width:100%;border-collapse:collapse;margin-bottom:24px;font-size:.82rem}
  .docs-content th{text-align:left;padding:10px 14px;background:rgba(255,255,255,.03);color:#e2e8f0;font-weight:700;border-bottom:2px solid rgba(255,255,255,.06)}
  .docs-content td{padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.04);color:#94a3b8}
  .docs-content .note{padding:14px 18px;background:rgba(139,77,255,.06);border-left:3px solid rgba(139,77,255,.3);border-radius:0 8px 8px 0;margin-bottom:20px;font-size:.84rem;color:#c4a0ff}
`;

export const DocsTesting = component(() => (
  <div class="docs-layout">
    <style>{s}</style>
    <DocSidebar />
    <main class="docs-main">
      <div class="docs-content">
        <h1>{i18n.t('sb.testing')}</h1>
        <p>{i18n.t('t.intro1')}<strong>{i18n.t('t.intro2')}</strong>{i18n.t('t.intro3')}<code>jsdom</code>{i18n.t('t.intro4')}</p>

        <h2 id="unitarias">{i18n.t('sb.testUnit')}</h2>
        <p><strong>Vitest</strong>{i18n.t('t.vitest1')}<code>jsdom</code>{i18n.t('t.vitest2')}</p>
        <CodeBlock code={`// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
});`} commentsKey="testing.vitest" />

        <h3>{i18n.t('t.store.title')}</h3>
        <p>{i18n.t('t.store.p1')}<code>effect()</code>{i18n.t('t.store.p2')}</p>
        <CodeBlock code={`import { describe, it, expect } from 'vitest';
import { store, effect } from '@astrajs/core';

const cart = store({ items: [] as string[] });

describe('store', () => {
  it('fires surgical effects on mutation', () => {
    let runs = 0;
    effect(() => {
      void cart.items.length; // subscription to the 'items' property
      runs++;
    });

    expect(runs).toBe(1); // the effect runs on subscription

    cart.items = ['t-shirt', 'cap'];
    expect(runs).toBe(2); // re-runs only for 'items'

    cart.items.push('mug');
    expect(runs).toBe(3);
    expect(cart.items).toHaveLength(3);
  });
});`} commentsKey="testing.store" />

        <h3>{i18n.t('t.comp.title')}</h3>
        <p>{i18n.t('t.comp.p')}</p>
        <CodeBlock code={`import { describe, it, expect } from 'vitest';
import { Counter } from '../main.js';

// AstraJS effects run on microtasks
const flush = () => new Promise((r) => setTimeout(r, 0));

describe('Counter', () => {
  it('renders real DOM, not a virtual object', () => {
    const el = Counter({}) as HTMLElement;
    expect(el).toBeInstanceOf(HTMLElement);
    expect(el.querySelector('strong')?.textContent).toBe('0');
  });

  it('updates only the TextNode on click', async () => {
    const el = Counter({}) as HTMLElement;
    document.body.appendChild(el);

    el.querySelector('.inc')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flush();

    expect(el.querySelector('strong')?.textContent).toBe('1');
  });
});`} commentsKey="testing.flush" />

        <div class="note">
          <strong>{i18n.t('lbl.tip')}:</strong> {i18n.t('t.note1')}<code>examples/frontend-only/</code>{i18n.t('t.note2')}<code>examples/fullstack/</code>{i18n.t('t.note3')}<code>src/__tests__/</code>{i18n.t('t.note4')}
        </div>

        <h2 id="jest">{i18n.t('sb.testJest')}</h2>
        <p>{i18n.t('t.jest.p1')}<code>ts-jest</code>{i18n.t('t.jest.p2')}</p>
        <CodeBlock code={`// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\\\.tsx?$': ['ts-jest', {
      tsconfig: { jsx: 'react-jsx', jsxImportSource: '@astrajs/core' },
    }],
  },
};`} commentsKey="testing.jest" />
        <CodeBlock code={`// __tests__/counter.test.tsx
import { Counter } from '../src/main';

test('the counter increments from 0 to 1', () => {
  const el = Counter({}) as HTMLElement;
  document.body.appendChild(el);

  const inc = el.querySelector('.inc') as HTMLButtonElement;
  inc.dispatchEvent(new MouseEvent('click', { bubbles: true }));

  expect(el.querySelector('strong')?.textContent).toBe('1');
});`} commentsKey="testing.jest-test" />

        <h2 id="e2e-playwright">{i18n.t('sb.testPlaywright')}</h2>
        <p>{i18n.t('t.pw.p1')}<code>webServer</code>{i18n.t('t.pw.p2')}</p>
        <CodeBlock code={`// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
  },
});

// e2e/counter.spec.ts
import { test, expect } from '@playwright/test';

test('the counter increments', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '+ 1' }).click();
  await expect(page.locator('.count strong')).toHaveText('1');
});

test('the cart persists across routes', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add to cart' }).first().click();
  await page.getByRole('link', { name: 'Cart' }).click();
  await expect(page.locator('.cart-line')).toHaveCount(1);
});`} commentsKey="testing.playwright" />

        <h2 id="e2e-cypress">{i18n.t('sb.testCypress')}</h2>
        <p>{i18n.t('t.cy.p1')}<code>shadow-dom</code>{i18n.t('t.cy.p2')}</p>
        <CodeBlock code={`// cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: { baseUrl: 'http://localhost:5173' },
});

// cypress/e2e/counter.cy.ts
describe('Counter', () => {
  it('increments', () => {
    cy.visit('/');
    cy.contains('button', '+ 1').click();
    cy.get('.count strong').should('have.text', '1');
  });
});`} commentsKey="testing.cypress" />

        <h2 id="server">server() RPC</h2>
        <p>{i18n.t('t.rpc.p1')}<code>server()</code>{i18n.t('t.rpc.p2')}<code>fetch</code>{i18n.t('t.rpc.p3')}</p>
        <CodeBlock code={`import { describe, it, expect, vi } from 'vitest';
import { listProducts } from '../server/products.server.js';

describe('listProducts', () => {
  it('types and resolves the response', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => [{ id: 1, name: 'Widget', price: 19.9 }],
    })));

    const products = await listProducts();
    expect(products).toHaveLength(1);
    expect(products[0].name).toBe('Widget');
    expect(products[0].price).toBeGreaterThan(0);
  });
});`} />

        <h2 id="comparativa">{i18n.t('sb.testCompare')}</h2>
        <table>
          <tr><th>{i18n.t('t.th1')}</th><th>{i18n.t('t.th2')}</th><th>{i18n.t('t.th3')}</th><th>{i18n.t('t.th4')}</th></tr>
          <tr><td><strong>Vitest</strong></td><td>{i18n.t('t.cell.unit')}</td><td>{i18n.t('t.cell.env')}</td><td>{i18n.t('t.cell.vitest')}</td></tr>
          <tr><td><strong>Jest</strong></td><td>{i18n.t('t.cell.unit')}</td><td>{i18n.t('t.cell.env')}</td><td>{i18n.t('t.cell.jest')}</td></tr>
          <tr><td><strong>Playwright</strong></td><td>{i18n.t('t.cell.e2e')}</td><td>{i18n.t('t.cell.browser')}</td><td>{i18n.t('t.cell.pw')}</td></tr>
          <tr><td><strong>Cypress</strong></td><td>{i18n.t('t.cell.e2e')}</td><td>{i18n.t('t.cell.browser')}</td><td>{i18n.t('t.cell.cy')}</td></tr>
        </table>
        <p>{i18n.t('t.final1')}<strong>{i18n.t('t.final2')}</strong>{i18n.t('t.final3')}</p>
      </div>
    </main>
    <DocRightToc items={[
      { href: '/docs/testing#unitarias', k: 'sb.testUnit' },
      { href: '/docs/testing#jest', k: 'sb.testJest' },
      { href: '/docs/testing#e2e-playwright', k: 'sb.testPlaywright' },
      { href: '/docs/testing#e2e-cypress', k: 'sb.testCypress' },
      { href: '/docs/testing#server', label: 'server() RPC' },
      { href: '/docs/testing#comparativa', k: 'sb.testCompare' },
    ]} />
  </div>
));
