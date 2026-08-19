/**
 * 06 — Conditional & List Rendering
 *
 * Arrow functions for handlers — the compiler auto-wraps reactive JSX 
 * expressions, not handler functions. Plain JS operators — no special 
 * directives needed. The compiler
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
import { component, store } from 'astrajs.dev/core';
import { styles } from './styles.js';

interface Task {
  id: number;
  text: string;
  done: boolean;
}

type Filter = 'all' | 'active' | 'done';

// ─── Section Label Component ──────────────────────────────────────────────

const SectionLabel = component((props: { icon: string; label: string; code: string }) => (
  <div class={styles.sectionLabel}>
    <span class={styles.sectionIcon}>{props.icon}</span>
    <div>
      <span class={styles.sectionTitle}>{props.label}</span>
      <code class={styles.sectionCode}>{props.code}</code>
    </div>
  </div>
));

// ─── Main Demo ────────────────────────────────────────────────────────────

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

  const filterTasks = (tasks: Task[], filter: Filter): Task[] =>
    tasks.filter((t: Task) =>
      filter === 'all' ? true :
      filter === 'active' ? !t.done :
      t.done
    );

  const addTask = () => {
    const labels = ['Write tests', 'Review PR', 'Update docs', 'Fix bug', 'Refactor', 'Add feature'];
    const label = labels[ui.nextId % labels.length]!;
    ui.tasks = [...ui.tasks, { id: ui.nextId, text: label, done: false }];
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
      {/* ── Header ─────────────────────────────────── */}
      <div class={styles.header}>
        <h1>Conditional &amp; Lists</h1>
        <p><code>{'{show && <div/>}'}</code> · <code>.map()</code> · <code>? :</code> — plain JavaScript, no directives</p>
      </div>

      <div class={styles.body}>
        {/* ── Section 1: Conditional Rendering ─────── */}
        <SectionLabel icon="🔀" label="Conditional Rendering" code="show && <El />  ·  ? :" />
        <div class={styles.sectionBox}>
          <p class={styles.desc}>Use plain JS operators — <strong>no <code>v-if</code>, no <code>ngIf</code>, no special syntax</strong>. The compiler auto-wraps reactive expressions with <code>dynamic()</code> so the DOM updates surgically.</p>

          <div class={styles.condDemo}>
            <button class={styles.btnPrimary} onClick={() => ui.showDetails = !ui.showDetails}>
              {ui.showDetails ? '🙈 Hide' : '👀 Show'} Details
            </button>
            <span class={styles.condHint}>
              {ui.showDetails ? 'Ternary: showDetails ? <Hide/> : <Show/>' : 'Click to toggle — O(1) DOM update, no re-render'}
            </span>
          </div>

          {ui.showDetails && (
            <div class={styles.detailsBox}>
              <div class={styles.detailItem}>
                <span class={styles.detailCheck}>✓</span>
                <span>Fine-grained reactivity — <strong>only this block</strong> is inserted into the DOM</span>
              </div>
              <div class={styles.detailItem}>
                <span class={styles.detailCheck}>✓</span>
                <span>No VDOM diff — <strong>O(1)</strong> surgical DOM mutation via <code>dynamic()</code></span>
              </div>
              <div class={styles.detailItem}>
                <span class={styles.detailCheck}>✓</span>
                <span>Compiler auto-wraps reactive expressions — <strong>zero boilerplate</strong></span>
              </div>
            </div>
          )}

          <div class={styles.codeSnippet}>
            <code><span class={styles.kw}>{'{'}</span>showDetails && <span class={styles.kw}>&lt;</span><span class={styles.tag}>div</span><span class={styles.kw}>&gt;</span>...<span class={styles.kw}>&lt;/</span><span class={styles.tag}>div</span><span class={styles.kw}>&gt;{'}'}</span></code>
          </div>
        </div>

        {/* ── Section 2: List Rendering ────────────── */}
        <SectionLabel icon="📋" label="List Rendering" code=".map()  ·  .filter()  ·  empty states" />
        <div class={styles.sectionBox}>
          <p class={styles.desc}>Plain JavaScript <code>.map()</code> and <code>.filter()</code> — <strong>no <code>v-for</code>, no <code>*ngFor</code>, no <code>key</code> prop needed</strong>. The compiler handles reactive list reconciliation automatically.</p>

          {/* ── Toolbar ────────────────────────────── */}
          <div class={styles.toolbar}>
            <div class={styles.filterGroup}>
              <button
                class={ui.filter === 'all' ? styles.filterActive : styles.filterBtn}
                onClick={() => ui.filter = 'all'}
              >
                All <span class={ui.filter === 'all' ? styles.countActive : styles.count}>{ui.tasks.length}</span>
              </button>
              <button
                class={ui.filter === 'active' ? styles.filterActive : styles.filterBtn}
                onClick={() => ui.filter = 'active'}
              >
                Active <span class={ui.filter === 'active' ? styles.countActive : styles.count}>{ui.tasks.filter((t: Task) => !t.done).length}</span>
              </button>
              <button
                class={ui.filter === 'done' ? styles.filterActive : styles.filterBtn}
                onClick={() => ui.filter = 'done'}
              >
                Done <span class={ui.filter === 'done' ? styles.countActive : styles.count}>{ui.tasks.filter((t: Task) => t.done).length}</span>
              </button>
            </div>
            <button class={styles.btnAdd} onClick={addTask}>+ Add task</button>
          </div>

          {/* ── Empty State ────────────────────────── */}
          {filterTasks(ui.tasks, ui.filter).length === 0 && (
            <div class={styles.emptyBox}>
              <span class={styles.emptyIcon}>📭</span>
              <p>No {ui.filter === 'all' ? '' : ui.filter} tasks yet.</p>
              <button class={styles.btnPrimarySm} onClick={addTask}>Create one →</button>
            </div>
          )}

          {/* ── Task List ──────────────────────────── */}
          {filterTasks(ui.tasks, ui.filter).length > 0 && (
            <div>
              <div class={styles.taskList}>
                {filterTasks(ui.tasks, ui.filter).map(task => (
                  <div class={`${styles.taskRow} ${task.done ? styles.taskDone : ''}`}>
                    <button
                      class={task.done ? styles.checkboxDone : styles.checkbox}
                      onClick={() => toggleTask(task.id)}
                      aria-label={task.done ? 'Mark undone' : 'Mark done'}
                    >
                      {task.done ? '✓' : ''}
                    </button>
                    <span class={task.done ? styles.taskTextDone : styles.taskText}>{task.text}</span>
                    <span class={styles.taskId}>#{task.id}</span>
                    <button class={styles.btnDel} onClick={() => removeTask(task.id)} aria-label="Delete task">×</button>
                  </div>
                ))}
              </div>
              <div class={styles.listFooter}>
                <span><strong>{ui.tasks.filter((t: Task) => t.done).length}</strong> of <strong>{ui.tasks.length}</strong> completed</span>
                {ui.tasks.filter((t: Task) => t.done).length > 0 && (
                  <div class={styles.progressBar}>
                    <div class={styles.progressFill} style={`width:${Math.round((ui.tasks.filter((t: Task) => t.done).length / Math.max(1, ui.tasks.length)) * 100)}%`} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
