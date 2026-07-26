/**
 * 01 — Simple State · Counter
 *
 * The cleanest way to use AstraJS: store() + JSX + component().
 * No manual effects. No VDOM. TypeScript infers all types.
 */

import { component, store } from '@astrajs/core';
import { styles } from './styles.js';

export const Counter = component(() => {
  const ui = store({ value: 0 });

  return (
    <div class={styles.box}>
      <h2>Counter: <strong>{ui.value}</strong></h2>
      <div class={styles.buttons}>
        <button onClick={() => ui.value--}>− 1</button>
        <button onClick={() => ui.value++}>+ 1</button>
      </div>
    </div>
  );
});

