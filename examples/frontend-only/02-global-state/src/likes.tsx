/**
 * 02 — Global State · LikesDislikes Component
 *
 * Reads and mutates the shared `appStore`.
 * Uses `component()` for reactive re-renders.
 */
import { component } from '@astrajs/core';
import { appStore } from './store.js';
import { styles } from './styles.js';

export const LikesDislikes = component(() => {
  return (
    <div class={styles.grid}>
      <div class={styles.card}>
        <h3>👍 Likes</h3>
        <div class={styles.value}>{appStore.likes}</div>
        <button class={styles.btnUp} onClick={() => appStore.likes++}>+1</button>
        <button class={styles.btnDown} onClick={() => appStore.likes = Math.max(0, appStore.likes - 1)}>-1</button>
      </div>

      <div class={styles.card}>
        <h3>👎 Dislikes</h3>
        <div class={styles.value}>{appStore.dislikes}</div>
        <button class={styles.btnUp} onClick={() => appStore.dislikes++}>+1</button>
        <button class={styles.btnDown} onClick={() => appStore.dislikes = Math.max(0, appStore.dislikes - 1)}>-1</button>
      </div>

      <div class={styles.card}>
        <h3>💬 Comments</h3>
        <div class={styles.value}>{appStore.comments}</div>
        <button class={styles.btnUp} onClick={() => appStore.comments++}>+1</button>
        <button class={styles.btnDown} onClick={() => appStore.comments = Math.max(0, appStore.comments - 1)}>-1</button>
      </div>
    </div>
  );
});
