/**
 * astrajs.dev/ssr — State Serialization (Resumability)
 *
 * AstraJS achieves resumability by serializing reactive state into
 * HTML attributes (`astra-data`) and event handlers into delegated
 * attributes (`astra-on:*`). The client picks up exactly where the
 * server left off — without re-executing components (no hydration).
 *
 * ## How It Works
 *
 * ### Server (SSR)
 * 1. Render component tree to HTML string.
 * 2. Walk the rendered DOM for reactive stores.
 * 3. Serialize each store's state to JSON.
 * 4. Embed serialized state as `astra-data` attributes.
 * 5. Replace event handlers with `astra-on:click` markers.
 *
 * ### Client (Resume)
 * 1. Parse the pre-rendered HTML.
 * 2. Find all `[astra-data]` elements.
 * 3. Deserialize state back into reactive proxies.
 * 4. Register delegated event listeners for `astra-on:*` attributes.
 * 5. The app is interactive — no component re-execution needed.
 */

import { store, toRaw } from 'astrajs.dev/core';
import { getHandlerRegistry } from 'astrajs.dev/core';
import type { StoreOptions } from 'astrajs.dev/core';

// ─── Forward declarations for form resumability ──────────────────────────────
// These are lazily imported to avoid circular dependencies.
let _formResume: ((root: ParentNode) => void) | null = null;

/** Handler names installed on `window` BY bootstrap() — never overwrite
 * pre-existing window properties (fetch, alert, …). */
const installedWindowHandlers = new Set<string>();

/**
 * Registers a form resume handler. Called by astrajs.dev/form to enable
 * SSR-resumable forms without creating a circular dependency.
 *
 * @internal
 */
export function registerFormResumeHandler(fn: (root: ParentNode) => void): void {
  _formResume = fn;
}

// ─── Serialization ───────────────────────────────────────────────────────────

/**
 * Serializes a reactive store to a JSON string suitable for embedding
 * in HTML as an `astra-data` attribute value.
 *
 * The serialization unwraps the Proxy (via `toRaw`) to get the plain
 * data, then JSON-stringifies it. Special values like `Date`, `undefined`,
 * and circular references are handled gracefully.
 *
 * @param state — The reactive store object (or any plain object).
 * @returns A JSON string ready for HTML attribute embedding.
 *
 * @example
 * ```ts
 * const state = store({ count: 0, user: { name: 'Alice' } });
 * const serialized = serializeState(state);
 * // → '{"count":0,"user":{"name":"Alice"}}'
 * ```
 */
export function serializeState(state: object): string {
  try {
    // Unwrap proxy to get raw data
    const raw = toRaw(state);

    return JSON.stringify(raw, (_key, value) => {
      // Handle Date objects
      if (value instanceof Date) {
        return { __astra_type: 'Date', value: value.toISOString() };
      }
      // Handle undefined (convert to null for JSON compatibility)
      if (value === undefined) {
        return null;
      }
      return value;
    });
  } catch (err) {
    console.error('[AstraJS SSR] Failed to serialize state:', err);
    return '{}';
  }
}

/**
 * Deserializes a state string (from `astra-data` attribute) back into
 * a reactive store.
 *
 * The returned object is wrapped in an ES6 Proxy so that mutations
 * trigger reactive DOM updates — just like a store created with `store()`.
 *
 * @typeParam T — The expected shape of the deserialized state.
 * @param json — The serialized state string from the HTML attribute.
 * @param options — Optional store configuration (key for caching).
 * @returns A reactive proxy over the deserialized state.
 *
 * @example
 * ```ts
 * const el = document.querySelector('[astra-data]');
 * const raw = el.getAttribute('astra-data');
 * const state = deserializeState<{ count: number }>(raw);
 * state.count++; // Triggers reactive updates
 * ```
 */
export function deserializeState<T extends object>(
  json: string,
  options?: StoreOptions
): T {
  try {
    const raw = JSON.parse(json, (_key, value) => {
      // Revive Date objects
      if (
        value !== null &&
        typeof value === 'object' &&
        value.__astra_type === 'Date'
      ) {
        return new Date(value.value);
      }
      return value;
    });

    return store(raw as T, options);
  } catch (err) {
    console.error('[AstraJS SSR] Failed to deserialize state:', err);
    return store({} as T, options);
  }
}

