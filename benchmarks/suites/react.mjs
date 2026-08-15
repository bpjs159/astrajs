// React — idiomatic keyed list + flushSync (the fastest deterministic commit
// path; no transitions, no act() needed in jsdom).
import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';

const h = React.createElement;

export const meta = { name: 'React', version: React.version };

function Row(r) {
  return h(
    'tr',
    { key: r.id },
    h('td', null, String(r.id)),
    h('td', null, r.name),
    h('td', null, r.email),
    h('td', null, String(r.score)),
  );
}

export default function createReact() {
  const rootEl = () => document.getElementById('app');
  let root;
  let setRows;

  function App() {
    const [rows, set] = React.useState([]);
    setRows = set;
    return h('table', null, h('tbody', null, rows.map(Row)));
  }

  root = createRoot(rootEl());
  flushSync(() => root.render(h(App)));

  return {
    name: 'React',
    version: React.version,

    render10k(rows) {
      flushSync(() => setRows(rows));
    },

    updateRow(i, name) {
      flushSync(() =>
        setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, name } : r))),
      );
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

    rowCount() {
      return rootEl().querySelectorAll('tr').length;
    },

    destroy() {
      root.unmount();
      rootEl().textContent = '';
    },
  };
}
