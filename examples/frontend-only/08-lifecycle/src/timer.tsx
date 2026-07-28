/**
 * Timer — generic count-up component.
 * Uses mounted() to start an interval and cleans it up on unmount.
 *
 * Events (onMount / onUnmount / onTick) are for **non-reactive** side
 * effects only: logging, analytics, external APIs. Never modify the
 * parent's reactive store from these callbacks — that causes cascading
 * re-renders because AstraJS recreates children on every parent render.
 */
import { component, store, mounted } from '@astrajs/core';

export interface TimerEvents {
  /** Non-reactive side effect: fires when the Timer enters the DOM. */
  onMount?: () => void;
  /** Non-reactive side effect: fires when the Timer leaves the DOM. */
  onUnmount?: () => void;
  /** Non-reactive side effect: fires every second with the current tick. */
  onTick?: (seconds: number) => void;
}

export const Timer = component((props: TimerEvents) => {
  const st = store({ seconds: 0 });

  mounted(() => {
    props.onMount?.();
    const id = setInterval(() => {
      st.seconds++;
      props.onTick?.(st.seconds);
    }, 1000);
    return () => {
      clearInterval(id);
      props.onUnmount?.();
    };
  });

  return (
    <div>
      <div class="timer">
        {String(Math.floor(st.seconds / 60)).padStart(2, '0')}:
        {String(st.seconds % 60).padStart(2, '0')}
      </div>
      <p style="color:#64748b;font-size:.8rem;">mounted() started the interval — unmount cleans it up</p>
    </div>
  );
});
