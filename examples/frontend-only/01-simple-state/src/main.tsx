/**
 * 01 — Simple State — Counter
 *
 * Zero-VDOM: component() runs once. The compiler auto-wraps {ui.value}
 * with dynamic() — you write plain JSX, the AST transform handles the rest.
 * Each reactive expression gets its own O(1) micro-effect.
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
