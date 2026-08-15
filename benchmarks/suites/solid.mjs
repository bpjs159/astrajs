// Solid — fine-grained signals. <Index> keeps rows referentially stable and
// passes an ACCESSOR per row. Rows are built exactly like compiled Solid
// templates do: document.createElement + insert(el, () => expr) — every cell
// is a reactive binding, so updating one item re-runs only that row's
// bindings (O(1) per-row updates, no re-render of the rest).
import { render, insert } from 'solid-js/web/dist/web.js';
import { createSignal, Index } from 'solid-js';
import * as Solid from 'solid-js';

export const meta = { name: 'Solid', version: Solid.version ?? '1.x' };

export default function createSolid() {
  const rootEl = () => document.getElementById('app');
  let setRows;
  let dispose;

  const Row = (item) => {
    const tr = document.createElement('tr');
    const c1 = document.createElement('td');
    insert(c1, () => String(item().id));
    const c2 = document.createElement('td');
    insert(c2, () => String(item().name));
    const c3 = document.createElement('td');
    insert(c3, () => String(item().email));
    const c4 = document.createElement('td');
    insert(c4, () => String(item().score));
    tr.append(c1, c2, c3, c4);
    return tr;
  };

  dispose = render(() => {
    const [rows, set] = createSignal([]);
    setRows = set;
    // Compiled Solid templates emit Index with GETTER props:
    // `get each() { return rows(); }` — plain accessor props don't work.
    const props = {};
    Object.defineProperty(props, 'each', { get: () => rows(), enumerable: true });
    props.children = Row;
    const table = document.createElement('table');
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    insert(tbody, Index(props));
    return table;
  }, rootEl());

  return {
    name: 'Solid',
    version: Solid.version ?? '1.x',

    render10k(rows) {
      setRows(rows);
    },

    updateRow(i, name) {
      setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, name } : r)));
    },

    append1k(rows) {
      setRows((prev) => [...prev, ...rows]);
    },

    remove1k() {
      setRows((prev) => prev.slice(1000));
    },

    replaceAll(rows) {
      setRows(rows);
    },

    rowCount() {
      return rootEl().querySelectorAll('tr').length;
    },

    destroy() {
      dispose();
      rootEl().textContent = '';
    },
  };
}
