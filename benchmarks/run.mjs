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
  { meta: metaAstra, create: createAstra, file: './suites/astra.mjs' },
  { meta: metaReact, create: createReact, file: './suites/react.mjs' },
  { meta: metaVue, create: createVue, file: './suites/vue.mjs' },
  { meta: metaSolid, create: createSolid, file: './suites/solid.mjs' },
  { meta: metaAngular, create: createAngular, file: './suites/angular.mjs' },
];

const ROWS = 10000;
const UPDATE_INDEX = 5000;

const OPS = [
  { id: 'bootstrap', label: 'Bootstrap (empty app)', iters: 5, setup: 'none', sel: null, expect: null, unit: 'ms' },
  { id: 'render10k', label: 'Render 10,000 rows', iters: 3, setup: 'none', sel: 'tr', expect: 10000, unit: 'ms' },
  { id: 'updateRow', label: 'Update 1 row (of 10,000)', iters: 10, setup: 'table', sel: 'tr', expect: 10000, unit: 'ms' },
  { id: 'updateAll', label: 'Update all 10,000 rows', iters: 5, setup: 'table', sel: 'tr', expect: 10000, unit: 'ms' },
  { id: 'append1k', label: 'Append 1,000 rows', iters: 5, setup: 'table', sel: 'tr', expect: 11000, unit: 'ms' },
  { id: 'remove1k', label: 'Remove 1,000 rows', iters: 5, setup: 'table', sel: 'tr', expect: 9000, unit: 'ms' },
  { id: 'replaceAll', label: 'Replace all 10,000 rows', iters: 3, setup: 'table', sel: 'tr', expect: 10000, unit: 'ms' },
  { id: 'mount1k', label: 'Mount 1,000 components', iters: 3, setup: 'none', sel: '.card', expect: 1000, unit: 'ms' },
  { id: 'unmount10k', label: 'Unmount 10,000 rows', iters: 3, setup: 'table', sel: 'tr', expect: 0, unit: 'ms' },
  { id: 'clickLatency', label: 'Click → DOM update (row 5,000)', iters: 10, setup: 'table', sel: 'tr', expect: 10000, unit: 'ms' },
  { id: 'inputLatency', label: 'Keystroke → DOM update', iters: 10, setup: 'input', sel: null, expect: null, unit: 'ms' },
  { id: 'toggleConditional', label: 'Toggle conditional block (1,000 rows)', iters: 10, setup: 'toggle', sel: null, expect: null, unit: 'ms' },
  { id: 'heap', label: 'Heap delta after render 10,000 rows', iters: 1, setup: 'none', sel: null, expect: null, unit: 'MB' },
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
    productionBuilds: true,
  },
  frameworks: [],
  ops: OPS.map((o) => ({ id: o.id, label: o.label, unit: o.unit, values: {} })),
};

