/**
 * @bpjs159/router — Reactive path state
 *
 * Shared reactive store so route() calls inside component()
 * re-evaluate when navigate() changes the path.
 */
import { store } from '@bpjs159/core';

export const _pathState = store({ path: '/' });

if (typeof window !== 'undefined') {
  _pathState.path = window.location.pathname || '/';
}
