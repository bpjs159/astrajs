/**
 * 06 — Conditional & List Rendering
 *
 * Plain JS expressions — no special directives needed. The compiler
 * auto-wraps reactive expressions with `dynamic()`, so conditionals
 * and .map() just work.
 *
 * Key concepts:
 * - `{show && <div>...</div>}` — conditional rendering with &&
 * - `{items.map(item => <li>{item}</li>)}` — list rendering with .map()
 * - Empty states: `{items.length === 0 && <p>Empty</p>}`
 * - Ternary: `{show ? <A/> : <B/>}`
 *
 * Zero-VDOM: `dynamic()` re-evaluates the expression when tracked
 * stores change, surgically updating only the affected DOM node.
 */
import { component, store } from '@astrajs/core';
import { styles } from './styles.js';

interface Task {
  id: number;
  text: string;
  done: boolean;
}

type Filter = 'all' | 'active' | 'done';

export const ConditionalListsDemo = component(() => {
  const ui = store({
    showDetails: false,
    filter: 'all' as Filter,
    tasks: [
      { id: 1, text: 'Learn AstraJS', done: true },
      { id: 2, text: 'Build a component', done: false },
      { id: 3, text: 'Deploy to production', done: false },
    ] as Task[],
    nextId: 4,
  });

  const filtered = ui.tasks.filter((t: Task) =>
    ui.filter === 'all' ? true :
    ui.filter === 'active' ? !t.done :
    t.done
  );

  const addTask = () => {
    ui.tasks = [...ui.tasks, { id: ui.nextId, text: `Task ${ui.nextId}`, done: false }];
    ui.nextId++;
  };

  const toggleTask = (id: number) => {
    ui.tasks = ui.tasks.map((t: Task) => t.id === id ? { ...t, done: !t.done } : t);
  };

  const removeTask = (id: number) => {
    ui.tasks = ui.tasks.filter((t: Task) => t.id !== id);
  };

  return (
    <div class={styles.card}>
      <h1>Conditional & Lists</h1>
      <p class={styles.subtitle}>Plain JS: <code>{'{show && <div/>}'}</code> · <code>{'.map()'}</code> · <code>{'? :'}</code></p>

      {/* ── Conditional Rendering ─────────────────────────── */}
      <div class={styles.section}>
        <h3>Conditional</h3>
        <button class={styles.btn} onClick={() => ui.showDetails = !ui.showDetails}>
          {ui.showDetails ? 'Hide' : 'Show'} Details
        </button>
        {ui.showDetails && (
          <div class={styles.details}>
            <p>✓ Fine-grained reactivity — only this block updates</p>
            <p>✓ No VDOM diff — O(1) surgical DOM mutation</p>
            <p>✓ Compiler auto-wraps with <code>dynamic()</code></p>
          </div>
        )}
      </div>

      {/* ── List Rendering ────────────────────────────────── */}
      <div class={styles.section}>
        <h3>List ({filtered.length} items)</h3>
        <div class={styles.filters}>
          {(['all', 'active', 'done'] as const).map(f => (
            <button
              class={ui.filter === f ? styles.filterActive : styles.filterBtn}
              onClick={() => ui.filter = f}
            >
              {f}
            </button>
          ))}
          <button class={styles.btnAdd} onClick={addTask}>+ Add</button>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <p class={styles.empty}>No {ui.filter === 'all' ? '' : ui.filter} tasks. Add one!</p>
        )}

        {/* List */}
        <ul class={styles.list}>
          {filtered.map(task => (
            <li class={task.done ? styles.done : styles.item}>
              <span onClick={() => toggleTask(task.id)} style="cursor:pointer;">
                {task.done ? '✅' : '⬜'} {task.text}
              </span>
              <button class={styles.btnDel} onClick={() => removeTask(task.id)}>×</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});
