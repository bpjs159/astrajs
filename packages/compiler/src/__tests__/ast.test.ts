import { describe, it, expect } from 'vitest';
import { ensureImport } from '../utils/ast.js';

describe('ensureImport()', () => {
  it('inserts after single-line imports', () => {
    const src = `import { a } from 'pkg';\n\nconst x = 1;\n`;
    const out = ensureImport(src, 'other', ['b']);
    expect(out).toContain("import { a } from 'pkg';");
    expect(out.indexOf("import { b } from 'other';")).toBeGreaterThan(out.indexOf("import { a }"));
    expect(out.indexOf('const x = 1;')).toBeGreaterThan(out.indexOf('from \'other\';'));
  });

  it('inserts after the END of a multi-line import block (regression)', () => {
    const src = [
      "import type { FieldErrors } from '../schema.js';",
      "import {",
      '  PRODUCTS,',
      '  CATEGORIES,',
      "} from '../db.js';",
      '',
      'const y = 1;',
    ].join('\n');
    const out = ensureImport(src, 'astrajs.dev/server', ['rpcHandler']);
    expect(out).toContain("import { rpcHandler } from 'astrajs.dev/server';");
    expect(out.indexOf('import { rpcHandler }')).toBeGreaterThan(out.indexOf("} from '../db.js';"));
    expect(out.indexOf('const y = 1;')).toBeGreaterThan(out.indexOf('rpcHandler'));
    expect(out).not.toContain('import {\nimport { rpcHandler }');
  });

  it('prepends when the file has no imports', () => {
    const out = ensureImport('const z = 1;\n', 'pkg', ['x']);
    expect(out.startsWith("import { x } from 'pkg';"));
  });
});
