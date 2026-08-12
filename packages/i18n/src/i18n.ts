/**
 * @astrajs/i18n — Built-in internationalization for AstraJS.
 *
 * Zero dependencies. The current locale lives in a reactive `store()`, so
 * any JSX expression that calls `t()` inside a `dynamic()` block re-runs
 * when `setLocale()` is called — translations update surgically, node by
 * node, with no page reload and no component re-render.
 *
 *   const i18n = createI18n({
 *     locale: 'es',
 *     messages: {
 *       en: { 'hero.title': 'Ship zero JavaScript' },
 *       es: { 'hero.title': 'Cero JavaScript enviado' },
 *     },
 *   });
 *
 *   <h1>{i18n.t('hero.title')}</h1>
 *   i18n.setLocale('en'); // ← solo este <h1> se actualiza
 *
 * Features:
 *   - Nested keys with dot paths ('nav.docs.title')
 *   - Interpolation with {placeholders} (and {{ }} to escape)
 *   - Pluralization via Intl.PluralRules ('items' → 'items.one' / 'items.other')
 *   - Fallback locale chain (key not found → fallback → key itself)
 *   - Number / date / list formatting with Intl (native, locale-aware)
 *   - RTL detection for right-to-left languages (ar, he, fa, ur)
 */
import { store } from '@astrajs/core';

// ─── Public types ─────────────────────────────────────────────────────────────

export type Messages = Record<string, Record<string, string>>;

export interface I18nOptions {
  /** Initial locale. Defaults to 'en'. */
  locale?: string;
  /** Locale used when a key is missing in the active locale. Defaults to 'en'. */
  fallbackLocale?: string;
  /** Locale → (key → message) dictionary. */
  messages: Messages;
}

export interface InterpolationParams {
  [key: string]: string | number | Date | undefined;
}

export interface PluralParams extends InterpolationParams {
  count?: number;
}

/** Right-to-left languages (subset — extend as needed). */
const RTL_LOCALES = new Set(['ar', 'he', 'fa', 'ur']);

function primarySubtag(locale: string): string {
  return locale.split('-')[0]!.toLowerCase();
}

/** Walks 'a.b.c' inside a flat dictionary: exact 'a.b.c', then 'b.c', then 'c'. */
function lookup(messages: Record<string, string> | undefined, key: string): string | undefined {
  if (!messages) return undefined;
  if (Object.prototype.hasOwnProperty.call(messages, key)) return messages[key];
  const parts = key.split('.');
  for (let i = 1; i < parts.length; i++) {
    const candidate = parts.slice(i).join('.');
    if (Object.prototype.hasOwnProperty.call(messages, candidate)) return messages[candidate];
  }
  return undefined;
}

/** Replaces {name} placeholders; {{ and }} escape literal braces. */
function interpolate(message: string, params?: InterpolationParams): string {
  if (!params) return message;
  return message.replace(/\{\{|\}\}|\{([^{}]+)\}/g, (match, name: string | undefined) => {
    if (match === '{{') return '{';
    if (match === '}}') return '}';
    if (name === undefined) return match;
    const value = params[name.trim()];
    return value === undefined ? match : String(value);
  });
}

function pluralCategory(locale: string, count: number): string {
  try {
    return new Intl.PluralRules(locale).select(count);
  } catch {
    return count === 1 ? 'one' : 'other';
  }
}

// ─── The i18n instance ────────────────────────────────────────────────────────

export interface I18n {
  /** Reactive getter — reading it inside a dynamic() block subscribes to changes. */
  get locale(): string;
  /** The messages dictionary (read-only reference). */
  readonly messages: Messages;
  /** Translates a key for the ACTIVE locale, falling back as needed. */
  t(key: string, params?: InterpolationParams): string;
  /** Changes the active locale — every bound node re-renders surgically. */
  setLocale(locale: string): void;
  /** Returns true when the active locale has messages defined. */
  isLocaleAvailable(locale: string): boolean;
  /** Formats a number with Intl.NumberFormat for the active locale. */
  n(value: number, options?: Intl.NumberFormatOptions): string;
  /** Formats a date with Intl.DateTimeFormat for the active locale. */
  d(value: Date | number, options?: Intl.DateTimeFormatOptions): string;
  /** Formats a list with Intl.ListFormat for the active locale. */
  l(values: string[], options?: Intl.ListFormatOptions): string;
  /** 'rtl' for right-to-left locales, 'ltr' otherwise. */
  dir(): 'ltr' | 'rtl';
}

export function createI18n(options: I18nOptions): I18n {
  const state = store({
    locale: options.locale ?? 'en',
  });
  const fallbackLocale = options.fallbackLocale ?? 'en';
  const messages = options.messages;

  function t(key: string, params?: InterpolationParams): string {
    // Reading `state.locale` HERE is what makes translations reactive:
    // effects that run `t()` re-collect this dependency and re-execute
    // on setLocale() — no manual subscriptions.
    const locale = state.locale as string;

    const table = messages[locale];
    let message = lookup(table, key);

    if (message === undefined && locale !== fallbackLocale) {
      message = lookup(messages[fallbackLocale], key);
    }

    // Pluralization: when `count` is present, prefer the pluralized key
    // 'key.one' / 'key.other' / 'key.few' / 'key.many' for this locale.
    if (params && typeof params.count === 'number' && message === undefined) {
      const category = pluralCategory(locale, params.count);
      message = lookup(table, `${key}.${category}`) ?? lookup(messages[fallbackLocale], `${key}.${category}`);
    }

    if (message === undefined) return key;
    return interpolate(message, params);
  }

  function setLocale(locale: string): void {
    state.locale = locale;
  }

  return {
    get locale() {
      return state.locale as string;
    },
    messages,
    t,
    setLocale,
    isLocaleAvailable: (locale: string) => Boolean(messages[locale]),
    n: (value: number, options?: Intl.NumberFormatOptions) =>
      new Intl.NumberFormat(state.locale as string, options).format(value),
    d: (value: Date | number, options?: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(state.locale as string, options).format(value),
    l: (values: string[], options?: Intl.ListFormatOptions) =>
      new Intl.ListFormat(state.locale as string, options).format(values),
    dir: () => (RTL_LOCALES.has(primarySubtag(state.locale as string)) ? 'rtl' : 'ltr'),
  };
}

// ─── Locale metadata (used by switchers and docs) ─────────────────────────────

/**
 * The most widely spoken languages, with self-named labels for pickers.
 * Apps provide their own `messages` for each locale they support; this
 * registry exists so switchers can render a friendly list.
 */
export const WORLD_LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
  { code: 'fr', label: 'Français' },
  { code: 'it', label: 'Italiano' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ru', label: 'Русский' },
  { code: 'ja', label: '日本語' },
  { code: 'zh-CN', label: '简体中文' },
] as const;

export type WorldLocaleCode = (typeof WORLD_LOCALES)[number]['code'];
