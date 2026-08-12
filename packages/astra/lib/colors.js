/**
 * Tiny ANSI color helpers — no dependencies.
 */
export const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  purple: '\x1b[38;5;135m',
  blue: '\x1b[38;5;69m',
  cyan: '\x1b[38;5;51m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

export function paint(text, color) {
  return color + text + colors.reset;
}
