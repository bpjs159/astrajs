#!/usr/bin/env node
// Bundle-size benchmark: min+gzip JS each framework ships for the SAME
// 10,000-row table app. Angular omitted: production Angular is AOT-compiled
// by the Angular CLI; including its JIT bundle (which embeds the compiler)
// would be apples-to-oranges.
import esbuild from 'esbuild';
import { gzipSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const ROWS_APP = `const rows = Array.from({ length: 10000 }, (_, i) => ({ id: i, name: 'User ' + i, email: 'user' + i + '@x.dev', score: (i * 7) % 10000 }));\n`;

const ENTRIES = [
  {
    name: 'AstraJS',
    loader: 'ts',
    alias: { '@bpjs159/core': join(__dirname, '../packages/core/src/index.ts') },
    code: ROWS_APP + `
import { store, bindList, bindText } from '@bpjs159/core';
const st = store({ rows });
const tbody = document.createElement('tbody');
bindList(tbody, () => st.rows.map((r) => r), (r) => {
  const tr = document.createElement('tr');
  const a = document.createElement('td'); a.textContent = String(r.id); tr.appendChild(a);
  const b = document.createElement('td');
  const tn = document.createTextNode(''); b.appendChild(tn); bindText(tn, () => String(r.name));
  tr.appendChild(b);
  const c = document.createElement('td'); c.textContent = r.email; tr.appendChild(c);
  const d = document.createElement('td'); d.textContent = String(r.score); tr.appendChild(d);
  return tr;
}, (r) => r.id);
document.getElementById('app').appendChild(tbody);
`,
  },
  {
    name: 'React',
    loader: 'js',
    code: ROWS_APP + `
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
const h = React.createElement;
function Row(r) { return h('tr', { key: r.id }, h('td', null, String(r.id)), h('td', null, r.name), h('td', null, r.email), h('td', null, String(r.score))); }
function App() { const [list] = useState(rows); return h('table', null, h('tbody', null, list.map(Row))); }
createRoot(document.getElementById('app')).render(h(App));
`,
  },
  {
    name: 'Vue',
    loader: 'js',
    code: ROWS_APP + `
import { createApp, reactive, h } from 'vue';
const state = reactive({ rows });
createApp({ render: () => h('table', null, h('tbody', null, state.rows.map((r) => h('tr', { key: r.id }, h('td', String(r.id)), h('td', r.name), h('td', r.email), h('td', String(r.score)))))) }).mount('#app');
`,
  },
  {
    name: 'Solid',
    loader: 'js',
    code: ROWS_APP + `
import { render, insert } from 'solid-js/web';
import { createSignal, Index } from 'solid-js';
render(() => {
  const [list] = createSignal(rows);
  const tbody = document.createElement('tbody');
  const props = {};
  Object.defineProperty(props, 'each', { get: () => list(), enumerable: true });
  props.children = (item) => {
    const tr = document.createElement('tr');
    const a = document.createElement('td'); insert(a, () => String(item().id)); tr.appendChild(a);
    const b = document.createElement('td'); insert(b, () => String(item().name)); tr.appendChild(b);
    const c = document.createElement('td'); insert(c, () => String(item().email)); tr.appendChild(c);
    const d = document.createElement('td'); insert(d, () => String(item().score)); tr.appendChild(d);
    return tr;
  };
  insert(tbody, Index(props));
  const table = document.createElement('table'); table.appendChild(tbody);
  return table;
}, document.getElementById('app'));
`,
  },
];

const results = {
  meta: {
    generatedAt: new Date().toISOString(),
    note: 'Minified + gzip (level 9) bundles for the same 10,000-row table app. Angular omitted: production Angular is AOT-compiled by the Angular CLI; its JIT bundle embeds the compiler and is not comparable.',
  },
  bundles: [],
};

console.log('Bundle size (min + gzip) for the same 10,000-row table app');
for (const e of ENTRIES) {
  const out = await esbuild.build({
    stdin: { contents: e.code, loader: e.loader, resolveDir: __dirname },
    alias: e.alias,
    bundle: true,
    write: false,
    minify: true,
    format: 'esm',
    define: { 'process.env.NODE_ENV': '"production"' },
    logLevel: 'silent',
  });
  const bytes = out.outputFiles[0].contents.length;
  const gz = gzipSync(out.outputFiles[0].contents, { level: 9 }).length;
  results.bundles.push({ framework: e.name, min: bytes, gzip: gz });
  console.log(`  ${e.name.padEnd(10)} min ${(bytes / 1024).toFixed(1).padStart(7)} kB · gzip ${(gz / 1024).toFixed(1).padStart(7)} kB`);
}

writeFileSync(join(__dirname, 'bundle-results.json'), JSON.stringify(results, null, 2) + '\n');
console.log('\nWrote benchmarks/bundle-results.json');
