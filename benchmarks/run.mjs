#!/usr/bin/env node
// AstraJS frontend benchmark runner — jsdom, MutationObserver-based timing.
// Usage: node run.mjs  → prints table, writes results.json + results.md
import os from 'node:os';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import {
  clearBody,
  freshContainer,
  makeRows,
  median,
  settle,
  timeUntilMutation,
} from './env.mjs';

import { meta as metaAstra, default as createAstra } from './suites/astra.mjs';
import { meta as metaReact, default as createReact } from './suites/react.mjs';
import { meta as metaVue, default as createVue } from './suites/vue.mjs';
import { meta as metaSolid, default as createSolid } from './suites/solid.mjs';
import { meta as metaAngular, default as createAngular } from './suites/angular.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const FACTORIES = [
  { meta: metaAstra, create: createAstra },
  { meta: metaReact, create: createReact },
  { meta: metaVue, create: createVue },
  { meta: metaSolid, create: createSolid },
  { meta: metaAngular, create: createAngular },
];

const ROWS = 10000;
const UPDATE_INDEX = 5000;

const OPS = [
  { id: 'render10k', label: 'Render 10,000 rows', iters: 3, sync: false, expect: 10000 },
  { id: 'updateRow', label: 'Update 1 row (of 10,000)', iters: 10, sync: false, expect: 10000 },
  { id: 'append1k', label: 'Append 1,000 rows', iters: 5, sync: false, expect: 11000 },
  { id: 'remove1k', label: 'Remove 1,000 rows', iters: 5, sync: false, expect: 9000 },
  { id: 'replaceAll', label: 'Replace all 10,000 rows', iters: 3, sync: false, expect: 10000 },
];

const results = {
  meta: {
    generatedAt: new Date().toISOString(),
    node: process.version,
    platform: `${os.platform()} ${os.arch()}`,
    cpu: os.cpus()[0]?.model ?? 'unknown',
    environment: 'jsdom (no layout / no paint) — measures framework JS cost',
    rowCount: ROWS,
    updateIndex: UPDATE_INDEX,
  },
  frameworks: [],
  ops: OPS.map((o) => ({ id: o.id, label: o.label, unit: 'ms', values: {} })),
};

console.log('AstraJS frontend benchmarks — 10,000-row table (jsdom)');
console.log(
  `node ${process.version} · ${os.cpus()[0]?.model} · median of ${OPS[0].iters}–${OPS[1].iters} iterations per op`,
);
console.log('');

for (const entry of FACTORIES) {
  const { meta, create } = entry;
  const name = meta.name;
  const version = meta.version;
  results.frameworks.push({ name, version });
  process.stdout.write(`▸ ${name.padEnd(12)} `);

  for (const op of OPS) {
    const samples = [];
    for (let k = 0; k < op.iters; k++) {
      clearBody();
      const container = freshContainer();
      const suite = await create();

      if (op.id !== 'render10k') {
        suite.render10k(makeRows(ROWS));
        await settle();
      }

      let ms;
      let failed = false;
      if (op.id === 'render10k') {
        ms = await timeUntilMutation(() => suite.render10k(makeRows(ROWS)), container);
      } else if (op.id === 'updateRow') {
        ms = await timeUntilMutation(
          () => suite.updateRow(UPDATE_INDEX, `User ${UPDATE_INDEX} · #${k}`),
          container,
        );
      } else if (op.id === 'append1k') {
        ms = await timeUntilMutation(() => suite.append1k(makeRows(1000, ROWS + k * 1000)), container);
      } else if (op.id === 'remove1k') {
        ms = await timeUntilMutation(() => suite.remove1k(), container);
      } else if (op.id === 'replaceAll') {
        ms = await timeUntilMutation(() => suite.replaceAll(makeRows(ROWS, 20000)), container);
      }

      if (ms === null) {
        failed = true;
        ms = 2500;
      }

      const actual = suite.rowCount();
      if (actual !== op.expect) {
        failed = true;
        console.log(`\n    ⚠ ${op.id}: expected ${op.expect} rows, got ${actual}`);
      }

      if (!failed) samples.push(ms);
      suite.destroy();
    }

    const med = samples.length ? median(samples) : null;
    results.ops.find((o) => o.id === op.id).values[name] =
      med === null ? null : Math.round(med * 1000) / 1000;
    process.stdout.write(med === null ? '  ✗ '.padEnd(12) : `${med.toFixed(1)}ms `.padStart(9));
  }
  console.log('');
}

console.log('');
printTable(results);
// Fresh single-run output → results.latest.* so it never overwrites the
// canonical snapshot (results.json / results.md) that feeds the docs.
writeFileSync(join(__dirname, 'results.latest.json'), JSON.stringify(results, null, 2) + '\n');
writeFileSync(join(__dirname, 'results.latest.md'), toMarkdown(results));
console.log('\nWrote benchmarks/results.latest.json + benchmarks/results.latest.md');

function printTable(r) {
  const rows = [['Benchmark', ...r.frameworks.map((f) => f.name)]];
  for (const op of r.ops) {
    rows.push([op.label, ...r.frameworks.map((f) => fmt(op.values[f.name]))]);
  }
  const w = rows[0].map((_, c) => Math.max(...rows.map((row) => String(row[c]).length)));
  for (const row of rows) {
    console.log(row.map((cell, c) => String(cell).padStart(c === 0 ? -w[c] : w[c])).join('  '));
  }
}

function fmt(v) {
  return v === null || v === undefined ? '—' : `${v.toFixed(2)} ms`;
}

function toMarkdown(r) {
  const head = `| Benchmark | ${r.frameworks.map((f) => `${f.name} (${f.version})`).join(' | ')} |\n|---|---|---|`;
  const lines = r.ops.map(
    (op) =>
      `| ${op.label} | ${r.frameworks.map((f) => (op.values[f.name] === null ? '—' : `${op.values[f.name].toFixed(2)} ms`)).join(' | ')} |`,
  );
  return `# AstraJS Benchmarks — results\n\n> ${r.meta.generatedAt} · node ${r.meta.node} · ${r.meta.cpu}\n> ${r.meta.environment}\n\n${head}\n${lines.join('\n')}\n`;
}
