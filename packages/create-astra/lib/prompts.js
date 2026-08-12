/**
 * Interactive prompts built on readline — zero dependencies.
 */
import readline from 'node:readline';
import { colors, paint } from './colors.js';

function ask(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function promptProjectName() {
  const name = await ask(
    `${paint('◇', colors.purple)} Project name:`
  );
  if (!name) return promptProjectName();
  return name;
}

export const TEMPLATES = {
  minimal: {
    label: 'minimal',
    description: 'Just the essentials — @astrajs/core + @astrajs/compiler',
  },
  frontend: {
    label: 'frontend',
    description: 'SPA building blocks — router, form, schema, validation',
  },
  fullstack: {
    label: 'fullstack',
    description: 'Everything — server() RPC, SSR/SSG/ISR',
  },
};

export async function promptTemplate() {
  const keys = Object.keys(TEMPLATES);
  console.log(`${paint('◇', colors.purple)} Select a template:`);
  keys.forEach((key, i) => {
    const t = TEMPLATES[key];
    console.log(
      `   ${paint(String(i + 1), colors.cyan)}. ${paint(t.label, colors.bold)} — ${paint(t.description, colors.dim)}`
    );
  });
  const answer = await ask('   Enter a number (1-3):');
  const idx = Number(answer) - 1;
  if (keys[idx]) return keys[idx];
  console.log(`${paint('!', colors.yellow)} Invalid choice, using "fullstack".`);
  return 'fullstack';
}

export async function promptInstall(packageManager) {
  const answer = await ask(
    `${paint('◇', colors.purple)} Install dependencies with ${paint(packageManager, colors.bold)}? (Y/n):`
  );
  return !/^n/i.test(answer);
}
