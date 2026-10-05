import { describe, it, expect } from 'vitest';
import { effect, flushPending } from '@astrajs/core';
import { createI18n } from '../i18n.js';

function makeI18n() {
  return createI18n({
    locale: 'es',
    fallbackLocale: 'en',
    messages: {
      en: {
        'hero.title': 'Ship zero JavaScript',
        'hero.subtitle': 'The full-stack framework that compiles your JSX to real DOM.',
        greeting: 'Hello, {name}! You have {count} messages.',
        'items.one': 'One item',
        'items.other': '{count} items',
        'nav.docs': 'Documentation',
      },
      es: {
        'hero.title': 'Cero JavaScript enviado',
        greeting: '¡Hola, {name}! Tienes {count} mensajes.',
        'items.one': 'Un artículo',
        'items.other': '{count} artículos',
      },
      ja: {
        'hero.title': 'ゼロJavaScriptを出荷',
        'items.other': '{count}件',
      },
    },
  });
}

describe('createI18n — traducción básica', () => {
  it('traduce en la locale activa y hace fallback a la de respaldo', () => {
    const i18n = makeI18n();
    expect(i18n.t('hero.title')).toBe('Cero JavaScript enviado');
    expect(i18n.t('nav.docs')).toBe('Documentation'); // solo existe en en
    expect(i18n.t('missing.key')).toBe('missing.key'); // ni activa ni fallback
  });

  it('interpola placeholders {name} {count}', () => {
    const i18n = makeI18n();
    expect(i18n.t('greeting', { name: 'Ada', count: 3 })).toBe('¡Hola, Ada! Tienes 3 mensajes.');
  });

  it('interpola placeholders en la locale de respaldo', () => {
    const i18n = makeI18n();
    i18n.setLocale('en');
    expect(i18n.t('greeting', { name: 'Ada', count: 3 })).toBe('Hello, Ada! You have 3 messages.');
  });
});

describe('createI18n — pluralización', () => {
  it('elige la categoría según Intl.PluralRules de la locale', () => {
    const i18n = makeI18n();
    expect(i18n.t('items', { count: 1 })).toBe('Un artículo');
    expect(i18n.t('items', { count: 5 })).toBe('5 artículos');
    i18n.setLocale('en');
    expect(i18n.t('items', { count: 1 })).toBe('One item');
    expect(i18n.t('items', { count: 5 })).toBe('5 items');
  });

  it('japonés usa "other" para todo', () => {
    const i18n = makeI18n();
    i18n.setLocale('ja');
    expect(i18n.t('items', { count: 1 })).toBe('1件');
    expect(i18n.t('items', { count: 42 })).toBe('42件');
  });

  it('usa la clave base si no hay variantes plurales', () => {
    const i18n = createI18n({
      locale: 'es',
      messages: { es: { fixed: 'Siempre igual' } },
    });
    expect(i18n.t('fixed', { count: 9 })).toBe('Siempre igual');
  });
});

describe('createI18n — reactividad', () => {
  it('los efectos que leen t() se re-ejecutan al cambiar locale', () => {
    const i18n = makeI18n();
    let seen = '';
    effect(() => {
      void i18n.locale;
      seen = i18n.t('hero.title');
    });
    expect(seen).toBe('Cero JavaScript enviado');

    i18n.setLocale('en');
    flushPending(); // los triggers del store se ejecutan diferidos
    expect(seen).toBe('Ship zero JavaScript');

    i18n.setLocale('ja');
    flushPending();
    expect(seen).toBe('ゼロJavaScriptを出荷');
  });
});

describe('createI18n — formato y dirección', () => {
  it('formatea números y fechas con Intl de la locale activa', () => {
    const i18n = makeI18n();
    i18n.setLocale('en');
    expect(i18n.n(1234567.89)).toContain('1,234,567.89');
    i18n.setLocale('es');
    expect(i18n.n(1234567.89)).toContain('1.234.567,89');
  });

  it('detecta RTL para árabe y LTR para el resto', () => {
    const i18n = makeI18n();
    expect(i18n.dir()).toBe('ltr');
    i18n.setLocale('ar');
    expect(i18n.dir()).toBe('rtl');
  });

  it('valida disponibilidad de locales', () => {
    const i18n = makeI18n();
    expect(i18n.isLocaleAvailable('es')).toBe(true);
    expect(i18n.isLocaleAvailable('zh-CN')).toBe(false);
  });
});
