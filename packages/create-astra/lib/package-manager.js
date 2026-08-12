/**
 * Package manager detection and dependency installation.
 */
import { spawnSync } from 'node:child_process';
import { colors, paint } from './colors.js';

export function detectPackageManager() {
  const ua = process.env.npm_config_user_agent ?? '';
  if (ua.includes('pnpm')) return 'pnpm';
  if (ua.includes('yarn')) return 'yarn';
  if (ua.includes('bun')) return 'bun';
  return 'npm';
}

export function installDependencies(projectDir, packageManager) {
  console.log(`\n${paint('◇', colors.purple)} Installing dependencies with ${paint(packageManager, colors.bold)}...\n`);

  const cmd = packageManager === 'npm' ? 'npm' : packageManager;
  const args = packageManager === 'yarn' ? ['install'] : ['install'];
  // npm/pnpm/yarn/bun all accept "install"
  const result = spawnSync(cmd, args, {
    cwd: projectDir,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.error) {
    console.log(
      `${paint('!', colors.yellow)} Could not run ${cmd} automatically. Run "cd ${projectDir} && ${packageManager} install" manually.`
    );
    return false;
  }
  return result.status === 0;
}
