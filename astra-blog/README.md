# astra-blog — Full example: Pre-Built Requests

> **Flores del Mundo** — un atlas floral completo construido **exclusivamente con
> peticiones pre-construidas** (`server({ type: 'pre-build' })`). Cero fetch en
> runtime, cero API en vivo.

## Qué demuestra

- **Base de datos emulada** — Las "tablas" (botánicos, categorías, tags, flores,
  cuerpos, comentarios, páginas fijas) se generan dentro de los cuerpos de las
  funciones pre-build y se consultan durante el build.
- **Páginas fijas con mucha información** — Home (hero + stats + destacadas +
  recientes + regiones + tags + autores + CTA), About (misión, historia,
  pilares, equipo, FAQ) y Contact (email, dirección, horario, redes).
- **Rutas dinámicas bien resueltas** —
  - `/blog/:slug` — artículo floral con ficha técnica, comentarios y relacionados
  - `/authors/:authorSlug` — perfil de botánico con stats y sus artículos
  - `/categories/:categorySlug` — flores por región (asia, europa, america, africa, cuidados, curiosidades)
  - `/tags/:tagSlug` — flores por tag (sakura, tulipan, girasol, protea…)
- **Rutas dinámicas sobre rutas dinámicas** (la complejidad pedida) —
  - `/authors/:authorSlug/posts/:postSlug` — resuelve autor → post → pertenencia;
    si el post es de otro autor muestra un 404 contextual con la URL correcta.
  - `/categories/:categorySlug/tags/:tagSlug` — intersección de dos dimensiones
    dinámicas (posts que cumplen ambas).
- **Interactividad sin datos** — búsqueda por texto y filtros por categoría que
  re-filtran las constantes ya inlinadas (sin debounce contra una API, porque
  no hay API).

## Cómo funciona el pre-build

```ts
// src/prebuilt.ts
export const getPostsIndex = server({ type: 'pre-build', tags: ['posts'] }, async () => {
  // este cuerpo corre en BUILD TIME (new Function, sin scope de módulo)
  return { posts: [ /* … */ ] };
});
```

El compilador ejecuta la función al transformar el archivo y reemplaza toda la
llamada por la constante JSON inlinada:

```ts
// lo que llega al navegador:
const getPostsIndex = { "posts": [ … ] };
```

La capa `db-core.ts` es un motor de consultas puro (ORM emulado) sobre ese
snapshot; las páginas resuelven `params` contra él de forma síncrona.

## Estructura

```
src/
├── main.tsx              → montaje + estilos globales
├── app.tsx               → shell + guardas route() de todas las rutas
├── prebuilt.ts           → 7 llamadas server({ type: 'pre-build' })
├── db.ts                 → snapshot combinado → instancia del "ORM"
├── db-core.ts            → motor de consultas puro (testeable sin build)
├── components/
│   ├── site-chrome.tsx   → header, footer, breadcrumbs
│   └── post-card.tsx     → tarjeta de post + tag chip
└── pages/
    ├── home.tsx          → fija, mucha info
    ├── about.tsx         → fija, mucha info
    ├── contact.tsx       → fija
    ├── blog-index.tsx    → fija + filtros reactivos
    ├── post.tsx          → /blog/:slug
    ├── author.tsx        → /authors/:authorSlug
    ├── author-post.tsx   → /authors/:authorSlug/posts/:postSlug  (dinámica sobre dinámica)
    ├── category.tsx      → /categories/:categorySlug
    ├── category-tag.tsx  → /categories/:categorySlug/tags/:tagSlug (intersección)
    ├── tag.tsx           → /tags/:tagSlug
    └── not-found.tsx     → fallbackRoute()
```

## Comandos

```bash
pnpm install     # en la raíz del monorepo (npm workspaces)
astra dev        # o: npm run dev   — vite en http://localhost:5173
astra build      # o: npm run build — ejecuta las pre-built requests
astra test       # o: npm test      — vitest, tests de la capa de consultas
```

Los scripts de `package.json` usan el CLI de AstraJS (`astra dev|build|preview|test`),
que delega en vite/vitest resolviendo los binarios locales.

## Rutas para probar a mano

- `/` — home
- `/blog` — índice con búsqueda y filtros
- `/blog/sakura-japon` — artículo floral dinámico
- `/authors/luna-vega` — botánica dinámica
- `/authors/luna-vega/posts/sakura-japon` — **dinámica sobre dinámica** (ok)
- `/authors/luna-vega/posts/tulipanes-holanda` — **404 contextual** (flor de otra autora)
- `/categories/asia` — región dinámica
- `/categories/asia/tags/loto` — **intersección dinámica sobre dinámica**
- `/tags/girasol` — tag dinámico
- `/about`, `/contact` — páginas fijas
- `/cualquier/cosa` — 404 por fallbackRoute()
