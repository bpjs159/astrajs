/**
 * astrajs.dev/router — route() + fallbackRoute()
 *
 * Declarative routing primitives. No wrapper components needed.
 *
 * ```tsx
 * {route('/', { exact: true }) && <Home />}
 * {route('/dashboard/:botId') && <Dashboard />}
 * {route('configuracion') && <Config />}  // relative to parent context
 * {fallbackRoute() && <h1>404</h1>}
 * ```
 */

import { params } from './params.js';
import { getCurrentPath } from './navigate.js';
import { setBindingUpdate } from 'astrajs.dev/core';

// ─── Route matching state ────────────────────────────────────────────────────

/** Tracks which routes exist at each call depth for fallbackRoute(). */
interface DepthState {
  routes: Set<string>;
  anyMatched: boolean;
}

const _depthStack: DepthState[] = [];
let _currentDepth = 0;
let _lastRenderCycle = -1;
let _renderCycle = 0;

/** Increment render cycle (called by navigate / popstate). */
export function _nextRenderCycle(): void {
  _renderCycle++;
}

export function _resetRoutingDepth(): void {
  _currentDepth = 0;
  _depthStack.length = 0;
  _lastRenderCycle = _renderCycle;
}

// ─── route() ─────────────────────────────────────────────────────────────────

export interface RouteOptions {
  /** If true, the path must match exactly (no prefix matching). */
  exact?: boolean;
}

/**
 * Reactive route matcher. Returns `true` if the current URL matches
 * the given path pattern. Supports `:param` segments.
 *
 * When a match is found, `params` is updated with the extracted values.
 *
 * @param pattern — Absolute (`/path`) or relative (`path`) route pattern.
 * @param options — `{ exact?: boolean }`
 */
export function route(pattern: string, options?: RouteOptions): boolean {
  if (_lastRenderCycle !== _renderCycle) {
    _resetRoutingDepth();
  }
  const depth = _currentDepth++;
  _ensureDepth(depth);

  const path = getCurrentPath();
  const resolvedPattern = _resolvePattern(pattern, depth);
  const match = _matchPattern(path, resolvedPattern, options?.exact ?? false);

  // Register this route at its depth for fallbackRoute()
  const state = _depthStack[depth]!;
  state.routes.add(resolvedPattern);
  if (match) {
    state.anyMatched = true;
    // Update global params (only if there are actual params to set)
    if (match.params && Object.keys(match.params).length > 0) {
      setBindingUpdate(true);
      const raw = (params as unknown as Record<string, unknown>);
      for (const key of Object.keys(raw)) delete raw[key];
      Object.assign(raw, match.params);
      setBindingUpdate(false);
    } else if (match.params) {
      // Matched a static route — clear any previous params
      setBindingUpdate(true);
      const raw = (params as unknown as Record<string, unknown>);
      for (const key of Object.keys(raw)) delete raw[key];
      setBindingUpdate(false);
    }
  }

  return match !== null;
}

// ─── fallbackRoute() ─────────────────────────────────────────────────────────

/**
 * Returns `true` if no `route()` call at the SAME depth level matched.
 * Used for 404 / "not found" fallbacks.
 *
 * ```tsx
 * {route('/a') && <A />}
 * {route('/b') && <B />}
 * {fallbackRoute() && <NotFound />}
 * ```
 */
export function fallbackRoute(): boolean {
  // Check all depths: return true only if NO route matched at any depth
  if (_depthStack.length === 0) return false;
  return _depthStack.every(s => s.routes.size === 0 || !s.anyMatched);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function _ensureDepth(depth: number): void {
  while (_depthStack.length <= depth) {
    _depthStack.push({ routes: new Set(), anyMatched: false });
  }
}

/**
 * Resolves a pattern to absolute form. Relative patterns are
 * resolved against the parent context (injected by AST).
 * For now, relative means the pattern without leading /.
 */
function _resolvePattern(pattern: string, _depth: number): string {
  if (pattern.startsWith('/')) return pattern;

  const current = getCurrentPath().replace(/\/$/, '');

  // Single :param replaces the last URL segment.
  // e.g., from /users/40, route(':id') → /users/:id
  //       from /users,    route(':id') → /users/:id
  if (/^:\w+$/.test(pattern)) {
    const parent = current.split('/').slice(0, -1).join('/');
    const base = parent === '' ? current : parent;
    return base + '/' + pattern;
  }

  // Regular relative: append to full current path
  return current + '/' + pattern;
}

// ─── Pattern matching ────────────────────────────────────────────────────────

interface MatchResult {
  params: Record<string, string> | null;
}

const _regexCache = new Map<string, RegExp>();

function _matchPattern(path: string, pattern: string, exact: boolean): MatchResult | null {
  const regex = _compilePattern(pattern, exact);
  const m = regex.exec(path);
  if (!m) return null;

  // Extract named params from regex groups
  const params: Record<string, string> = {};
  // Our regex produces named groups via manual tracking
  const paramNames = _getParamNames(pattern);
  for (let i = 0; i < paramNames.length; i++) {
    (params as unknown as Record<string, string>)[paramNames[i]!] = m[i + 1]!;
  }

  return { params };
}

function _compilePattern(pattern: string, exact: boolean): RegExp {
  const cacheKey = pattern + '|' + (exact ? '1' : '0');
  const cached = _regexCache.get(cacheKey);
  if (cached) return cached;

  const segments = pattern.split('/').filter(Boolean);
  let regexStr = '^';

  for (const seg of segments) {
    regexStr += '/';
    if (seg.startsWith(':')) {
      regexStr += '([^/]+)';
    } else {
      regexStr += _escapeRegex(seg);
    }
  }

  if (regexStr === '^') regexStr += '/?';
  if (exact) regexStr += '$';
  else regexStr += '(?:/|$)';

  const regex = new RegExp(regexStr);
  _regexCache.set(cacheKey, regex);
  return regex;
}

function _getParamNames(pattern: string): string[] {
  return pattern.split('/').filter(s => s.startsWith(':')).map(s => s.slice(1));
}

function _escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
