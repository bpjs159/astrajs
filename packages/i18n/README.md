# @bpjs159/i18n

> Built-in internationalization for AstraJS — fine-grained reactive translations, zero dependencies.

## Why it fits AstraJS

The active locale lives in a reactive `store()`. Any JSX expression that calls
`t()` is wrapped in `dynamic()` by the compiler, so calling `setLocale()` updates
**only the translated nodes** — no page reload, no component re-render.

## Usage

```ts
import { createI18n } from '@bpjs159/i18n';

const i18n = createI18n({
  locale: 'es',
  fallbackLocale: 'en',
  messages: {
    en: {
      'hero.title': 'Ship zero JavaScript',
      greeting: 'Hello, {name}!',
      'items.one': 'One item',
      'items.other': '{count} items',
    },
    es: {
      'hero.title': 'Cero JavaScript enviado',
      greeting: '¡Hola, {name}!',
      'items.one': 'Un artículo',
      'items.other': '{count} artículos',
    },
    ja: {
      'hero.title': 'ゼロJavaScriptを出荷',
      'items.other': '{count}件',
    },
  },
});

// En JSX — reactivo:
<h1>{i18n.t('hero.title')}</h1>
<button onClick={() => i18n.setLocale('en')}>EN</button>
```

## Features

| API | Qué hace |
|---|---|
| `t(key, params)` | Traduce con interpolación `{name}` y fallback por locale |
| `t(key, { count })` | Pluralización con `Intl.PluralRules` (`key.one` / `key.other` / …) |
| `setLocale(code)` | Cambia la locale — actualización quirúrgica de nodos |
| `n(value)` / `d(date)` / `l(list)` | Formato nativo con `Intl.NumberFormat` / `DateTimeFormat` / `ListFormat` |
| `dir()` | `'rtl'` para ar/he/fa/ur, `'ltr'` en el resto |
| `WORLD_LOCALES` | Registro de los idiomas más hablados para los switchers |

## Idiomas

El paquete es agnóstico de idioma: soporta cualquier locale que `Intl` conozca
(~400). Las apps definen sus `messages` para los idiomas más usados — inglés,
español, portugués, francés, italiano, alemán, ruso, japonés, chino simplificado…
— y `WORLD_LOCALES` da el listado con nombre propio para los selectores.

## Tests

```bash
npm test
```

## License

MIT