console.log('AstraJS frontend benchmarks — 10,000-row table (jsdom)');
console.log(
  `node ${process.version} · ${os.cpus()[0]?.model} · median of ${OPS[1].iters}–${OPS[2].iters} iterations per op`,
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
      let suite;
      let ms = null;
      let failed = false;

      // bootstrap — measures suite creation (framework init) itself.
      if (op.id === 'bootstrap') {
        const t0 = performance.now();
        suite = await create();
        ms = performance.now() - t0;
        suite.destroy();
        if (!failed) samples.push(ms);
        continue;
      }

      suite = await create();

      // Setup (outside the measurement).
      if (op.setup === 'table') {
        suite.render10k(makeRows(ROWS));
        await settle();
      } else if (op.setup === 'input') {
        suite.setupInput();
        await settle();
      } else if (op.setup === 'toggle') {
        suite.setupToggle();
        await settle();
      }

      if (op.id === 'heap') {
        // Isolated measurement: fresh child process per framework, so
        // subscription retention from previous iterations can't pollute it.
        const { execFileSync } = await import('node:child_process');
        const out = execFileSync(
          process.execPath,
          ['--expose-gc', '--import', join(__dirname, 'register-solid.mjs'), join(__dirname, 'heap-probe.mjs'), join(__dirname, entry.file)],
          { env: { ...process.env, NODE_ENV: 'production' }, encoding: 'utf8' },
        );
        const parsed = parseFloat(out.trim());
        if (Number.isFinite(parsed)) {
          ms = parsed;
          suite.destroy();
          samples.push(ms);
          continue;
        }
        failed = true;
        console.log('\n    ⚠ heap probe failed');
      } else if (op.id === 'render10k') {
        ms = await timeUntilMutation(() => suite.render10k(makeRows(ROWS)), container);
      } else if (op.id === 'updateRow') {
        ms = await timeUntilMutation(
          () => suite.updateRow(UPDATE_INDEX, `User ${UPDATE_INDEX} · #${k}`),
          container,
        );
      } else if (op.id === 'updateAll') {
        ms = await timeUntilMutation(() => suite.updateAll(k), container);
      } else if (op.id === 'append1k') {
        ms = await timeUntilMutation(() => suite.append1k(makeRows(1000, ROWS + k * 1000)), container);
      } else if (op.id === 'remove1k') {
        ms = await timeUntilMutation(() => suite.remove1k(), container);
      } else if (op.id === 'replaceAll') {
        ms = await timeUntilMutation(() => suite.replaceAll(makeRows(ROWS, 20000)), container);
      } else if (op.id === 'mount1k') {
        ms = await timeUntilMutation(() => suite.mount1k(makeRows(1000, 0)), container);
      } else if (op.id === 'unmount10k') {
        ms = await timeUntilMutation(() => suite.unmount10k(), container);
      } else if (op.id === 'clickLatency') {
        ms = await timeUntilMutation(() => suite.clickRow(UPDATE_INDEX), container);
      } else if (op.id === 'inputLatency') {
        ms = await timeUntilMutation(
          () => suite.typeChar(String.fromCharCode(97 + (k % 26))),
          container,
        );
      } else if (op.id === 'toggleConditional') {
        ms = await timeUntilMutation(() => suite.toggleBlock(), container);
      }

      if (op.id !== 'heap' && ms === null) {
        failed = true;
        ms = 2500;
      }

      if (op.sel && op.expect !== null) {
        const actual = suite.count(op.sel);
        if (actual !== op.expect) {
          failed = true;
          console.log(`\n    ⚠ ${op.id}: expected ${op.expect} rows, got ${actual}`);
        }
      }

      if (!failed && ms !== null) samples.push(ms);
      suite.destroy();
    }

    const med = samples.length ? median(samples) : null;
    results.ops.find((o) => o.id === op.id).values[name] =
      med === null ? null : Math.round(med * 1000) / 1000;
    process.stdout.write(med === null ? '  ✗ '.padEnd(12) : `${med.toFixed(1)}${op.unit === 'MB' ? 'MB ' : 'ms '}`.padStart(9));
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
    rows.push([op.label, ...r.frameworks.map((f) => fmt(op.values[f.name], op.unit))]);
  }
  const w = rows[0].map((_, c) => Math.max(...rows.map((row) => String(row[c]).length)));
  for (const row of rows) {
    console.log(row.map((cell, c) => String(cell).padStart(c === 0 ? -w[c] : w[c])).join('  '));
  }
}

function fmt(v, unit = 'ms') {
  return v === null || v === undefined ? '—' : `${v.toFixed(2)} ${unit}`;
}

function toMarkdown(r) {
  const head = `| Benchmark | ${r.frameworks.map((f) => `${f.name} (${f.version})`).join(' | ')} |\n|---|---|---|`;
  const lines = r.ops.map(
    (op) =>
      `| ${op.label} | ${r.frameworks.map((f) => (op.values[f.name] === null ? '—' : `${op.values[f.name].toFixed(2)} ${op.unit}`)).join(' | ')} |`,
  );
  return `# AstraJS Benchmarks — results\n\n> ${r.meta.generatedAt} · node ${r.meta.node} · ${r.meta.cpu}\n> ${r.meta.environment}\n\n${head}\n${lines.join('\n')}\n`;
}
