/**
 * astra-blog — Category listing
 *
 * RUTA DINÁMICA: /categories/:categorySlug
 */
import { component } from 'astrajs.dev/core';
import { params, Link } from 'astrajs.dev/router';
import { db } from '../db.js';
import { BreadcrumbsMarkup } from '../components/site-chrome.js';
import { PostCardMarkup } from '../components/post-card.js';

export const CategoryPage = component(() => (
  <div class="page wrap">
    {(() => {
      const category = db.findCategory(params.categorySlug as string);
      if (!category) {
        return (
          <div class="notfound-block">
            <span class="notfound-emoji">🗂</span>
            <h1>Categoría no encontrada</h1>
            <p>
              No existe la categoría <code>"{params.categorySlug}"</code>.
            </p>
            <Link href="/blog" class="btn btn-primary">
              ← Ver todas las categorías
            </Link>
          </div>
        );
      }

      const posts = db.postsByCategory(category.slug);
      const tags = db
        .listTags()
        .filter((t) => posts.some((p) => p.tags.includes(t.slug)))
        .slice(0, 8);

      return (
        <div>
          <BreadcrumbsMarkup
            items={[{ label: 'Inicio', href: '/' }, { label: category.name }]}
          />

          <section class="taxonomy-hero">
            <span class="taxonomy-icon">{category.icon}</span>
            <h1>{category.name}</h1>
            <p class="static-sub">{category.description}</p>
            <p class="taxonomy-count">
              {posts.length} {posts.length === 1 ? 'artículo' : 'artículos'} en esta categoría
            </p>
          </section>

          <section class="section">
            <h2 class="section-title">Cruza con un tag (ruta anidada)</h2>
            <p class="section-sub">
              Prueba la intersección dinámica sobre dinámica:{' '}
              <code>/categories/{category.slug}/tags/&lt;tag&gt;</code>
            </p>
            <div class="tag-cloud">
              {tags.map((t) => (
                <Link href={`/categories/${category.slug}/tags/${t.slug}`} class="tag-chip tag-link">
                  #{t.slug} <span class="tag-count">{t.count}</span>
                </Link>
              ))}
            </div>
          </section>

          <section class="section">
            <h2 class="section-title">Artículos</h2>
            <div class="card-grid">{posts.map((post) => PostCardMarkup(post))}</div>
          </section>
        </div>
      );
    })()}
  </div>
));
