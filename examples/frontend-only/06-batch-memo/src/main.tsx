import { component, store, batch, memo } from '@astrajs/core';
import { styles as s } from './styles.js';

export const BatchMemoDemo = component(() => {
  const st = store({ x: 0, y: 0 });
  const sum = memo(() => st.x + st.y);
  const product = memo(() => st.x * st.y);

  return (
    <div class={s.card}>
      <h1>Batch & Memo</h1>
      <p class={s.subtitle}><code>batch()</code> = 1 notification · <code>memo()</code> = lazy derived value</p>
      <div class={s.grid2}>
        <div class={s.panel}>
          <h3>State</h3>
          <div class={s.val}>x = {st.x}</div>
          <div class={s.val} style="color:#a78bfa;">y = {st.y}</div>
          <button class={s.btnUp} onClick={() => st.x++}>x++</button>
          <button class={s.btnUp} onClick={() => st.y++}>y++</button>
          <button class={s.btnBatch} onClick={() => batch(() => { st.x++; st.y++; })}>batch(x++, y++)</button>
        </div>
        <div class={s.panel}>
          <h3>Memo</h3>
          <div class={s.val}>sum = {sum()}</div>
          <div class={s.val} style="color:#a78bfa;">product = {product()}</div>
        </div>
      </div>
    </div>
  );
});
