/**
 * @astrajs/core — Component Lifecycle
 *
 * `mounted(fn)` registers a callback that fires when the component's
 * root element is inserted into the live DOM. The callback can return
 * a cleanup function that fires when the element is removed.
 *
 * In the Zero-VDOM architecture, store mutations during lifecycle
 * callbacks are safe — each mutation triggers only its specific
 * subscribed effects (O(1) surgical DOM updates), never a full
 * component re-render.
 */

// ─── Global State ────────────────────────────────────────────────────────────

type MountCallback = () => void | (() => void);
type UnmountCallback = () => void;

interface LifecycleEntry {
  callback: MountCallback;
  /** The component wrapper element this is bound to. */
  element: HTMLElement | null;
}

/** Pending callbacks waiting for DOM attachment. */
let pendingCallbacks: LifecycleEntry[] = [];

/** Active cleanup functions, keyed by element (via data attribute index). */
const activeCleanups = new Map<HTMLElement, UnmountCallback>();

/** Single shared MutationObserver for detecting element removal. */
let observer: MutationObserver | null = null;

function getObserver(): MutationObserver {
  if (!observer) {
    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.removedNodes) {
          if (node instanceof HTMLElement) {
            // Run cleanup for the removed element
            const cleanup = activeCleanups.get(node);
            if (cleanup) {
              cleanup();
              activeCleanups.delete(node);
            }
            // Also check descendants
            node.querySelectorAll('[data-astra-lifecycle]').forEach((el) => {
              const c = activeCleanups.get(el as HTMLElement);
              if (c) {
                c();
                activeCleanups.delete(el as HTMLElement);
              }
            });
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  return observer;
}

// Initialize the observer eagerly so DOM removals are always detected.
getObserver();

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Registers a callback to run when the current component's root element
 * is inserted into the live DOM (mounted).
 *
 * The callback can return a cleanup function that runs when the element
 * is removed from the DOM (unmounted).
 *
 * Must be called synchronously inside a `component()` function.
 *
 * @param fn — Called on mount. Return a function for unmount cleanup.
 *
 * @example
 * ```ts
 * const Timer = component(() => {
 *   const st = store({ seconds: 0 });
 *
 *   mounted(() => {
 *     const id = setInterval(() => st.seconds++, 1000);
 *     return () => clearInterval(id); // cleanup on unmount
 *   });
 *
 *   return <div>Seconds: {st.seconds}</div>;
 * });
 * ```
 */
export function mounted(fn: MountCallback): void {
  pendingCallbacks.push({ callback: fn, element: null });
}

/**
 * Flushes pending mount callbacks for a given wrapper element.
 * Called internally by `component()` after appending to the DOM.
 *
 * @param wrapper — The component's root wrapper element.
 */
/** Track which wrappers have already fired mount callbacks. */
const _mountedWrappers = new WeakSet<HTMLElement>();

export function flushMountCallbacks(wrapper: HTMLElement): void {
  if (_mountedWrappers.has(wrapper)) {
    pendingCallbacks = [];
    return;
  }
  _mountedWrappers.add(wrapper);

  const callbacks = pendingCallbacks;
  pendingCallbacks = [];

  // Defer so the wrapper is in the DOM when callbacks fire.
  // In the Zero-VDOM architecture, mount callbacks can safely modify
  // reactive state — each mutation triggers only its specific effects
  // (O(1) surgical DOM updates), not a full component re-render.
  queueMicrotask(() => {
    for (const entry of callbacks) {
      entry.element = wrapper;
      const cleanup = entry.callback();
      if (typeof cleanup === 'function') {
        wrapper.setAttribute('data-astra-lifecycle', '');
        activeCleanups.set(wrapper, cleanup);
      }
    }
  });
}

/**
 * Runs cleanup for a specific element immediately (synchronous unmount).
 * Called by the Router's `<Outlet />` before removing old content.
 *
 * @param element — The root element being removed.
 */
export function triggerUnmount(element: HTMLElement): void {
  const cleanup = activeCleanups.get(element);
  if (cleanup) {
    cleanup();
    activeCleanups.delete(element);
    element.removeAttribute('data-astra-lifecycle');
  }
  // Also trigger for any descendants with lifecycle markers
  element.querySelectorAll('[data-astra-lifecycle]').forEach((el) => {
    const c = activeCleanups.get(el as HTMLElement);
    if (c) {
      c();
      activeCleanups.delete(el as HTMLElement);
    }
  });
}

/**
 * Returns whether there are pending mount callbacks.
 * Used internally by `component()` to decide whether to flush.
 */
export function hasPendingMountCallbacks(): boolean {
  return pendingCallbacks.length > 0;
}
