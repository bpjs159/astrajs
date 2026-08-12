/**
 * Minimal argument parser — no dependencies.
 * Supports:
 *   positional: project name
 *   --template/-t <name>
 *   --yes/-y, --no-install, --dry-run, --help/-h, --version/-v
 */

export const VALID_TEMPLATES = ['minimal', 'frontend', 'fullstack'];

/** Legacy alias from the first CLI release: "basic" → "frontend". */
export function normalizeTemplate(template) {
  return template === 'basic' ? 'frontend' : template;
}

export function parseArgs(argv) {
  const args = {
    name: undefined,
    template: undefined,
    yes: false,
    install: undefined,
    dryRun: false,
    help: false,
    version: false,
    _unknown: [],
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    switch (arg) {
      case '-h':
      case '--help':
        args.help = true;
        break;
      case '-v':
      case '--version':
        args.version = true;
        break;
      case '-y':
      case '--yes':
        args.yes = true;
        break;
      case '--dry-run':
        args.dryRun = true;
        break;
      case '--no-install':
        args.install = false;
        break;
      case '-t':
      case '--template': {
        const value = normalizeTemplate(argv[++i]);
        if (!value) throw new Error(`Missing value for ${arg}`);
        if (!VALID_TEMPLATES.includes(value)) {
          throw new Error(
            `Unknown template "${value}". Valid templates: ${VALID_TEMPLATES.join(', ')}`
          );
        }
        args.template = value;
        break;
      }
      default:
        if (arg.startsWith('--template=')) {
          const value = normalizeTemplate(arg.slice('--template='.length));
          if (!VALID_TEMPLATES.includes(value)) {
            throw new Error(`Unknown template "${value}". Valid templates: ${VALID_TEMPLATES.join(', ')}`);
          }
          args.template = value;
        } else if (arg.startsWith('-')) {
          args._unknown.push(arg);
        } else if (!args.name) {
          args.name = arg;
        } else {
          args._unknown.push(arg);
        }
        break;
    }
  }

  return args;
}

export function validateProjectName(name) {
  const invalid = [
    // npm package name rules
    !/^[a-z0-9][a-z0-9._-]*$/.test(name) && 'Name can only contain lowercase letters, numbers, dots, hyphens, and underscores.',
    name.length > 214 && 'Name is too long (max 214 characters).',
    /[._]/.test(name.charAt(0)) && 'Name cannot start with a dot or underscore.',
  ].filter(Boolean);

  if (invalid.length > 0) {
    throw new Error(`Invalid project name "${name}":\n  ${invalid.join('\n  ')}`);
  }
}
