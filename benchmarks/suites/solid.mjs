// Solid — fine-grained signals. <Index> keeps rows referentially stable and
// passes an ACCESSOR per row. Rows are built exactly like compiled Solid
// templates do: document.createElement + insert(el, () => expr) — every cell
// is a reactive binding, so updating one item re-runs only that row's
// bindings (O(1) per-row updates, no re-render of the rest).
import { render, insert } from 'solid-js/web/dist/web.js';
import { createSignal, Index } from 'solid-js';
import * as Solid from 'solid-js';

export const meta = { name: 'Solid', version: Solid.version ?? '1.x' };

const BLOCK_ROWS = Array.from({ length: 1000 }, (_, i) => `row ${i}`);

function indexProps(list) {
  // Compiled Solid templates emit Index with GETTER props:
  // `get each() { return rows(); }` — plain accessor props don't work.
  const props = {};
  Object.defineProperty(props, 'each', { get: () => list(), enumerable: true });
  return props;
}

export default function createSolid() {
  const rootEl = () => document.getElementById('app');
  let setRows;
  let setText;
  let setShow;
  let show;
  let setCards;
  let dispose;

  // NOTE: Index passes (item accessor, plain index number).
  const Row = (item, i) => {
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
    tr.onclick = () => {
      setRows((prev) => prev.map((x, k) => (k === i ? { ...x, score: x.score + 1 } : x)));
    };
    return tr;
  };

  const Card = (item) => {
    const c = document.createElement('div');
    c.className = 'card';
    const b = document.createElement('button');
    b.textContent = '+';
    const s = document.createElement('span');
    insert(s, () => String(item().name));
    c.append(b, s);
    return c;
  };

  const blockEl = (() => {
    const blk = document.createElement('div');
    blk.className = 'blk';
    for (const x of BLOCK_ROWS) {
      const el = document.createElement('div');
      el.className = 'blk-row';
      el.textContent = x;
      blk.appendChild(el);
    }
    return blk;
  })();

  dispose = render(() => {
    const [rows, set] = createSignal([]);
    const [text, setT] = createSignal('');
    const [showS, setS] = createSignal(true);
    const [cards, setC] = createSignal([]);
    setRows = set;
    setText = setT;
    show = showS;
    setShow = setS;
    setCards = setC;

    const wrap = document.createElement('div');

    const tableWrap = document.createElement('div');
    const rowProps = indexProps(rows);
    rowProps.children = Row;
    insert(tableWrap, Index(rowProps));
    wrap.appendChild(tableWrap);

    const inputEl = document.createElement('input');
    inputEl.oninput = (e) => setText(e.target.value);
    wrap.appendChild(inputEl);

    const disp = document.createElement('p');
    insert(disp, () => text());
    wrap.appendChild(disp);

    const blkWrap = document.createElement('div');
    insert(blkWrap, () => (show() ? blockEl : document.createComment('')));
    wrap.appendChild(blkWrap);

    const cardsWrap = document.createElement('div');
    const cardProps = indexProps(cards);
    cardProps.children = Card;
    insert(cardsWrap, Index(cardProps));
    wrap.appendChild(cardsWrap);

    return wrap;
  }, rootEl());

  return {
    name: meta.name,
    version: meta.version,

    render10k(rows) {
      setRows(rows);
    },

    updateRow(i, name) {
      setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, name } : r)));
    },

    updateAll(k) {
      setRows((prev) => prev.map((r) => ({ ...r, name: `User ${r.id} · v${k}` })));
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

    mount1k(rows) {
      setCards(rows);
    },

    unmount10k() {
      setRows([]);
    },

    // Real DOM click → handler → signal → binding.
    clickRow(i) {
      rootEl().querySelectorAll('tr')[i].click();
    },

    setupInput() {
      // The input is already mounted by the app — nothing to do.
    },

    typeChar(ch) {
      const inputEl = rootEl().querySelector('input');
      inputEl.value += ch;
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    },

    setupToggle() {
      // The conditional block is already mounted (visible) — nothing to do.
    },

    toggleBlock() {
      setShow(!show());
    },

    count(sel) {
      return rootEl().querySelectorAll(sel).length;
    },

    destroy() {
      dispose();
      rootEl().textContent = '';
    },
  };
}
