/**
 * @astrajs/router — Route Matching Engine
 *
 * Converts a URL path into a chain of matched RouteDefinitions (layouts
 * and pages). Supports:
 * - Static segments: `/about`
 * - Dynamic params: `/products/:id`
 * - Catch-all wildcards: `/docs/*`
 * - Nested routes with parent-child matching
 */

import type { RouteDefinition, RouteMatch } from '../index.js';

// ─── Path Pattern Parsing ────────────────────────────────────────────────────

/**
 * A compiled route pattern with parameter extraction logic.
 */
interface CompiledPattern {
  /** Regex to test/match against a path segment. */
  regex: RegExp;
  /** Names of extracted parameters (in order of capture groups). */
  paramNames: string[];
  /** Whether this is a catch-all wildcard (`*`). */
  isWildcard: boolean;
}

/**
 * Compiles a route path pattern into a regex for fast matching.
 *
 * @param pattern — The route path pattern (e.g., `/products/:id/reviews/:reviewId`).
 * @returns A compiled pattern with regex and param names.
 */
function compilePattern(pattern: string): CompiledPattern {
  const paramNames: string[] = [];
  let regexStr = '^';

  // Handle wildcard catch-all
  if (pattern.endsWith('*')) {
    const prefix = pattern.slice(0, -1).replace(/\/$/, '');
    regexStr += escapeRegex(prefix);
    regexStr += '(?:/(.*))?';
    return {
      regex: new RegExp(regexStr + '$'),
      paramNames: ['*'],
      isWildcard: true,
    };
  }

  const segments = pattern.split('/').filter(Boolean);

  for (const segment of segments) {
    regexStr += '/';

    if (segment.startsWith(':')) {
      // Dynamic parameter: `:id`
      paramNames.push(segment.slice(1));
      regexStr += '([^/]+)';
    } else {
      // Static segment
      regexStr += escapeRegex(segment);
    }
  }

  // Handle root path
  if (regexStr === '^') {
    regexStr += '/?';
  }

  return {
    regex: new RegExp(regexStr + '$'),
    paramNames,
    isWildcard: false,
  };
}

/**
 * Escapes special regex characters in a static path segment.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── Route Matching ──────────────────────────────────────────────────────────

/**
 * Internal cache of compiled patterns to avoid recompilation.
 */
const patternCache = new Map<string, CompiledPattern>();

/**
 * Gets (or compiles) the pattern for a route path.
 */
function getPattern(path: string): CompiledPattern {
  let compiled = patternCache.get(path);
  if (!compiled) {
    compiled = compilePattern(path);
    patternCache.set(path, compiled);
  }
  return compiled;
}

/**
 * Matches a URL pathname against a route definition tree and returns
 * the chain of matched routes (from root to deepest child).
 *
 * The matching is recursive: for each route that matches at its level,
 * its children are tested against the remaining path segments.
 *
 * @param pathname — The URL path to match (e.g., `/products/42/reviews/7`).
 * @param routes — The route tree to match against.
 * @param basePath — Accumulated base path for nested matching.
 * @param parentParams — Params accumulated from parent routes.
 * @returns An array of RouteMatch objects (root → deepest), or empty if no match.
 *
 * @example
 * ```ts
 * matchRoutes('/products/42', [
 *   {
 *     path: '/',
 *     children: [
 *       { path: 'products/:id' }
 *     ]
 *   }
 * ]);
 * // → [
 * //   { route: layoutRoute, params: {}, path: '/' },
 * //   { route: productRoute, params: { id: '42' }, path: '/products/42' }
 * // ]
 * ```
 */
export function matchRoutes(
  pathname: string,
  routes: readonly RouteDefinition[],
  basePath: string = '',
  parentParams: Record<string, string> = {}
): RouteMatch[] {
  // Normalize: ensure leading slash and no trailing slash (except root)
  const normalizedPath = pathname === '/' ? '/' : '/' + pathname.replace(/^\/+|\/+$/g, '');

  for (const route of routes) {
    const fullPattern = basePath + (route.path.startsWith('/') ? '' : '/') + route.path;
    const normalizedPattern = fullPattern === '/' ? '/' : '/' + fullPattern.replace(/^\/+|\/+$/g, '');

    const compiled = getPattern(normalizedPattern);
    const match = normalizedPath.match(compiled.regex);

    if (!match) continue;

    // Extract params
    const params: Record<string, string> = { ...parentParams };
    for (let i = 0; i < compiled.paramNames.length; i++) {
      const value = match[i + 1];
      if (value !== undefined) {
        params[compiled.paramNames[i]!] = decodeURIComponent(value);
      }
    }

    const routeMatch: RouteMatch = {
      route,
      params: { ...params },
      path: normalizedPattern,
    };

    // If route has children, try to match deeper
    if (route.children && route.children.length > 0) {
      // The remaining path after this route's match
      const matchedLength = normalizedPattern === '/' ? 1 : normalizedPattern.length;
      const remainingPath = normalizedPath.slice(matchedLength) || '/';

      const childMatches = matchRoutes(
        remainingPath,
        route.children,
        normalizedPattern === '/' ? '' : normalizedPattern,
        params
      );

      if (childMatches.length > 0) {
        return [routeMatch, ...childMatches];
      }
    }

    // If this route has a redirect, the router handles that separately
    return [routeMatch];
  }

  return [];
}

/**
 * Finds a specific route definition by path pattern.
 */
export function findRoute(
  path: string,
  routes: readonly RouteDefinition[]
): RouteDefinition | undefined {
  for (const route of routes) {
    if (route.path === path) return route;
    if (route.children) {
      const found = findRoute(path, route.children);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * Collects all leaf routes (routes without children) for SSG crawling.
 */
export function collectLeafRoutes(
  routes: readonly RouteDefinition[],
  basePath: string = ''
): Array<{ path: string; route: RouteDefinition }> {
  const leaves: Array<{ path: string; route: RouteDefinition }> = [];

  for (const route of routes) {
    const fullPath = basePath + (route.path.startsWith('/') || basePath.endsWith('/') ? '' : '/') + route.path;

    if (route.children && route.children.length > 0) {
      leaves.push(...collectLeafRoutes(route.children, fullPath));
    } else if (!route.redirect) {
      leaves.push({ path: fullPath || '/', route });
    }
  }

  return leaves;
}
