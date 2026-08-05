import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { autoWrapDynamic } from '../../../../../packages/compiler/src/transformers/jsx.js';
import { transformServerRPC } from '../../../../../packages/compiler/src/transformers/server-rpc.js';

describe('debug autoWrap', () => {
  it('wraps formCtrl', () => {
    const src = readFileSync(
      path.resolve(__dirname, '../main.tsx'), 'utf8'
    );
    const storeRegex = /\b(const|let|var)\s+([\w$]+)(?:\s*:\s*[^=]+)?\s*=\s*(?:store|swr|form|serverForm)\s*\(/g;
    const reactiveVars = new Set();
    let m;
    while ((m = storeRegex.exec(src)) !== null) reactiveVars.add(m[2]);
    expect([...reactiveVars].sort()).toEqual(['formCtrl', 'formData', 'formHandle']);
    const result = autoWrapDynamic(src, reactiveVars);
    expect(result.code).toContain('dynamic(() => (formCtrl.getError');
  });

  it('replicates plugin pipeline (serverRPC → regex → autoWrap)', () => {
    const src = readFileSync(
      path.resolve(__dirname, '../main.tsx'), 'utf8'
    );
    // Phase 2: serverRPC (like the plugin)
    const serverResult = transformServerRPC(src, 'test.tsx', {});
    const transformed = serverResult.clientCode;
    console.log('--- after serverRPC: form() lines ---');
    for (const line of transformed.split('\n')) {
      if (line.includes('form()') || line.includes('serverForm(')) {
        console.log('RPC-LINE:', line.trim().slice(0, 100));
      }
    }
    // Phase 3: detect reactive vars (like the plugin)
    const storeRegex = /\b(const|let|var)\s+([\w$]+)(?:\s*:\s*[^=]+)?\s*=\s*(?:store|swr|form|serverForm)\s*\(/g;
    const reactiveVars = new Set();
    let m;
    while ((m = storeRegex.exec(transformed)) !== null) reactiveVars.add(m[2]);
    console.log('PLUGIN reactiveVars:', [...reactiveVars].sort());
    const result = autoWrapDynamic(transformed, reactiveVars);
    console.log('PLUGIN needsDynamic:', result.needsDynamic);
    for (const line of result.code.split('\n')) {
      if (line.includes('formCtrl.getError')) console.log('PLUGIN LINE:', line.trim().slice(0, 120));
    }
  });
});
