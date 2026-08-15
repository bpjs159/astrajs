import { describe, it, expect } from 'vitest';
import { store, flushPending } from '../runtime/store.js';
import { bindList } from '../runtime/dom.js';

function renderRow(item: { id: number }, _index: number) {
  const li = document.createElement('li');
  li.textContent = `item-${item.id}`;
  return li;
}

function mount(items: { id: number }[]) {
  document.body.innerHTML = '<ul id="list"></ul>';
  const el = document.getElementById('list') as HTMLUListElement;
  const st = store({ items });
  bindList(el, () => st.items.map((i) => i), renderRow, (i) => i.id);
  return { el, st };
}

describe('bindList', () => {
  it('renders the initial list', () => {
    const { el } = mount([{ id: 1 }, { id: 2 }]);
    expect(el.children.length).toBe(2);
    expect(el.children[1].textContent).toBe('item-2');
  });

  // Regression (2026-08-15, benchmarks/ PoC): before the fast paths, every
  // bindList re-run cleared the parent and re-inserted ALL nodes. Appending
  // 1k rows to a 10k list cost ~220ms of DOM churn. The pure-append fast
  // path must reuse existing nodes and only create the new ones.
  it('pure append reuses existing nodes and only adds new ones', () => {
    const { el, st } = mount([{ id: 1 }, { id: 2 }]);
    const first = el.children[0];
    st.items.push({ id: 3 });
    flushPending();
    expect(el.children.length).toBe(3);
    expect(el.children[0]).toBe(first);
    expect(el.children[2].textContent).toBe('item-3');
  });

  it('pure tail removal removes only the removed nodes', () => {
    const { el, st } = mount([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
    const first = el.children[0];
    const second = el.children[1];
    st.items.splice(2);
    flushPending();
    expect(el.children.length).toBe(2);
    expect(el.children[0]).toBe(first);
    expect(el.children[1]).toBe(second);
  });

  it('pure head removal removes only the removed nodes (splice at 0)', () => {
    const { el, st } = mount([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
    const third = el.children[2];
    const fourth = el.children[3];
    st.items.splice(0, 2);
    flushPending();
    expect(el.children.length).toBe(2);
    expect(el.children[0]).toBe(third);
    expect(el.children[1]).toBe(fourth);
  });

  it('identical key order is a no-op (nodes untouched)', () => {
    const { el, st } = mount([{ id: 1 }, { id: 2 }, { id: 3 }]);
    const before = [el.children[0], el.children[1], el.children[2]];
    st.items = st.items.slice();
    flushPending();
    expect(el.children[0]).toBe(before[0]);
    expect(el.children[1]).toBe(before[1]);
    expect(el.children[2]).toBe(before[2]);
  });

  it('reorder falls back to the general path and reuses nodes by key', () => {
    const { el, st } = mount([{ id: 1 }, { id: 2 }, { id: 3 }]);
    const node1 = el.children[0];
    const node3 = el.children[2];
    st.items = [st.items[2], st.items[1], st.items[0]];
    flushPending();
    expect(el.children.length).toBe(3);
    expect(el.children[0]).toBe(node3); // key 3 now first
    expect(el.children[2]).toBe(node1); // key 1 now last
  });
});
