import { describe, expect, it } from 'vitest';
// probe: which file does the alias resolve to?
import * as srv from '@astrajs/server';

describe('probe', () => {
  it('reports resolved module', () => {
    expect(typeof (srv as Record<string, unknown>).rpcHandler).toBe('function');
    // eslint-disable-next-line no-console
    console.log('probe keys:', Object.keys(srv).slice(0, 5).join(','));
  });
});
