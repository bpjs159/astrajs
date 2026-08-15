// AstraJS — idiomatic zero-VDOM pattern, mirroring EXACTLY what the AST
// compiler emits for `{st.rows.map(r => <tr>...)}` inside a component:
//
//   bindList(tbody, () => st.rows.map(r => (renderExpr)), r => (renderExpr), keyFn)
//
// The `.map()` getter reads the array contents (indexes/length) so appends
// and splices are reactive, and per-row expressions read the CLOSURE item
// `r` (never `st.rows[i]`), which is how the compiler emits `{r.name}` →
// `dynamic(() => r.name)` micro-bindings.
import { store, bindList, bindText } from '../../packages/core/dist/index.js';

export const meta = { name: 'AstraJS', version: '0.1.0' };

function cell(text) {
  const td = document.createElement('td');
  td.textContent = text;
  return td;
}

function renderRow(r) {
  const tr = document.createElement('tr');
  tr.appendChild(cell(String(r.id)));
  const name = cell('');
  const tn = document.createTextNode('');
  name.appendChild(tn);
  bindText(tn, () => String(r.name));
  tr.appendChild(name);
  tr.appendChild(cell(r.email));
  tr.appendChild(cell(String(r.score)));
  return tr;
}

export default function createAstra() {
  const root = () => document.getElementById('app');
  let st;
  let tbody;

  return {
    name: 'AstraJS',
    version: '0.1.0',

    render10k(rows) {
      st = store({ rows });
      const table = document.createElement('table');
      tbody = document.createElement('tbody');
      table.appendChild(tbody);
      bindList(
        tbody,
        () => st.rows.map((r) => r),
        renderRow,
        (r) => r.id,
      );
      root().appendChild(table);
    },

    // Surgical O(1): only the TextNode subscribed to row i updates.
    updateRow(i, name) {
      st.rows[i].name = name;
    },

    append1k(rows) {
      st.rows.push(...rows);
    },

    remove1k() {
      st.rows.splice(0, 1000);
    },

    replaceAll(rows) {
      st.rows = rows;
    },

    rowCount() {
      return tbody.childElementCount;
    },

    destroy() {
      root().textContent = '';
    },
  };
}
