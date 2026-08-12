/**
 * astra-blog — db.ts
 *
 * Combina las constantes pre-construidas (resultado de las llamadas
 * `server({ type: 'pre-build' })` de prebuilt.ts) en un único snapshot
 * y crea la instancia de la base de datos emulada.
 *
 * IMPORTANTE: el compilador reemplaza cada llamada pre-build por la
 * constante JSON inlinada. En runtime, `getSiteConfig` ya NO es una
 * función: ES el objeto de configuración. Por eso el cast
 * `as unknown as` — el mismo patrón del ejemplo 10-ssg-prebuilt.
 */
import {
  getSiteConfig,
  getAuthors,
  getTaxonomy,
  getPostsIndex,
  getPostBodies,
  getComments,
  getStaticPages,
} from './prebuilt.js';
import { createDb } from './db-core.js';
import type { BlogSnapshot, SiteConfig, Author, Category, PostMeta, PostBody, Comment, StaticPage } from './db-core.js';

export const db = createDb({
  site: getSiteConfig as unknown as SiteConfig,
  authors: getAuthors as unknown as Author[],
  categories: (getTaxonomy as unknown as { categories: Category[] }).categories,
  tags: (getTaxonomy as unknown as { tags: string[] }).tags,
  posts: (getPostsIndex as unknown as { posts: PostMeta[] }).posts,
  bodies: getPostBodies as unknown as Record<string, PostBody>,
  comments: getComments as unknown as Record<string, Comment[]>,
  pages: getStaticPages as unknown as StaticPage,
} as unknown as BlogSnapshot);
