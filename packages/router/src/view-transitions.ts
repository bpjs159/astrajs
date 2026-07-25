/**
 * @astrajs/router — View Transitions Integration
 *
 * Wraps DOM mutations in the native View Transitions API
 * (`document.startViewTransition`) for smooth animated page
 * transitions between routes.
 *
 * ## How It Works
 *
 * When `viewTransitions: true` (default), every route navigation
 * triggers `document.startViewTransition()`. Inside the callback,
 * only the `<Outlet />` content is swapped — parent layouts and
 * their state remain intact.
 *
 * CSS can target named elements:
 * ```css
 * ::view-transition-old(main-content) { animation: fade-out 0.15s ease; }
 * ::view-transition-new(main-content) { animation: fade-in 0.15s ease; }
 * ```
 *
 * @see https://developer.chrome.com/docs/web-platform/view-transitions
 */

/**
 * Type for the View Transitions API (not yet in all TypeScript DOM libs).
 */
interface ViewTransition {
  ready: Promise<void>;
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition(): void;
}

interface DocumentWithVT extends Document {
  startViewTransition?(updateCallback: () => Promise<void> | void): ViewTransition;
}

/**
 * Whether the browser supports the View Transitions API.
 */
export function supportsViewTransitions(): boolean {
  const doc = document as DocumentWithVT;
  return typeof doc.startViewTransition === 'function';
}

/**
 * Wraps a DOM update in a View Transition if supported.
 *
 * If View Transitions are not available, the callback executes
 * synchronously with no animation.
 *
 * @param update — The function that performs the DOM mutation.
 * @returns A promise that resolves when the transition completes.
 */
export async function startViewTransition(
  update: () => void | Promise<void>
): Promise<void> {
  const doc = document as DocumentWithVT;

  if (!doc.startViewTransition) {
    // Fallback: just run the update immediately
    await update();
    return;
  }

  const transition = doc.startViewTransition(async () => {
    await update();
  });

  // Wait for the transition to finish (or at least be ready)
  try {
    await transition.finished;
  } catch {
    // Transition may be aborted (e.g., new navigation starts)
    // This is expected behavior — the DOM is already updated.
  }
}
