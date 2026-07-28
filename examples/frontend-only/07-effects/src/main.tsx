/**
 * 07 — Effects & Cleanup · Side Effects with mounted()
 *
 * `mounted(fn)` registers a side effect that runs after the component
 * is attached to the DOM. It auto-tracks reactive dependencies — when
 * any tracked value changes, the cleanup runs and the effect re-executes.
 *
 * The returned function is the **cleanup**: it runs before the next
 * execution AND when the component unmounts. This prevents memory leaks
 * from timers, subscriptions, or event listeners.
 *
 * Key concepts:
 * - `mounted(() => { ...; return () => { /* cleanup */ }; })`
 * - Auto-tracking: only re-runs when accessed stores change
 * - Cleanup runs before re-execution AND on unmount
 * - Perfect for: timers, fetch, WebSocket, IntersectionObserver, etc.
 */
import { component, store, mounted } from '@astrajs/core';
import { styles } from './styles.js';

let timerHandle: ReturnType<typeof setInterval> | null = null;

export const EffectsDemo = component(() => {
  const timerStore = store({ running: false, seconds: 0 });

  mounted(() => {
    if (timerStore.running) {
      timerHandle = setInterval(() => { timerStore.seconds++; }, 1000);
    }
    return () => { if (timerHandle) { clearInterval(timerHandle); timerHandle = null; } };
  });

  const mins = Math.floor(timerStore.seconds / 60);
  const secs = timerStore.seconds % 60;
  const time = String(mins).padStart(2,'0') + ':' + String(secs).padStart(2,'0');

  return (
    <div class={styles.card}>
      <h1>Effects & Cleanup</h1>
      <p class={styles.subtitle}><code>effect(fn)</code> auto-tracks � cleanup runs before re-execution</p>
      <div class={styles.timerDisplay}>
        <div class={styles.time}>{time}</div>
        <div class={timerStore.running ? styles.statusRunning : styles.statusStopped}>{timerStore.running ? 'Running' : 'Stopped'}</div>
      </div>
      <div class={styles.btnRow}>
        <button class={styles.btnStart} onClick={() => timerStore.running = true} disabled={timerStore.running}>Start</button>
        <button class={styles.btnStop} onClick={() => timerStore.running = false} disabled={!timerStore.running}>Stop</button>
        <button class={styles.btnReset} onClick={() => { timerStore.running = false; timerStore.seconds = 0; }}>Reset</button>
      </div>
    </div>
  );
});