// ─── HTML Attribute Generation ───────────────────────────────────────────────

/**
 * Generates an `astra-data` HTML attribute string from a store.
 *
 * @param state — The reactive store to embed.
 * @returns An attribute string like `astra-data="{&quot;count&quot;:0}"`.
 */
export function astraDataAttr(state: object): string {
  const json = serializeState(state);
  // Escape for HTML attribute (double-quote context)
  const escaped = json
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return ` astra-data="${escaped}"`;
}

// ─── Client-Side Resume ──────────────────────────────────────────────────────

/**
 * Resumes the application from server-rendered HTML.
 *
 * Finds all elements with `astra-data` attributes in the given root,
 * deserializes their state into reactive stores, and registers
 * delegated event listeners for `astra-on:*` attributes.
 *
 * @param root — The root element to scan (default: `document`).
 * @returns A Map of element → deserialized store.
 *
 * @example
 * ```ts
 * import { resume } from 'astrajs.dev/ssr';
 *
 * // Client entry point
 * const stores = resume();
 * // App is now interactive — no component re-execution
 * ```
 */
export function resume(root: ParentNode = document): Map<Element, object> {
  const stores = new Map<Element, object>();

  // Find all elements with astra-data
  const elements = root.querySelectorAll('[astra-data]');

  for (const el of elements) {
    const raw = el.getAttribute('astra-data');
    if (!raw) continue;

    const state = deserializeState(raw, {
      key: el.getAttribute('astra-key') ?? undefined,
    });

    stores.set(el, state);

    // Clean up attribute (optional — keep for debugging)
    // el.removeAttribute('astra-data');
  }

  // Register delegated event handlers for astra-on:*
  registerDelegatedEvents(root);

  // Resume form controllers — restores validation state from SSR
  if (_formResume) {
    _formResume(root);
  }

  return stores;
}

// ─── Bootstrap (Auto-Resume) ─────────────────────────────────────────────────

/**
 * Bootstraps an AstraJS application — automatically detects whether the
 * page was server-rendered (SSR with `[astra-data]` markers) or needs a
 * fresh client-side mount (CSR), and handles the correct path.
 *
 * ## SSR mode (resumability)
 *
 * When `[astra-data]` elements are present in the DOM:
 * 1. Calls `resume()` — deserializes state from `astra-data` attributes
 * 2. Installs registered handlers onto `window` so the delegated
 *    `astra-on:*` event system can find them
 * 3. The component is NEVER executed — zero hydration
 *
 * ## CSR mode (fresh mount)
 *
 * When no `[astra-data]` markers are found:
 * 1. Calls `componentFn()` to render the component fresh
 * 2. Appends the result to the root element
 *
 * @param componentFn — The root component to mount in CSR mode.
 * @param rootSelector — The DOM selector for the mount point (default `#app`).
 *
 * @example
 * ```ts
 * import { bootstrap } from 'astrajs.dev/ssr';
 * import { App } from './app';
 *
 * // Single call — handles both SSR resume and CSR mount transparently
 * bootstrap(App);
 * ```
 */
export function bootstrap(
  componentFn: () => JSX.Element,
  rootSelector = '#app'
): void {
  const root = document.querySelector(rootSelector);
  if (!root) {
    console.error(`[AstraJS] Root element "${rootSelector}" not found`);
    return;
  }

  const hasSSRData = root.querySelector('[astra-data]') !== null;

  if (hasSSRData) {
    // ── SSR: resume from server-rendered HTML ─────────────────────────
    resume(root);

    // Install registered handlers on window for backwards compatibility.
    // SECURITY: never overwrite a pre-existing window property (fetch,
    // alert, setTimeout, …). Track what WE installed so hot re-runs can
    // replace their own handlers.
    const registry = getHandlerRegistry();
    for (const [name, fn] of registry) {
      const win = window as unknown as Record<string, unknown>;
      if (name in win && !installedWindowHandlers.has(name)) {
        console.warn(
          `[AstraJS] Skipping handler "${name}": would overwrite an existing window property.`
        );
        continue;
      }
      win[name] = fn;
      installedWindowHandlers.add(name);
    }

    console.log('[AstraJS] ⚡ Resumed from SSR — no hydration needed');
  } else {
    // ── CSR: fresh client-side mount ─────────────────────────────────
    const node = componentFn();
    // Guard against null/false returns (components may render nothing)
    if (node) {
      root.appendChild(node as Node);
    }
    console.log('[AstraJS] ⚡ Mounted fresh (CSR mode)');
  }
}

