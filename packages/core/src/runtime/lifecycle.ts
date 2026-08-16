/**
 * @bpjs159/core — Component Lifecycle
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
}

/**
 * Pending mount callbacks, keyed by component wrapper element.
 * Each component instance owns its callbacks — no cross-contamination
 * when a component is created but never connected to the DOM.
 */
const pendingByWrapper = new Map<HTMLElement, LifecycleEntry[]>();

/**
 * The currently executing component wrapper.
 * Set by `component()` before calling `fn(props)`, restored after.
 * `mounted()` registers callbacks against this wrapper.
 */
let _currentWrapper: HTMLElement | null = null;

/** Active cleanup functions, keyed by element. */
const activeCleanups = new Map<HTMLElement, UnmountCallback>();

/** Single shared MutationObserver for detecting element removal. */
let observer: MutationObserver | null = null;

function getObserver(): MutationObserver | null {
  // Guard: MutationObserver is only available in browser environments.
  if (typeof MutationObserver === 'undefined' || typeof document === 'undefined') {
    return null;
  }
  if (!observer) {
    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.removedNodes) {
          if (typeof HTMLElement !== 'undefined' && node instanceof HTMLElement) {
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

// Initialize the observer lazily — only in browser environments.
if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
  getObserver();
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
  if (!_currentWrapper) {
    // No active component wrapper — this is a programming error.
    // mounted() must be called synchronously inside a component() function.
    return;
  }
  let entries = pendingByWrapper.get(_currentWrapper);
  if (!entries) {
    entries = [];
    pendingByWrapper.set(_currentWrapper, entries);
  }
  entries.push({ callback: fn });
}

/**
 * Sets the current component wrapper. Called by `component()` before
 * executing the component function, so `mounted()` calls register
 * against the correct wrapper.
 *
 * Returns the previous wrapper so it can be restored (stack-based).
 */
export function setCurrentWrapper(wrapper: HTMLElement): HTMLElement | null {
  const prev = _currentWrapper;
  _currentWrapper = wrapper;
  return prev;
}

/**
 * Returns whether the given wrapper has pending mount callbacks.
 */
export function hasPendingMountCallbacks(wrapper: HTMLElement): boolean {
  const entries = pendingByWrapper.get(wrapper);
  return entries !== undefined && entries.length > 0;
}

/**
 * Flushes pending mount callbacks for a given wrapper element.
 * Called internally by `component()` after appending to the DOM.
 *
 * Only callbacks registered against this specific wrapper are fired —
 * callbacks from sibling components or from never-connected wrappers
 * are unaffected.
 */
/** Track which wrappers have already fired mount callbacks. */
const _mountedWrappers = new WeakSet<HTMLElement>();

export function flushMountCallbacks(wrapper: HTMLElement): void {
  if (_mountedWrappers.has(wrapper)) return;
  _mountedWrappers.add(wrapper);

  const callbacks = pendingByWrapper.get(wrapper);
  if (!callbacks || callbacks.length === 0) return;
  pendingByWrapper.delete(wrapper);

  // Defer so the wrapper is in the DOM when callbacks fire.
  // In the Zero-VDOM architecture, mount callbacks can safely modify
  // reactive state — each mutation triggers only its specific effects
  // (O(1) surgical DOM updates), not a full component re-render.
  queueMicrotask(() => {
    for (const entry of callbacks) {
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
