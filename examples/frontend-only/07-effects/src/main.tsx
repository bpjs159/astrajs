import { component, store, mounted } from '@astrajs/core';
import { styles as s } from './styles.js';

let timerHandle: ReturnType<typeof setInterval> | null = null;

export const EffectsDemo = component(() => {
  const st = store({ running: false, seconds: 0 });

  mounted(() => {
    if (st.running) {
      timerHandle = setInterval(() => { st.seconds++; }, 1000);
    }
    return () => { if (timerHandle) { clearInterval(timerHandle); timerHandle = null; } };
  });

  const mins = Math.floor(st.seconds / 60);
  const secs = st.seconds % 60;
  const time = String(mins).padStart(2,'0') + ':' + String(secs).padStart(2,'0');

  return (
    <div class={s.card}>
      <h1>Effects & Cleanup</h1>
      <p class={s.subtitle}><code>effect(fn)</code> auto-tracks � cleanup runs before re-execution</p>
      <div class={s.timerDisplay}>
        <div class={s.time}>{time}</div>
        <div class={st.running ? s.statusRunning : s.statusStopped}>{st.running ? 'Running' : 'Stopped'}</div>
      </div>
      <div class={s.btnRow}>
        <button class={s.btnStart} onClick={() => st.running = true} disabled={st.running}>Start</button>
        <button class={s.btnStop} onClick={() => st.running = false} disabled={!st.running}>Stop</button>
        <button class={s.btnReset} onClick={() => { st.running = false; st.seconds = 0; }}>Reset</button>
      </div>
    </div>
  );
});
