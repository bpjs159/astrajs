#!/usr/bin/env node
/**
 * deploy.mjs — build everything and ship it to the production server.
 *
 * Usage:
 *   npm run deploy            # full rebuild + upload + restart backends
 *   npm run deploy -- --skip-build   # upload the existing staging dir only
 *
 * Pipeline:
 *   1. node tools/deploy-build.mjs → builds site/blog/showcase/examples into
 *      a staging dir (default $TMPDIR/astrajs-deploy).
 *   2. rsync --delete → admin@SERVER_HOST:/var/www/astrajs/
 *   3. pm2 restart all on the server (12 backend apps).
 *
 * NOTE: nginx vhosts in /etc/nginx are CERTBOT-MANAGED (TLS blocks). This
 * script deliberately does NOT touch them — web files only. If a vhost needs
 * changing, edit the template in tools/deploy-build.mjs and update
 * /etc/nginx/sites-available manually on the server.
 *
 * Overrides:
 *   ASTRA_DEPLOY_HOST   server host        (default SERVER_HOST)
 *   ASTRA_STAGE_DIR     staging directory  (default $TMPDIR/astrajs-deploy)
 *   ASTRA_SSH_KEY       path to ssh key    (default keys/astrajs-dev-key.pem)
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOST = process.env.ASTRA_DEPLOY_HOST ?? 'SERVER_HOST';
const USER = process.env.ASTRA_DEPLOY_USER ?? 'admin';
const KEY = process.env.ASTRA_SSH_KEY
  ? path.resolve(ROOT, process.env.ASTRA_SSH_KEY)
  : path.join(ROOT, 'keys', 'astrajs-dev-key.pem');
const STAGE =
  process.env.ASTRA_STAGE_DIR ?? path.join(process.env.TMPDIR ?? '/tmp', 'astrajs-deploy');

const args = process.argv.slice(2);
const skipBuild = args.includes('--skip-build');

const cyan = (s) => `\x1b[36m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;

function run(cmd, cmdArgs, { label, cwd } = {}) {
  console.log(cyan(`\n── ${label ?? cmd}`));
  const result = spawnSync(cmd, cmdArgs, {
    cwd: cwd ?? ROOT,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    console.error(red(`✖ ${cmd} exited with ${result.status}`));
    process.exit(result.status ?? 1);
  }
}

if (!skipBuild) {
  run('node', [path.join(ROOT, 'tools', 'deploy-build.mjs')], {
    label: 'build (site + blog + showcase + 28 examples)',
  });
} else {
  console.log(cyan('\n── skipping build (--skip-build)'));
}

if (!fs.existsSync(path.join(STAGE, 'site', 'index.html'))) {
  console.error(red(`✖ staging dir incomplete: ${STAGE}`));
  process.exit(1);
}
if (!fs.existsSync(KEY)) {
  console.error(red(`✖ ssh key not found: ${KEY}`));
  process.exit(1);
}

const sshBase = `ssh -i ${KEY} -o StrictHostKeyChecking=accept-new ${USER}@${HOST}`;

run('rsync', [
  '-az', '--delete',
  '-e', `ssh -i ${KEY} -o StrictHostKeyChecking=accept-new`,
  `${STAGE}/`,
  `${USER}@${HOST}:/var/www/astrajs/`,
], { label: `rsync → ${USER}@${HOST}:/var/www/astrajs/` });

run('ssh', [
  '-i', KEY, '-o', 'StrictHostKeyChecking=accept-new',
  `${USER}@${HOST}`,
  'export PATH=$PATH:/usr/bin && pm2 restart all --update-env >/dev/null 2>&1; sleep 2; echo "online apps: $(pm2 list | grep -c online)"',
], { label: 'restart backends (pm2)' });

console.log(green('\n✓ deploy complete'));
console.log(
  `  https://astrajs.dev · https://blog.astrajs.dev · https://showcase.astrajs.dev · https://examples.astrajs.dev`
);
console.log('  (nginx vhosts are certbot-managed — this script never touches them)\n');
