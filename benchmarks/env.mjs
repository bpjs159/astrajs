// Shared jsdom environment. Imported FIRST by run.mjs so that every suite
// module (react/vue/solid) initializes AFTER the browser globals exist.
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  pretendToBeVisual: true,
  url: 'http://localhost/',
});

export const window = dom.window;
const doc = window.document;

function setGlobal(key, value) {
  try {
    globalThis[key] = value;
  } catch {
    Object.defineProperty(globalThis, key, {
      value,
      configurable: true,
      writable: true,
    });
  }
}

setGlobal('window', window);
setGlobal('document', doc);
setGlobal('navigator', window.navigator);
setGlobal('HTMLElement', window.HTMLElement);
setGlobal('Element', window.Element);
setGlobal('Node', window.Node);
setGlobal('Text', window.Text);
setGlobal('Comment', window.Comment);
setGlobal('DocumentFragment', window.DocumentFragment);
setGlobal('MutationObserver', window.MutationObserver);
setGlobal('getComputedStyle', window.getComputedStyle.bind(window));
setGlobal('requestAnimationFrame', window.requestAnimationFrame.bind(window));
setGlobal('cancelAnimationFrame', window.cancelAnimationFrame.bind(window));
setGlobal('CustomEvent', window.CustomEvent);
setGlobal('Event', window.Event);
setGlobal('KeyboardEvent', window.KeyboardEvent);
setGlobal('MouseEvent', window.MouseEvent);
setGlobal('PointerEvent', window.PointerEvent);
setGlobal('SVGElement', window.SVGElement);
// Silence React 19 act() warnings in jsdom.
setGlobal('IS_REACT_ACT_ENVIRONMENT', false);

/** A fresh mount point for one benchmark iteration. */
export function freshContainer() {
  doc.body.innerHTML = '<div id="app"></div>';
  return doc.getElementById('app');
}

export function clearBody() {
  doc.body.innerHTML = '';
}

/** Let schedulers (microtasks + one rAF) drain. */
export async function settle() {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((r) => setTimeout(r, 0));
  await new Promise((r) => window.requestAnimationFrame(() => r()));
}

/**
 * Measures elapsed time from just before `fn()` runs until the first DOM
 * mutation lands (MutationObserver fires in a microtask, so deferred
 * schedulers of every framework are included uniformly).
 * Returns null when no mutation happens within 2500 ms.
 */
export function timeUntilMutation(fn, root) {
  return new Promise((resolve) => {
    let done = false;
    let t0 = 0;
    let mo;
    const finish = (ms) => {
      if (done) return;
      done = true;
      mo.disconnect();
      clearTimeout(timer);
      resolve(ms);
    };
    mo = new window.MutationObserver(() => finish(performance.now() - t0));
    mo.observe(root, { subtree: true, childList: true, characterData: true });
    const timer = setTimeout(() => finish(null), 2500);
    t0 = performance.now();
    try {
      fn();
    } catch (e) {
      finish(null);
      console.error('  [suite error]', e.message);
    }
  });
}

/** Synchronous timing (used for the initial render). */
export function timeSync(fn) {
  const t0 = performance.now();
  fn();
  return performance.now() - t0;
}

export function median(xs) {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

const EMAILS = ['@correo.dev', '@astra.dev', '@correo.io'];
export function makeRows(count, offset = 0) {
  const rows = new Array(count);
  for (let i = 0; i < count; i++) {
    rows[i] = {
      id: offset + i,
      name: `User ${offset + i}`,
      email: `user${offset + i}${EMAILS[(offset + i) % EMAILS.length]}`,
      score: (offset + i * 7) % 10000,
    };
  }
  return rows;
}
