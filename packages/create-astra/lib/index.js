/**
 * create-astra — main entry.
 * Orchestrates: parse args → prompts → scaffold → install → next steps.
 */
import fs from 'node:fs';
import path from 'node:path';
import { colors, paint } from './colors.js';
import { parseArgs, validateProjectName, VALID_TEMPLATES } from './args.js';
import { printHelp, printVersion } from './help.js';
import { promptProjectName, promptTemplate, promptInstall } from './prompts.js';
import { detectPackageManager, installDependencies } from './package-manager.js';
import { scaffold, printFileTree } from './scaffold.js';

const BANNER = `
  ${paint('ASTRA', colors.bold)}${paint('JS', colors.bold)}${paint('  —  create-astra', colors.dim)}
  ${paint('The Full-Stack Framework that Ships Zero JavaScript.', colors.dim)}
`;

export async function main(argv) {
  let args;
  try {
    args = parseArgs(argv);
  } catch (err) {
    console.error(`${paint('✖', colors.red)} ${err.message}`);
    process.exit(1);
  }

  if (args.help) {
    printHelp();
    return;
  }
  if (args.version) {
    printVersion();
    return;
  }

  console.log(BANNER);

  // ── Gather options ────────────────────────────────────────────────
  let projectName = args.name;
  if (!projectName) {
    projectName = await promptProjectName();
  }
  try {
    validateProjectName(projectName);
  } catch (err) {
    console.error(`${paint('✖', colors.red)} ${err.message}`);
    process.exit(1);
  }

  const template = args.template ?? (args.yes ? 'fullstack' : await promptTemplate());
  if (!VALID_TEMPLATES.includes(template)) {
    console.error(`${paint('✖', colors.red)} Unknown template "${template}".`);
    process.exit(1);
  }

  const packageManager = detectPackageManager();

  // --dry-run never installs and never asks about installing.
  const shouldInstall = args.dryRun
    ? false
    : args.install !== false && (args.yes ? true : await promptInstall(packageManager));

  // ── Scaffold ──────────────────────────────────────────────────────
  const targetDir = path.resolve(process.cwd(), projectName);

  if (!args.dryRun) {
    if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
      console.error(
        `${paint('✖', colors.red)} Directory ${paint(projectName, colors.bold)} already exists and is not empty.`
      );
      console.error(`   Remove it or choose a different project name.`);
      process.exit(1);
    }
  }

  console.log(
    `\n${paint('◇', colors.purple)} Scaffolding ${paint(template, colors.bold)} project in ${paint(projectName, colors.bold)}...`
  );

  const files = scaffold({
    projectName,
    template,
    targetDir,
    packageManager,
    dryRun: args.dryRun,
  });

  if (args.dryRun) {
    printFileTree(files, projectName);
    return;
  }

  console.log(
    `${paint('✔', colors.green)} Generated ${paint(String(files.length), colors.bold)} files in ${paint('./' + projectName, colors.bold)}`
  );

  // ── Install dependencies ──────────────────────────────────────────
  if (shouldInstall) {
    const ok = installDependencies(targetDir, packageManager);
    if (!ok) {
      console.log(`${paint('!', colors.yellow)} Dependency installation skipped.`);
    }
  } else {
    console.log(`${paint('!', colors.yellow)} Dependencies not installed. Run it manually when ready.`);
  }

  // ── Next steps ────────────────────────────────────────────────────
  const run = packageManager === 'npm' ? 'npm run dev' : `${packageManager} dev`;
  console.log(`\n${paint('◇', colors.purple)} Next steps:${colors.reset}`);
  console.log(`  ${paint('cd ' + projectName, colors.bold)}`);
  console.log(`  ${paint(run, colors.bold)}\n`);
  console.log(`${paint('Happy building! 🚀', colors.dim)}\n`);
}
