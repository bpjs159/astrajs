#!/usr/bin/env node
/**
 * AstraJS package publisher — builds and publishes every package in
 * topological (dependency) order to the npm registry.
 *
 * Usage (from the repo root):
 *   node scripts/publish.mjs                  # publish with --tag beta
 *   node scripts/publish.mjs --tag latest     # publish as latest
 *   node scripts/publish.mjs --dry-run        # build + npm pack check, no publish
 *   node scripts/publish.mjs --skip-build     # skip the workspace build
 *   node scripts/publish.mjs --npm11          # publish via npm@11 (fixes npm 10.9.x auth bug)
 *   node scripts/publish.mjs --otp=123456     # single command, one OTP for 2FA
 *
 * npm / pnpm / yarn / bun are all CLIENTS of the same npm registry:
 * publishing once here makes the packages available to every manager.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// ── CLI flags ──────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const has = (f) => args.some((a) => a === f || a.startsWith(`${f}=`));
const val = (f) => {
  const hit = args.find((a) => a.startsWith(`${f}=`));
  return hit ? hit.slice(f.length + 1) : null;
};
const tag = val('--tag') ?? 'beta';
const dryRun = has('--dry-run');
const skipBuild = has('--skip-build');
const otp = val('--otp');
// npm 10.9.x sends publish PUTs WITHOUT Authorization (registry masks it as 404).
// --npm11 forces the publish steps through npm@11 (via npx) which attaches auth correctly.
const useNpm11 = has('--npm11');
const NPM_BIN = useNpm11 ? ['npx', '-y', 'npm@11.16.0'] : ['npm'];

// ── Publish order: only the self-contained umbrella ships to npm ──
// (astrajs.dev vendors all internal packages, so @bpjs159/* stays off the registry)
const ORDER = ['astra-js'];

function run(cmd, cmdArgs, { fatal = true } = {}) {
  const [base, ...preArgs] = Array.isArray(cmd) ? cmd : [cmd];
  console.log(`\n$ ${base} ${[...preArgs, ...cmdArgs].join(' ')}`);
  const r = spawnSync(base, [...preArgs, ...cmdArgs], { cwd: root, stdio: 'inherit' });
  if (r.status !== 0 && fatal) {
    console.error(`✗ "${base} ${[...preArgs, ...cmdArgs].join(' ')}" failed with exit code ${r.status}`);
    process.exit(r.status ?? 1);
  }
  return r.status ?? 0;
}

// ── Pre-flight ─────────────────────────────────────────────────────────────
console.log(`\nAstraJS publisher — tag "${tag}"${dryRun ? ' (DRY RUN)' : ''}\n`);

if (!dryRun) {
  const who = run(NPM_BIN, ['whoami'], { fatal: false });
  if (who !== 0) {
    console.error('✗ Not authenticated with the npm registry. Run `npm login` first.');
    process.exit(1);
  }
}

if (!skipBuild) {
  console.log('\n── Building all workspaces ──');
  run(NPM_BIN, ['run', 'build', '--workspaces', '--if-present']);
}

// ── Publish (or dry-run) ───────────────────────────────────────────────────
// Single npm invocation for ALL workspaces: npm sorts them topologically and
// prompts for the 2FA code exactly ONCE (interactive terminals).
const pkgArgs = [
  'publish',
  '-w',
  'packages/astra-js',
  '--access',
  'public',
  '--tag',
  tag,
];
if (dryRun) pkgArgs.push('--dry-run');
if (otp) pkgArgs.push(`--otp=${otp}`);

console.log(`\n── Publishing all workspaces (tag "${tag}") ──`);
run(NPM_BIN, pkgArgs);

console.log('\n── Summary ──');
for (const dir of ORDER) {
  const pkg = JSON.parse(readFileSync(join(root, 'packages', dir, 'package.json'), 'utf8'));
  console.log(`  ✓ ${pkg.name}@${pkg.version}`);
}
console.log(
  dryRun
    ? '\nDry run finished — nothing was published.'
    : `\nPublished all ${ORDER.length} packages under the "${tag}" tag.`,
);
