/**
 * @astrajs/router — Tests
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { _resetRoutingDepth, route, fallbackRoute, _nextRenderCycle } from '../route.js';
import { _pathState } from '../path-state.js';

beforeEach(() => {
  _pathState.path = '/';
  _nextRenderCycle();
});

describe('route()', () => {
  it('matches exact root path', () => {
    expect(route('/', { exact: true })).toBe(true);
  });

  it('does not match non-exact root on /dashboard', () => {
    _pathState.path = '/dashboard';
    _nextRenderCycle();
    expect(route('/', { exact: true })).toBe(false);
  });

  it('matches prefix without exact', () => {
    _pathState.path = '/dashboard/bot-alpha';
    _nextRenderCycle();
    expect(route('/dashboard')).toBe(true);
  });

  it('extracts params', () => {
    _pathState.path = '/dashboard/bot-alpha';
    _nextRenderCycle();
    expect(route('/dashboard/:botId')).toBe(true);
  });
});

describe('fallbackRoute()', () => {
  it('false when route matched', () => {
    route('/', { exact: true });
    route('/products');
    expect(fallbackRoute()).toBe(false);
  });

  it('true when no route matched', () => {
    _pathState.path = '/nonexistent';
    _nextRenderCycle();
    route('/', { exact: true });
    route('/products');
    expect(fallbackRoute()).toBe(true);
  });
});

