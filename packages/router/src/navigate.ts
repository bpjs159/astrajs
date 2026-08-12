/**
 * @astrajs/router — navigate() + history management
 */
import { _onNavigation } from './listener.js';
import { _pathState } from './path-state.js';
import { _nextRenderCycle } from './route.js';

export function getCurrentPath(): string {
  return _pathState.path;
}

export function navigate(to: string): void {
  if (typeof window === 'undefined') return;

  const resolved = _resolvePath(to);

  // Separate path from hash fragment — route matching operates on the
  // path only, while the full URL (with hash) is pushed to history so
  // that in-page anchor navigation (e.g. /docs#instalacion) works.
  const hashIndex = resolved.indexOf('#');
  const pathOnly = hashIndex >= 0 ? resolved.slice(0, hashIndex) : resolved;
  const hash = hashIndex >= 0 ? resolved.slice(hashIndex) : '';

  if (pathOnly === _pathState.path && !hash) return;

  _nextRenderCycle();
  _pathState.path = pathOnly;
  window.history.pushState(null, '', pathOnly + hash);
  _onNavigation(pathOnly);

  // Scroll to hash anchor after navigation
  if (hash) {
    const id = hash.slice(1);
    if (id) {
      // Defer scrolling until after the DOM has updated from the route change
      queueMicrotask(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }
}

function _resolvePath(to: string): string {
  if (to.startsWith('/')) return to;
  if (to === '..') {
    const parts = getCurrentPath().split('/').filter(Boolean);
    parts.pop();
    return '/' + parts.join('/') || '/';
  }
  const base = getCurrentPath().replace(/\/$/, '');
  return base + '/' + to;
}

// ─── Browser back/forward ──────────────────────────────────────────

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    const path = window.location.pathname || '/';
    _nextRenderCycle();
    _pathState.path = path;
    _onNavigation(path);

    // Restore hash scroll on back/forward (e.g. /docs#instalacion)
    const id = window.location.hash?.slice(1);
    if (id) {
      queueMicrotask(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  });

  // ─── Deep-link support: initial load with a #hash ────────────────
  // e.g. opening astrajs.dev/docs/introduction#instalacion directly.
  const initialHash = window.location.hash?.slice(1);
  if (initialHash) {
    let attempts = 0;
    const scrollToInitialHash = () => {
      const el = document.getElementById(initialHash);
      if (el) {
        el.scrollIntoView({ behavior: 'auto', block: 'start' });
      } else if (attempts++ < 120) {
        // The app may still be mounting — retry for up to ~2s.
        requestAnimationFrame(scrollToInitialHash);
      }
    };
    // Give the router/app time to render the right page first.
    queueMicrotask(() => requestAnimationFrame(scrollToInitialHash));
  }
}
