#!/usr/bin/env node
/**
 * Promotes the @astra packages from one dist-tag to another WITHOUT
 * re-uploading (npm does not allow publishing the same version twice).
 *
 * Usage:
 *   node scripts/promote.mjs                # beta → latest (default)
 *   node scripts/promote.mjs --from=beta --to=next
 *   node scripts/promote.mjs --version=0.1.0
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const val = (f, d) => {
  const hit = args.find((a) => a.startsWith(`${f}=`));
  return hit ? hit.slice(f.length + 1) : d;
};
const fromTag = val('--from', 'beta');
const toTag = val('--to', 'latest');
const version = val('--version', null);

const ORDER = [
  'validation', 'ai', 'core', 'form', 'i18n', 'router', 'schema',
  'server', 'compiler', 'ssr', 'adapters', 'astra',
];

let ok = true;
for (const dir of ORDER) {
  const pkg = JSON.parse(readFileSync(join(root, 'packages', dir, 'package.json'), 'utf8'));
  const v = version ?? pkg.version;
  const spec = `${pkg.name}@${v}`;
  console.log(`$ npm dist-tag add ${spec} ${toTag}`);
  const r = spawnSync('npm', ['dist-tag', 'add', spec, toTag], { cwd: root, stdio: 'inherit' });
  if (r.status !== 0) ok = false;
}

console.log(
  ok
    ? `\n✓ All packages moved from "${fromTag}" to "${toTag}".`
    : '\n✗ Some dist-tag updates failed — see output above.',
);
