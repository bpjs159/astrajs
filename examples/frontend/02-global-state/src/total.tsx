/**
 * 02 — Global State · TotalBox Component
 *
 * Reads the shared `appStore` via the derived `total()` function.
 * Re-renders whenever likes, dislikes, or comments change.
 */
import { component } from 'astrajs.dev/core';
import { total } from './store.js';
import { styles } from './styles.js';

export const TotalBox = component(() => {
  return (
    <div class={styles.totalBox}>
      <h3>Total Interactions</h3>
      <div class={styles.value}>{total()}</div>
    </div>
  );
});
