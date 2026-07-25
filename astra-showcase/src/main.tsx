/**
 * AstraStore — Main Entry Point
 *
 * This is the first file executed by the browser.
 *
 * During SSR: `renderToString()` executes this file, renders the
 * component tree to HTML, serializes state into `astra-data`, and
 * sends the HTML to the client.
 *
 * During CSR: The browser downloads this module, calls `resume()` to
 * pick up server-rendered state, and the app becomes interactive
 * without re-executing any component.
 */

import { resume } from '@astrajs/ssr';
import { App } from './app.js';

/**
 * Bootstrap the application.
 *
 * If the HTML contains server-rendered content (`[astra-data]` attributes),
 * `resume()` deserializes state and attaches event listeners. Otherwise,
 * the app mounts fresh (pure CSR mode).
 */
function bootstrap(): void {
  const root = document.getElementById('root');

  if (!root) {
    console.error('[AstraStore] Root element #root not found');
    return;
  }

  // Check if this is a resume (SSR) or fresh mount (CSR)
  const hasServerData = root.querySelector('[astra-data]') !== null;

  if (hasServerData) {
    // Resume from server-rendered HTML
    // State is deserialized from `astra-data` attributes
    // Event listeners are attached via delegation
    resume(root);
    console.log('[AstraStore] ⚡ Resumed from SSR — no hydration needed');
  } else {
    // Fresh client-side render
    const app = App({});
    root.appendChild(app);
    console.log('[AstraStore] ⚡ Mounted fresh (CSR mode)');
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
