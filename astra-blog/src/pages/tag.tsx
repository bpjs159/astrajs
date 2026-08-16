/**
 * astra-blog — Tag listing
 *
 * RUTA DINÁMICA: /tags/:tagSlug
 */
import { component } from 'astrajs.dev/core';
import { params, Link } from 'astrajs.dev/router';
import { db } from '../db.js';
import { BreadcrumbsMarkup } from '../components/site-chrome.js';
import { PostCardMarkup } from '../components/post-card.js';

export const TagPage = component(() => (
  <div class="page wrap">
    {(() => {
      const tag = db.findTag(params.tagSlug as string);
      if (!tag) {
        return (
          <div class="notfound-block">
            <span class="notfound-emoji">🏷</span>
            <h1>Tag no encontrado</h1>
            <p>
              No existe el tag <code>"{params.tagSlug}"</code>.
            </p>
            <Link href="/blog" class="btn btn-primary">
              ← Volver al blog
            </Link>
          </div>
        );
      }

      const posts = db.postsByTag(tag);
      const categories = db
        .listCategories()
        .filter((c) => posts.some((p) => p.categorySlug === c.slug));

      return (
        <div>
          <BreadcrumbsMarkup items={[{ label: 'Inicio', href: '/' }, { label: `#${tag}` }]} />

          <section class="taxonomy-hero">
            <span class="taxonomy-icon">🏷</span>
            <h1>#{tag}</h1>
            <p class="static-sub">
              {posts.length} {posts.length === 1 ? 'artículo usa' : 'artículos usan'} este tag en los
              datos pre-construidos.
            </p>
            {categories.length > 0 && (
              <div class="tag-cloud tag-cloud-center">
                {categories.map((c) => (
                  <Link href={`/categories/${c.slug}/tags/${tag}`} class="tag-chip tag-link">
                    {c.icon} {c.name} ∩ #{tag}
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section class="section">
            <div class="card-grid">{posts.map((post) => PostCardMarkup(post))}</div>
          </section>
        </div>
      );
    })()}
  </div>
));
