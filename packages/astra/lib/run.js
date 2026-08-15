/**
 * astra — project command runner (dev / build / preview / test).
 *
 * Zero dependencies: resolves the local vite/vitest binaries by walking
 * up node_modules/.bin from the current directory and delegates to them.
 * This keeps project scripts uniform:
 *
 *   "scripts": {
 *     "dev":     "astra dev",
 *     "build":   "astra build",
 *     "preview": "astra preview",
 *     "test":    "astra test"
 *   }
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { colors, paint } from './colors.js';
import { buildProject } from './build.js';

/** Subcommand → underlying tool + default arguments. */
const COMMANDS = {
  dev: { tool: 'vite', args: [] },
  preview: { tool: 'vite', args: ['preview'] },
  test: { tool: 'vitest', args: ['run'] },
};

/** Walks up from cwd looking for node_modules/.bin/<name>. */
export function findBin(name) {
  let dir = process.cwd();
  for (;;) {
    const base = path.join(dir, 'node_modules', '.bin');
    if (fs.existsSync(path.join(base, name))) return path.join(base, name);
    if (process.platform === 'win32' && fs.existsSync(path.join(base, name + '.cmd'))) {
      return path.join(base, name + '.cmd');
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/**
 * Runs an astra subcommand. Returns true when the command was handled
 * (so the caller skips the scaffolding flow), false otherwise.
 */
export function runAstraCommand(command, extraArgs) {
  // `astra build` has its own orchestrator: client build + SSR bundle +
  // deployment adapter output (see build.js).
  if (command === 'build') {
    const { adapter, rest } = splitAdapterFlag(extraArgs);
    void buildProject({ adapterFlag: adapter, extraArgs: rest });
    return true;
  }

  const spec = COMMANDS[command];
  if (!spec) return false;

  const bin = findBin(spec.tool);
  if (!bin) {
    console.error(
      `${paint('✖', colors.red)} Could not find ${paint(spec.tool, colors.bold)} in node_modules.`
    );
    console.error(`   Run ${paint('npm install', colors.bold)} in your project first.`);
    process.exitCode = 1;
    return true;
  }

  const fullArgs = [...spec.args, ...extraArgs];
  console.log(
    `${paint('◇', colors.purple)} astra ${command}${fullArgs.length ? ' ' + fullArgs.join(' ') : ''}${colors.reset}`
  );

  const child = spawn(bin, fullArgs, { stdio: 'inherit' });

  // Forward termination signals so Ctrl+C kills the toolchain as one unit.
  const forwardSignal = (signal) => {
    child.kill(signal);
  };
  process.on('SIGINT', forwardSignal);
  process.on('SIGTERM', forwardSignal);

  child.on('exit', (code, signal) => {
    process.removeListener('SIGINT', forwardSignal);
    process.removeListener('SIGTERM', forwardSignal);
    if (signal) {
      process.kill(process.pid, signal);
    } else {
      process.exit(code ?? 0);
    }
  });

  return true;
}

/** Splits `--adapter=x` / `--adapter x` out of the extra args. */
function splitAdapterFlag(extraArgs) {
  const rest = [];
  let adapter = null;
  for (let i = 0; i < extraArgs.length; i++) {
    const arg = extraArgs[i];
    if (arg === '--adapter' && extraArgs[i + 1]) {
      adapter = extraArgs[i + 1];
      i++;
    } else if (arg.startsWith('--adapter=')) {
      adapter = arg.slice('--adapter='.length);
    } else {
      rest.push(arg);
    }
  }
  return { adapter, rest };
}
