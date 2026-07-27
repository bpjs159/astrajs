/**
 * @astrajs/core — Component Lifecycle
 *
 * `onMount(fn)` registers a callback that fires when the component's
 * root element is inserted into the live DOM. The callback can return
 * a cleanup function that fires when the element is removed.
 *
 * ## How it works
 *
 * 1. `onMount(fn)` stores `fn` in a global pending queue.
 * 2. The `component()` wrapper, after appending to the DOM, flushes
 *    the queue and registers each callback with the root element.
 * 3. A MutationObserver on the root element detects removal and
 *    runs the cleanup function returned by `fn`.
 * 4. The Router's `<Outlet />` triggers mount/unmount when
 *    swapping route content (appendChild → mount, removeChild → unmount).
 *
 * ## Compiler integration
 *
 * The AST plugin detects `onMount()` calls and emits them as
 * lifecycle registrations bound to the component's root HTMLElement.
 * In production, the compiler inlines the mount/unmount logic directly
 * into the generated `document.createElement` code.
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
 *   onMount(() => {
 *     const id = setInterval(() => st.seconds++, 1000);
 *     return () => clearInterval(id); // cleanup on unmount
 *   });
 *
 *   return <div>Seconds: {st.seconds}</div>;
 * });
 * ```
 */
export function onMount(fn: MountCallback): void {
  pendingCallbacks.push({ callback: fn, element: null });
}

/**
 * Flushes pending mount callbacks for a given wrapper element.
 * Called internally by `component()` after appending to the DOM.
 *
 * @param wrapper — The component's root wrapper element.
 */
export function flushMountCallbacks(wrapper: HTMLElement): void {
  // Start the observer if not already
  getObserver();

  const callbacks = pendingCallbacks;
  pendingCallbacks = [];

  // Defer to next microtask so the element is definitely in the DOM
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
