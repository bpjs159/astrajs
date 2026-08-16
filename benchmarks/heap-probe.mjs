// Isolated heap probe: runs ONE framework in a FRESH process and prints the
// heap delta (MB) of a single render10k. A single iteration per process:
// subscription retention from prior iterations must not pollute the baseline
// (frameworks with no explicit disposal keep their first render alive).
import { clearBody, freshContainer, makeRows, settle } from './env.mjs';

const suiteModule = process.argv[2];
if (!suiteModule) {
  console.error('usage: node heap-probe.mjs <suite-module-path>');
  process.exit(1);
}

const { default: create } = await import(new URL(suiteModule, import.meta.url).href);

clearBody();
freshContainer();
const suite = await create();
globalThis.gc();
const h0 = process.memoryUsage().heapUsed;
suite.render10k(makeRows(10000));
await settle();
globalThis.gc();
console.log(((process.memoryUsage().heapUsed - h0) / 1048576).toFixed(2));
suite.destroy();
