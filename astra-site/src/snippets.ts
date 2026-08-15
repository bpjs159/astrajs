/**
 * astra-site — localized code comments
 *
 * `localizedCode(base, key)` rewrites the `//` and `/* *\/` comments of a
 * snippet for the ACTIVE locale (read from the reactive i18n store).
 * Code lines, identifiers and strings are never touched — only comment
 * tokens are swapped by their position in the snippet.
 */
import { i18n } from './i18n.js';
import { SNIPPET_COMMENTS_ROMANCE } from './i18n-snippets-romance.js';
import { SNIPPET_COMMENTS_EU } from './i18n-snippets-eu.js';
import { SNIPPET_COMMENTS_EAST } from './i18n-snippets-east.js';

/** snippet key → locale → ordered comment translations. */
export const SNIPPET_COMMENTS: Record<string, Record<string, string[]>> = {};

// The catalogs are split by language group; every group may contain the same
// keys, so merge at the locale level (a shallow spread would let later groups
// overwrite earlier locales of the same snippet key).
for (const group of [SNIPPET_COMMENTS_ROMANCE, SNIPPET_COMMENTS_EU, SNIPPET_COMMENTS_EAST]) {
  for (const [key, locales] of Object.entries(group)) {
    SNIPPET_COMMENTS[key] = { ...(SNIPPET_COMMENTS[key] ?? {}), ...locales };
  }
}

const COMMENT_RE = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g;

/**
 * Returns the snippet with its comments translated to the active locale.
 * Comments beyond the translation list stay in the base (English) form.
 */
export function localizedCode(base: string, key: string): string {
  const translations = SNIPPET_COMMENTS[key]?.[i18n.locale];
  if (!translations || translations.length === 0) return base;

  let i = 0;
  return base.replace(COMMENT_RE, (match) => {
    const t = translations[i];
    if (t === undefined) return match; // keep English beyond the list
    i++;
    return t;
  });
}
