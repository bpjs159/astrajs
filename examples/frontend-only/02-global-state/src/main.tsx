/**
 * 02 � Global State � Likes/Dislikes
 *
 * Pure declarative JSX. One shared store. No innerHTML, no manual effects.
 * component() handles reactivity � compiler optimizes in production.
 *
 * Compiler output (conceptual):
 *   {appStore.likes} ? bindText(tn, () => String(appStore.likes))
 */
import { component } from '@astrajs/core';
import { appStore, total } from './store.js';
import { styles } from './styles.js';

export const LikesDislikes = component(() => {
  return (
    <div class={styles.grid}>
      <div class={styles.card}>
        <h3>?? Likes</h3>
        <div class={styles.value}>{appStore.likes}</div>
        <button class={styles.btnUp} onClick={() => appStore.likes++}>+1 Like</button>
        <button class={styles.btnDown} onClick={() => appStore.likes = Math.max(0, appStore.likes - 1)}>-1 Like</button>
      </div>
      <div class={styles.card}>
        <h3>?? Dislikes</h3>
        <div class={styles.value}>{appStore.dislikes}</div>
        <button class={styles.btnUp} onClick={() => appStore.dislikes++}>+1 Dislike</button>
        <button class={styles.btnDown} onClick={() => appStore.dislikes = Math.max(0, appStore.dislikes - 1)}>-1 Dislike</button>
      </div>
      <div class={styles.card}>
        <h3>?? Comments</h3>
        <div class={styles.value}>{appStore.comments}</div>
        <button class={styles.btnUp} onClick={() => appStore.comments++}>+1 Comment</button>
        <button class={styles.btnDown} onClick={() => appStore.comments = Math.max(0, appStore.comments - 1)}>-1 Comment</button>
      </div>
      <div class={styles.totalBox}>
        <h3>Total Interactions</h3>
        <div class={styles.value}>{total()}</div>
      </div>
    </div>
  );
});
