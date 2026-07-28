/**
 * 06 — Batch & Memo · Atomic Updates + Lazy Derived Values
 *
 * `batch(fn)` groups multiple store mutations into a single reactive
 * notification. Without batch, three mutations → three re-renders.
 * With batch, three mutations → one re-render.
 *
 * `memo(fn)` creates a lazy derived value that only recalculates
 * when its tracked dependencies change. It's a computed property
 * with automatic dependency tracking and caching.
 *
 * Key concepts:
 * - `batch(() => { batchStore.x++; batchStore.y++; })` → 1 notification, not 2
 * - `memo(() => batchStore.x + batchStore.y)` → recalculates only when x or y changes
 * - Memo values are lazy: no computation until first read
 */
import { component, store, batch, memo } from '@astrajs/core';
import { styles } from './styles.js';

export const BatchMemoDemo = component(() => {
  const batchStore = store({ x: 0, y: 0 });
  const sum = memo(() => batchStore.x + batchStore.y);
  const product = memo(() => batchStore.x * batchStore.y);

  return (
    <div class={styles.card}>
      <h1>Batch & Memo</h1>
      <p class={styles.subtitle}><code>batch()</code> = 1 notification � <code>memo()</code> = lazy derived value</p>
      <div class={styles.grid2}>
        <div class={styles.panel}>
          <h3>State</h3>
          <div class={styles.val}>x = {batchStore.x}</div>
          <div class={styles.val} style="color:#a78bfa;">y = {batchStore.y}</div>
          <button class={styles.btnUp} onClick={() => batchStore.x++}>x++</button>
          <button class={styles.btnUp} onClick={() => batchStore.y++}>y++</button>
          <button class={styles.btnBatch} onClick={() => batch(() => { batchStore.x++; batchStore.y++; })}>batch(x++, y++)</button>
        </div>
        <div class={styles.panel}>
          <h3>Memo</h3>
          <div class={styles.val}>sum = {sum()}</div>
          <div class={styles.val} style="color:#a78bfa;">product = {product()}</div>
        </div>
      </div>
    </div>
  );
});
