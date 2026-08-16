// React — idiomatic keyed list + flushSync (the fastest deterministic commit
// path; no transitions, no act() needed in jsdom).
import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';

const h = React.createElement;

export const meta = { name: 'React', version: React.version };

const BLOCK_ROWS = Array.from({ length: 1000 }, (_, i) => `row ${i}`);

function Row(r, onClick) {
  return h(
    'tr',
    { key: r.id, onClick },
    h('td', null, String(r.id)),
    h('td', null, r.name),
    h('td', null, r.email),
    h('td', null, String(r.score)),
  );
}

function Card(r) {
  return h(
    'div',
    { key: r.id, className: 'card' },
    h('button', null, '+'),
    h('span', null, r.name),
  );
}

export default function createReact() {
  const rootEl = () => document.getElementById('app');
  let root;
  let setRows;
  let setText;
  let setShow;
  let setCards;
  let inputEl;

  function App() {
    const [rows, setR] = React.useState([]);
    const [text, setT] = React.useState('');
    const [show, setS] = React.useState(true);
    const [cards, setC] = React.useState([]);
    setRows = setR;
    setText = setT;
    setShow = setS;
    setCards = setC;

    return h(
      'div',
      null,
      rows.length
        ? h(
            'table',
            null,
            h(
              'tbody',
              null,
              rows.map((r, idx) =>
                Row(r, () =>
                  setR((prev) => prev.map((x, i) => (i === idx ? { ...x, score: x.score + 1 } : x))),
                ),
              ),
            ),
          )
        : null,
      h('input', {
        value: text,
        onChange: (e) => setT(e.target.value),
        ref: (el) => {
          inputEl = el;
        },
      }),
      h('p', null, text),
      show ? h('div', { className: 'blk' }, BLOCK_ROWS.map((x) => h('div', { key: x, className: 'blk-row' }, x))) : null,
      h('div', null, cards.map(Card)),
    );
  }

  root = createRoot(rootEl());
  flushSync(() => root.render(h(App)));

  return {
    name: meta.name,
    version: meta.version,

    render10k(rows) {
      flushSync(() => setRows(rows));
    },

    updateRow(i, name) {
      flushSync(() =>
        setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, name } : r))),
      );
    },

    updateAll(k) {
      flushSync(() => setRows((prev) => prev.map((r) => ({ ...r, name: `User ${r.id} · v${k}` }))));
    },

    append1k(rows) {
      flushSync(() => setRows((prev) => [...prev, ...rows]));
    },

    remove1k() {
      flushSync(() => setRows((prev) => prev.slice(1000)));
    },

    replaceAll(rows) {
      flushSync(() => setRows(rows));
    },

    mount1k(rows) {
      flushSync(() => setCards(rows));
    },

    unmount10k() {
      flushSync(() => setRows([]));
    },

    // Real DOM click → synthetic onClick → setState → commit.
    clickRow(i) {
      rootEl().querySelectorAll('tr')[i].click();
    },

    setupInput() {
      // The input is already mounted by the App — nothing to do.
    },

    typeChar(ch) {
      // React tracks the value property — go through the native setter.
      const proto = Object.getPrototypeOf(inputEl);
      const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
      setter.call(inputEl, inputEl.value + ch);
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    },

    setupToggle() {
      // The conditional block is already mounted (visible) — nothing to do.
    },

    toggleBlock() {
      flushSync(() => setShow((s) => !s));
    },

    count(sel) {
      return rootEl().querySelectorAll(sel).length;
    },

    destroy() {
      root.unmount();
      rootEl().textContent = '';
    },
  };
}
