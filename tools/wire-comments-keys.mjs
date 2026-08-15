// Dev tool: inserts commentsKey="<key>" into commented CodeBlock literals.
import fs from 'node:fs';

const OPEN = 'code={`';
const CLOSE = '`';

/** file → block index (0-based) → commentsKey (or null to skip). */
const MAP = {
  'astra-site/src/pages/docs/advanced.tsx': {
    0: 'advanced.jsx-out', 1: 'advanced.css-out', 2: 'advanced.server-out',
    3: 'advanced.config', 4: 'advanced.inference-store',
    5: 'advanced.inference-server', 6: 'advanced.inference-e2e', 7: 'advanced.vite-config',
  },
  'astra-site/src/pages/docs/ai.tsx': {
    0: 'ai.endpoints', 1: 'ai.streaming', 2: 'ai.build',
  },
  'astra-site/src/pages/docs/cli.tsx': { 6: 'cli.server-split' },
  'astra-site/src/pages/docs/comparison.tsx': {
    0: 'comparison.react-rerender', 1: 'comparison.react-hooks',
    2: 'comparison.vue', 3: 'comparison.angular-cd',
  },
  'astra-site/src/pages/docs/deployment.tsx': { 0: 'deployment.config' },
  'astra-site/src/pages/docs/fundamentals.tsx': {
    0: 'fund.pure', 1: 'fund.counter', 2: 'fund.proxy', 3: 'fund.arrays',
    4: 'fund.batch', 5: 'fund.jsx', 6: 'fund.cond', 7: 'fund.list', 10: 'fund.events',
  },
  'astra-site/src/pages/docs/i18n.tsx': {
    0: 'i18n.install', 1: 'i18n.setup', 2: 'i18n.react', 3: 'i18n.interp', 5: 'i18n.format',
  },
  'astra-site/src/pages/docs/integrations.tsx': {
    0: 'integrations.tailwind-vite', 1: 'integrations.tailwind-css',
    2: 'integrations.tailwind-config', 5: 'integrations.material-web',
    6: 'integrations.shoelace', 7: 'integrations.charts',
  },
  'astra-site/src/pages/docs/introduction.tsx': { 1: 'introduction.vite' },
  'astra-site/src/pages/docs/rendering.tsx': {
    0: 'rendering.ssr', 1: 'rendering.ssg', 2: 'rendering.isr', 3: 'rendering.resume',
  },
  'astra-site/src/pages/docs/router.tsx': {
    0: 'router.routes', 1: 'router.patterns', 2: 'router.exact', 3: 'router.params',
    4: 'router.link', 5: 'router.navigate', 6: 'router.outlet',
    7: 'router.viewtransitions', 8: 'router.onroute',
  },
  'astra-site/src/pages/docs/server-data.tsx': {
    0: 'sd.basic', 1: 'sd.config', 2: 'sd.prebuild', 3: 'sd.dynamic',
    4: 'sd.tags', 5: 'sd.revalidate', 6: 'sd.autosync', 7: 'sd.mutation',
  },
  'astra-site/src/pages/docs/testing.tsx': {
    0: 'testing.vitest', 1: 'testing.store', 2: 'testing.flush',
    3: 'testing.jest', 4: 'testing.jest-test', 5: 'testing.playwright', 6: 'testing.cypress',
  },
};

for (const [file, indexMap] of Object.entries(MAP)) {
  const src = fs.readFileSync(file, 'utf-8');
  let out = src;
  let pos = 0;
  let blockIdx = 0;
  for (;;) {
    const start = out.indexOf(OPEN, pos);
    if (start === -1) break;
    const contentStart = start + OPEN.length;
    let i = contentStart;
    let esc = false;
    for (; i < out.length; i++) {
      const c = out[i];
      if (esc) { esc = false; continue; }
      if (c === '\\') { esc = true; continue; }
      if (c === CLOSE) break;
    }
    const key = indexMap[blockIdx];
    if (key) {
      out = out.slice(0, i + 1) + ` commentsKey="${key}"` + out.slice(i + 1);
      i += ` commentsKey="${key}"`.length;
    }
    pos = i + 1;
    blockIdx++;
  }
  fs.writeFileSync(file, out);
  console.log('wired', file);
}
