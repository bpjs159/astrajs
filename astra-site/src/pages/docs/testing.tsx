import { component, dynamic } from '@astrajs/core';
import { DocSidebar } from '../../components/docs-sidebar.js';

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
        <h1>Pruebas</h1>
        <p>Probar aplicaciones AstraJS es trivial porque los componentes retornan <strong>DOM real</strong>. No hay VDOM, no hay un renderer propietario que emular: montas el nodo en <code>jsdom</code>, disparas eventos, y verificas el resultado. Cualquier runner de JavaScript funciona.</p>

        <h2 id="unitarias">Unitarias con Vitest</h2>
        <p><strong>Vitest</strong> es el runner recomendado: misma sintaxis que Jest, esbuild para TypeScript sin configurar, y <code>jsdom</code> incluido. Solo agrega la configuración:</p>
        <pre><code>{`// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
});`}</code></pre>

        <h3>Probar un store</h3>
        <p>Los stores son objetos con un Proxy — puedes leerlos, mutarlos y observar la reactividad con <code>effect()</code> fuera de cualquier componente:</p>
        <pre><code>{`import { describe, it, expect } from 'vitest';
import { store, effect } from '@astrajs/core';

const cart = store({ items: [] as string[] });

describe('store', () => {
  it('dispara efectos quirurgicos al mutar', () => {
    let runs = 0;
    effect(() => {
      void cart.items.length; // suscripcion a la propiedad 'items'
      runs++;
    });

    expect(runs).toBe(1); // el efecto corre al suscribirse

    cart.items = ['camiseta', 'gorra'];
    expect(runs).toBe(2); // re-corre solo por 'items'

    cart.items.push('taza');
    expect(runs).toBe(3);
    expect(cart.items).toHaveLength(3);
  });
});`}</code></pre>

        <h3>Probar un componente</h3>
        <p>Monta el nodo retornado por el componente, dispara eventos del navegador y verifica el DOM:</p>
        <pre><code>{`import { describe, it, expect } from 'vitest';
import { Counter } from '../main.js';

// Los efectos de AstraJS se ejecutan en microtareas
const flush = () => new Promise((r) => setTimeout(r, 0));

describe('Counter', () => {
  it('renderiza DOM real, no un objeto virtual', () => {
    const el = Counter({}) as HTMLElement;
    expect(el).toBeInstanceOf(HTMLElement);
    expect(el.querySelector('strong')?.textContent).toBe('0');
  });

  it('actualiza solo el TextNode al hacer clic', async () => {
    const el = Counter({}) as HTMLElement;
    document.body.appendChild(el);

    el.querySelector('.inc')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flush();

    expect(el.querySelector('strong')?.textContent).toBe('1');
  });
});`}</code></pre>

        <div class="note">
          <strong>Tip:</strong> los 20 ejemplos del repo (<code>examples/frontend-only/</code> y <code>examples/fullstack/</code>) ya incluyen suites Vitest en <code>src/__tests__/</code> — render, clics, listas condicionales, ciclos de vida y RPC.
        </div>

        <h2 id="jest">Con Jest</h2>
        <p>Jest funciona exactamente igual. La unica diferencia es la configuracion de TypeScript con <code>ts-jest</code>:</p>
        <pre><code>{`// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\\\.tsx?$': ['ts-jest', {
      tsconfig: { jsx: 'react-jsx', jsxImportSource: '@astrajs/core' },
    }],
  },
};`}</code></pre>
        <pre><code>{`// __tests__/counter.test.tsx
import { Counter } from '../src/main';

test('el contador incrementa de 0 a 1', () => {
  const el = Counter({}) as HTMLElement;
  document.body.appendChild(el);

  const inc = el.querySelector('.inc') as HTMLButtonElement;
  inc.dispatchEvent(new MouseEvent('click', { bubbles: true }));

  expect(el.querySelector('strong')?.textContent).toBe('1');
});`}</code></pre>

        <h2 id="e2e-playwright">E2E con Playwright</h2>
        <p>Para flujos completos en un navegador real. Levanta la app con el <code>webServer</code> y Playwright se encarga del resto:</p>
        <pre><code>{`// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
  },
});

// e2e/counter.spec.ts
import { test, expect } from '@playwright/test';

test('el contador incrementa', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '+ 1' }).click();
  await expect(page.locator('.count strong')).toHaveText('1');
});

test('el carrito persiste entre rutas', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Añadir al carrito' }).first().click();
  await page.getByRole('link', { name: 'Cart' }).click();
  await expect(page.locator('.cart-line')).toHaveCount(1);
});`}</code></pre>

        <h2 id="e2e-cypress">E2E con Cypress</h2>
        <p>La misma idea con Cypress — los selectores apuntan a tu DOM real porque no hay <code>shadow-dom</code> ni IDs generados:</p>
        <pre><code>{`// cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: { baseUrl: 'http://localhost:5173' },
});

// cypress/e2e/counter.cy.ts
describe('Counter', () => {
  it('incrementa', () => {
    cy.visit('/');
    cy.contains('button', '+ 1').click();
    cy.get('.count strong').should('have.text', '1');
  });
});`}</code></pre>

        <h2 id="server">server() RPC</h2>
        <p>Las funciones <code>server()</code> son fetch wrappers tipados en el cliente — puedes mockear <code>fetch</code> sin tocar el servidor:</p>
        <pre><code>{`import { describe, it, expect, vi } from 'vitest';
import { listProducts } from '../server/products.server.js';

describe('listProducts', () => {
  it('tipa y resuelve la respuesta', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => [{ id: 1, name: 'Widget', price: 19.9 }],
    })));

    const products = await listProducts();
    expect(products).toHaveLength(1);
    expect(products[0].name).toBe('Widget');
    expect(products[0].price).toBeGreaterThan(0);
  });
});`}</code></pre>

        <h2 id="comparativa">Comparativa de librerías</h2>
        <table>
          <tr><th>Librería</th><th>Nivel</th><th>Entorno</th><th>Ideal para</th></tr>
          <tr><td><strong>Vitest</strong></td><td>Unit + integración</td><td>jsdom / node</td><td>Default: stores, componentes, RPC</td></tr>
          <tr><td><strong>Jest</strong></td><td>Unit + integración</td><td>jsdom / node</td><td>Equipos con Jest existente</td></tr>
          <tr><td><strong>Playwright</strong></td><td>E2E</td><td>Navegador real</td><td>Flujos completos, multi-browser</td></tr>
          <tr><td><strong>Cypress</strong></td><td>E2E</td><td>Navegador real</td><td>Flujos con depuración visual</td></tr>
        </table>
        <p>Como AstraJS produce <strong>DOM real y sin VDOM</strong>, ninguna librería necesita adaptadores, renderers extra ni snapshots de árboles virtuales. Pruebas de componentes = montar nodo + eventos DOM + asserts.</p>
      </div>
    </main>
  </div>
));
