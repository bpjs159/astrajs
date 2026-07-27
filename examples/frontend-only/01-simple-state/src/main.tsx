/**
 * 01 — Simple State · Counter
 *
 * Pure declarative JSX. No manual DOM, no innerHTML, no getElementById.
 * component() makes {ui.value} reactive — compiler optimizes in production.
 */
import { component, store } from '@astrajs/core';
import { styles } from './styles.js';

export const Counter = component(() => {
  const ui = store({ value: 0 });
  return (
    <div class={styles.box}>
      <h2>Counter: <strong>{ui.value}</strong></h2>
      <div class={styles.buttons}>
        <button onClick={() => ui.value--}>- 1</button>
        <button onClick={() => ui.value++}>+ 1</button>
      </div>
    </div>
  );
});
