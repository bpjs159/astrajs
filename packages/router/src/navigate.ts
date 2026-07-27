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
  if (resolved === _pathState.path) return;

  _nextRenderCycle();
  _pathState.path = resolved;
  window.history.pushState(null, '', resolved);
  _onNavigation(resolved);
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
  });
}
