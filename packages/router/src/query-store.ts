/**
 * astrajs.dev/router — queryStore()
 *
 * Reactive proxy bidirectionally synced with URL query parameters.
 *
 * ```ts
 * const filtros = queryStore({ estrategia: 'grid', par: 'BTCUSDT' });
 * filtros.estrategia = 'dca'; // URL → ?estrategia=dca&par=BTCUSDT
 * ```
 */

import { store } from 'astrajs.dev/core';
import { onRouteChange } from './listener.js';

export function queryStore<T extends Record<string, string>>(defaults: T): T {
  const initial = _readFromURL(defaults);
  const inner = store({ ...initial }) as unknown as Record<string, string>;

  const _keys = new Set(Object.keys(defaults));

  // Navigation → URL → store
  onRouteChange(() => {
    const fromURL = _readFromURL(defaults);
    for (const key of _keys) {
      const urlVal = fromURL[key];
      if (urlVal !== undefined && inner[key] !== urlVal) inner[key] = urlVal;
    }
  });

  // Proxy to intercept writes and sync store → URL
  return new Proxy(inner, {
    set(target: Record<string, string>, prop: string, value: string): boolean {
      target[prop] = value;
      if (_keys.has(prop)) _syncToURL(target);
      return true;
    },
    get(target, prop) {
      return target[prop as string];
    },
  }) as unknown as T;
}

function _readFromURL<T extends Record<string, string>>(defaults: T): T {
  if (typeof window === 'undefined') return { ...defaults };
  const result = { ...defaults } as Record<string, string>;
  const search = new URLSearchParams(window.location.search);
  for (const key of Object.keys(defaults)) {
    const val = search.get(key);
    if (val !== null) result[key] = val;
  }
  return result as T;
}

function _syncToURL(values: Record<string, string>): void {
  if (typeof window === 'undefined') return;
  const search = new URLSearchParams(window.location.search);
  for (const [key, val] of Object.entries(values)) {
    if (val) search.set(key, val); else search.delete(key);
  }
  const qs = search.toString();
  const newUrl = window.location.pathname + (qs ? '?' + qs : '') + window.location.hash;
  window.history.replaceState(null, '', newUrl);
}
