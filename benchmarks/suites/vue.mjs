// Vue — idiomatic reactive array + render fn with keyed v-for rows.
import * as Vue from 'vue';
import { createApp, reactive, h } from 'vue';

export const meta = { name: 'Vue', version: Vue.version };

export default function createVue() {
  const rootEl = () => document.getElementById('app');
  const state = reactive({ rows: [] });

  function render() {
    return h(
      'table',
      null,
      h(
        'tbody',
        null,
        state.rows.map((r) =>
          h(
            'tr',
            { key: r.id },
            h('td', String(r.id)),
            h('td', r.name),
            h('td', r.email),
            h('td', String(r.score)),
          ),
        ),
      ),
    );
  }

  const app = createApp({ render });
  app.mount(rootEl());

  return {
    name: 'Vue',
    version: Vue.version,

    render10k(rows) {
      state.rows = rows;
    },

    updateRow(i, name) {
      state.rows[i].name = name;
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

    rowCount() {
      return rootEl().querySelectorAll('tr').length;
    },

    destroy() {
      app.unmount();
      rootEl().textContent = '';
    },
  };
}