// ─── Delegated Event System ──────────────────────────────────────────────────

/**
 * Registers delegated event listeners for `astra-on:*` attributes.
 *
 * Instead of attaching individual listeners to each element (which would
 * require eager hydration), AstraJS uses event delegation on the document
 * root. When an event fires, the handler checks if the target (or any
 * ancestor) has a matching `astra-on:*` attribute.
 *
 * This is the "Just-In-Time" loading model: the handler code referenced
 * by the attribute can be lazy-loaded only when the user actually
 * interacts with the element.
 */
function registerDelegatedEvents(root: ParentNode): void {
  const supportedEvents = [
    'click',
    'submit',
    'input',
    'change',
    'focus',
    'blur',
    'keydown',
    'keyup',
    'mouseenter',
    'mouseleave',
  ];

  for (const eventName of supportedEvents) {
    root.addEventListener(eventName, (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      // Walk up the DOM tree looking for astra-on:<event>
      // Skip non-Element nodes (document, text nodes, etc.) that may
      // appear as event targets (e.g. mouseenter on the document root).
      let el: HTMLElement | null = target;
      while (el) {
        if (typeof el.getAttribute !== 'function') {
          el = el.parentElement;
          continue;
        }
        const handlerRef = el.getAttribute(`astra-on:${eventName}`);
        if (handlerRef) {
          handleDelegatedEvent(event, handlerRef, el);
          return;
        }
        el = el.parentElement;
      }
    });
  }
}

/**
 * Executes a delegated event handler referenced by an `astra-on:*` attribute.
 *
 * The handler reference can be:
 * - A name registered via `registerHandler()` (from `astrajs.dev/core`)
 * - A module path: `"/assets/button.js#handleClick"` → dynamically import
 *
 * @internal — exported for tests.
 */
export function handleDelegatedEvent(
  event: Event,
  handlerRef: string,
  _element: HTMLElement
): void {
  // SECURITY: resolve ONLY against the registered handler registry — never
  // against arbitrary `globalThis` names. The handlerRef value comes from
  // the SSR HTML attribute, so an injected attribute must not be able to
  // call any global function (fetch/eval/alert/…).
  const registered = getHandlerRegistry().get(handlerRef);
  if (registered) {
    registered(event);
    return;
  }

  // Parse module#export format
  const hashIdx = handlerRef.lastIndexOf('#');
  if (hashIdx !== -1) {
    const modulePath = handlerRef.slice(0, hashIdx);
    const exportName = handlerRef.slice(hashIdx + 1);

    // SECURITY: the path comes from the SSR HTML attribute and is therefore
    // untrusted. Allow only same-origin relative asset paths with a safe
    // charset and known extensions — never arbitrary URLs or filesystem-ish
    // paths.
    const safePath = /^\/(?:assets|chunks)\/[A-Za-z0-9_\-./]+\.(?:js|mjs)$/.test(modulePath);
    const safeExport = /^[A-Za-z_$][\w$]*$/.test(exportName);
    if (!safePath || !safeExport) {
      console.warn(
        `[AstraJS] Rejected untrusted handler reference: ${handlerRef}`
      );
      return;
    }

    // Dynamic import for lazy loading (JIT — path comes from SSR HTML attribute).
    // Vite cannot analyze this at build time because modulePath is a runtime variable.
    import(/* @vite-ignore */ modulePath)
      .then((mod: Record<string, unknown>) => {
        const importedFn = mod[exportName];
        if (typeof importedFn === 'function') {
          importedFn(event);
        }
      })
      .catch((err) => {
        console.error(
          `[AstraJS] Failed to load handler: ${handlerRef}`,
          err
        );
      });
    return;
  }

  console.warn(`[AstraJS] No handler found for: ${handlerRef}`);
}
