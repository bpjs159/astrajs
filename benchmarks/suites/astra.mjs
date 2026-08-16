// AstraJS — idiomatic zero-VDOM pattern, mirroring EXACTLY what the AST
// compiler emits for `{st.rows.map(r => <tr>...)}` inside a component:
//
//   bindList(tbody, () => st.rows.map(r => (renderExpr)), r => (renderExpr), keyFn)
//
// The `.map()` getter reads the array contents (indexes/length) so appends
// and splices are reactive, and per-row expressions read the CLOSURE item
// `r` (never `st.rows[i]`), which is how the compiler emits `{r.name}` →
// `dynamic(() => r.name)` micro-bindings.
import { store, bindList, bindText, bindConditional } from '../../packages/core/dist/index.js';

export const meta = { name: 'AstraJS', version: '0.1.0' };

const BLOCK_ROWS = Array.from({ length: 1000 }, (_, i) => `row ${i}`);

function cell(text) {
  const td = document.createElement('td');
  td.textContent = text;
  return td;
}

function boundText(node) {
  const tn = document.createTextNode('');
  node.appendChild(tn);
  return tn;
}

function renderRow(r) {
  const tr = document.createElement('tr');
  tr.appendChild(cell(String(r.id)));
  const name = cell('');
  bindText(boundText(name), () => String(r.name));
  tr.appendChild(name);
  tr.appendChild(cell(r.email));
  const score = cell('');
  bindText(boundText(score), () => String(r.score));
  tr.appendChild(score);
  // Surgical click: only the score TextNode of this row re-renders.
  tr.onclick = () => {
    r.score++;
  };
  return tr;
}

function renderCard(r) {
  const c = document.createElement('div');
  c.className = 'card';
  const b = document.createElement('button');
  b.textContent = '+';
  const s = document.createElement('span');
  bindText(boundText(s), () => String(r.name));
  c.append(b, s);
  b.onclick = () => {
    r.score++;
  };
  return c;
}

export default function createAstra() {
  const root = () => document.getElementById('app');
  let st;
  let tbody;
  let st2;
  let show;
  let inputEl;
  let anchor;
  let block;

  function buildTable(rows) {
    st = store({ rows });
    const table = document.createElement('table');
    tbody = document.createElement('tbody');
    table.appendChild(tbody);
    bindList(tbody, () => st.rows.map((r) => r), renderRow, (r) => r.id);
    root().appendChild(table);
  }

  return {
    name: meta.name,
    version: meta.version,

    render10k(rows) {
      buildTable(rows);
    },

    // Surgical O(1): only the TextNode subscribed to row i updates.
    updateRow(i, name) {
      st.rows[i].name = name;
    },

    updateAll(k) {
      // Surgical mass update: mutate every item in place — each row's name
      // TextNode updates via its own subscription.
      for (const r of st.rows) r.name = `User ${r.id} · v${k}`;
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

    mount1k(rows) {
      st2 = store({ items: rows });
      const wrap = document.createElement('div');
      bindList(wrap, () => st2.items.map((r) => r), renderCard, (r) => r.id);
      root().appendChild(wrap);
    },

    unmount10k() {
      st.rows = [];
    },

    // Real DOM click → event handler → store → binding (measured until DOM).
    clickRow(i) {
      tbody.children[i].click();
    },

    setupInput() {
      const text = store({ v: '' });
      const wrap = document.createElement('div');
      inputEl = document.createElement('input');
      const disp = document.createElement('p');
      bindText(boundText(disp), () => String(text.v));
      inputEl.oninput = (e) => {
        text.v = e.target.value;
      };
      wrap.append(inputEl, disp);
      root().appendChild(wrap);
    },

    typeChar(ch) {
      inputEl.value += ch;
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    },

    setupToggle() {
      show = store({ v: true });
      const wrap = document.createElement('div');
      block = document.createElement('div');
      block.className = 'blk';
      for (const r of BLOCK_ROWS) {
        const el = document.createElement('div');
        el.className = 'blk-row';
        el.textContent = r;
        block.appendChild(el);
      }
      anchor = document.createComment('cond');
      wrap.appendChild(anchor);
      bindConditional(wrap, anchor, () => (show.v ? block : null));
      root().appendChild(wrap);
    },

    toggleBlock() {
      show.v = !show.v;
    },

    count(sel) {
      return root().querySelectorAll(sel).length;
    },

    destroy() {
      root().textContent = '';
    },
  };
}
