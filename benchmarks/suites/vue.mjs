// Vue — idiomatic reactive array + render fn with keyed v-for rows.
import * as Vue from 'vue';
import { createApp, reactive, h } from 'vue';

export const meta = { name: 'Vue', version: Vue.version };

const BLOCK_ROWS = Array.from({ length: 1000 }, (_, i) => `row ${i}`);

export default function createVue() {
  const rootEl = () => document.getElementById('app');
  const state = reactive({ rows: [], text: '', show: true, cards: [] });

  function render() {
    return h('div', null, [
      state.rows.length
        ? h(
            'table',
            null,
            h(
              'tbody',
              null,
              state.rows.map((r) =>
                h(
                  'tr',
                  {
                    key: r.id,
                    onClick: () => {
                      r.score++;
                    },
                  },
                  h('td', String(r.id)),
                  h('td', r.name),
                  h('td', r.email),
                  h('td', String(r.score)),
                ),
              ),
            ),
          )
        : null,
      h('input', {
        value: state.text,
        onInput: (e) => {
          state.text = e.target.value;
        },
      }),
      h('p', state.text),
      state.show ? h('div', { class: 'blk' }, BLOCK_ROWS.map((x) => h('div', { key: x, class: 'blk-row' }, x))) : null,
      h('div', null, state.cards.map((r) => h('div', { key: r.id, class: 'card' }, [h('button', '+'), h('span', r.name)]))),
    ]);
  }

  const app = createApp({ render });
  app.mount(rootEl());

  return {
    name: meta.name,
    version: meta.version,

    render10k(rows) {
      state.rows = rows;
    },

    updateRow(i, name) {
      state.rows[i].name = name;
    },

    updateAll(k) {
      // In-place mass update through the reactive proxies.
      for (const r of state.rows) r.name = `User ${r.id} · v${k}`;
    },

    append1k(rows) {
      state.rows.push(...rows);
    },

    remove1k() {
      state.rows.splice(0, 1000);
    },

    replaceAll(rows) {
      state.rows = rows;
    },

    mount1k(rows) {
      state.cards = rows;
    },

    unmount10k() {
      state.rows = [];
    },

    // Real DOM click → @click handler → patch.
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
      state.show = !state.show;
    },

    count(sel) {
      return rootEl().querySelectorAll(sel).length;
    },

    destroy() {
      app.unmount();
      rootEl().textContent = '';
    },
  };
}
