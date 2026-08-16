/**
 * astra-blog — Category ∩ Tag intersection
 *
 * RUTA DINÁMICA SOBRE RUTA DINÁMICA:
 *   /categories/:categorySlug/tags/:tagSlug
 *
 * Resuelve los posts que cumplen AMBAS condiciones (intersección de
 * dos dimensiones dinámicas) contra los datos pre-construidos.
 */
import { component } from '@bpjs159/core';
import { params, Link } from '@bpjs159/router';
import { db } from '../db.js';
import { BreadcrumbsMarkup } from '../components/site-chrome.js';
import { PostCardMarkup } from '../components/post-card.js';

export const CategoryTagPage = component(() => (
  <div class="page wrap">
    {(() => {
      const categorySlug = params.categorySlug as string;
      const tagSlug = params.tagSlug as string;
      const result = db.resolveCategoryTag(categorySlug, tagSlug);

      if (!result.ok) {
        const categoryExists = !!db.findCategory(categorySlug);
        const tagExists = !!db.findTag(tagSlug);
        return (
          <div class="notfound-block">
            <span class="notfound-emoji">🧩</span>
            <h1>Intersección no resuelta</h1>
            <p>
              {!categoryExists && !tagExists && (
                <span>
                  Ni la categoría <code>"{categorySlug}"</code> ni el tag <code>"{tagSlug}"</code>{' '}
                  existen.
                </span>
              )}
              {!categoryExists && tagExists && (
                <span>
                  La categoría <code>"{categorySlug}"</code> no existe (el tag sí).
                </span>
              )}
              {categoryExists && !tagExists && (
                <span>
                  El tag <code>"{tagSlug}"</code> no existe (la categoría sí).
                </span>
              )}
            </p>
            <Link href="/blog" class="btn btn-primary">
              ← Volver al blog
            </Link>
          </div>
        );
      }

      const { category, tag, posts } = result.value!;

      return (
        <div>
          <BreadcrumbsMarkup
            items={[
              { label: 'Inicio', href: '/' },
              { label: category.name, href: `/categories/${category.slug}` },
              { label: `#${tag}` },
            ]}
          />

          <section class="taxonomy-hero">
            <span class="taxonomy-icon">{category.icon}</span>
            <h1>
              {category.name} <span class="intersect-symbol">∩</span> #{tag}
            </h1>
            <p class="static-sub">
              Intersección de dos rutas dinámicas: posts de la categoría "{category.name}" que además
              llevan el tag "{tag}".
            </p>
            <p class="taxonomy-count">
              {posts.length} {posts.length === 1 ? 'artículo cumple' : 'artículos cumplen'} ambas
              condiciones
            </p>
          </section>

          <section class="section">
            {posts.length === 0 ? (
              <div class="empty-state">
                <span class="empty-icon">🕸</span>
                <h3>Intersección vacía</h3>
                <p>
                  Ningún artículo de "{category.name}" usa el tag "{tag}". Prueba otra combinación.
                </p>
                <Link href={`/categories/${category.slug}`} class="btn btn-ghost">
                  Ver toda la categoría
                </Link>
              </div>
            ) : (
              <div class="card-grid">{posts.map((post) => PostCardMarkup(post))}</div>
            )}
          </section>
        </div>
      );
    })()}
  </div>
));
