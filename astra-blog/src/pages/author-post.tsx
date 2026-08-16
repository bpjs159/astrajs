/**
 * astra-blog — Author → Post
 *
 * RUTA DINÁMICA SOBRE RUTA DINÁMICA: /authors/:authorSlug/posts/:postSlug
 *
 * Resolución en dos niveles contra los datos pre-construidos:
 *   1. ¿Existe el autor?
 *   2. ¿Existe el post Y pertenece a ese autor?
 * Si el post existe pero es de otro autor → 404 contextual ("orphan")
 * con enlace al autor correcto.
 */
import { component } from 'astrajs.dev/core';
import { params, Link } from 'astrajs.dev/router';
import { db } from '../db.js';
import { BreadcrumbsMarkup } from '../components/site-chrome.js';
import { PostCardMarkup } from '../components/post-card.js';

export const AuthorPostPage = component(() => (
  <div class="page wrap">
    {(() => {
      const authorSlug = params.authorSlug as string;
      const postSlug = params.postSlug as string;
      const result = db.resolveAuthorPost(authorSlug, postSlug);

      // ── Nivel 1: el autor no existe ──
      if (!result.ok && result.reason === 'missing' && !db.findPost(postSlug)) {
        return (
          <div class="notfound-block">
            <span class="notfound-emoji">🧭</span>
            <h1>Ruta no resuelta</h1>
            <p>
              No encontramos al autor <code>"{authorSlug}"</code> ni al post <code>"{postSlug}"</code>.
            </p>
            <Link href="/authors" class="btn btn-primary">
              ← Explorar autores
            </Link>
          </div>
        );
      }

      // ── Nivel 2: el post existe pero NO pertenece a este autor ──
      if (!result.ok && result.reason === 'orphan') {
        const post = db.findPost(postSlug)!;
        const realAuthor = db.findAuthor(post.authorSlug)!;
        return (
          <div class="notfound-block">
            <span class="notfound-emoji">🔀</span>
            <h1>Este post no pertenece a este autor</h1>
            <p>
              <strong>"{post.title}"</strong> existe en los datos pre-construidos, pero su autor es{' '}
              {realAuthor.avatar} {realAuthor.name}, no quien buscabas.
            </p>
            <div class="orphan-actions">
              <Link href={`/authors/${realAuthor.slug}/posts/${post.slug}`} class="btn btn-primary">
                Ir a la URL correcta →
              </Link>
              <Link href={`/blog/${post.slug}`} class="btn btn-ghost">
                Ver el post normal
              </Link>
            </div>
          </div>
        );
      }

      // ── Resolución exitosa ──
      const { author, post } = result.value!;
      const body = db.findBody(post.slug)!;
      const related = db.relatedPosts(post.slug, 3);

      return (
        <div>
          <BreadcrumbsMarkup
            items={[
              { label: 'Inicio', href: '/' },
              { label: author.name, href: `/authors/${author.slug}` },
              { label: post.title },
            ]}
          />

          <article class="post-article">
            <header class="post-header post-header-contextual">
              <div class="contextual-badge">
                {author.avatar} Ruta anidada: /authors/{author.slug}/posts/{post.slug}
              </div>
              <h1 class="post-title">{post.title}</h1>
              <p class="post-excerpt">{post.excerpt}</p>
              <div class="post-byline">
                <Link href={`/authors/${author.slug}`} class="post-author-link">
                  <span class="author-avatar">{author.avatar}</span>
                  <span>
                    <strong>{author.name}</strong>
                    <span class="post-author-role">{author.role}</span>
                  </span>
                </Link>
                <span class="post-date">{post.date}</span>
              </div>
            </header>

            <div class="prose">
              <p class="prose-intro">{body.intro}</p>
              {body.sections.map((section) => (
                <section class="prose-section">
                  <h2>{section.heading}</h2>
                  {section.paragraphs.map((para) => (
                    <p>{para}</p>
                  ))}
                </section>
              ))}
              <blockquote class="prose-quote">“{body.quote}”</blockquote>
            </div>

            <section class="post-contextual-list">
              <h2>Más artículos de {author.name}</h2>
              <div class="card-grid">
                {db
                  .postsByAuthor(author.slug)
                  .filter((p) => p.slug !== post.slug)
                  .slice(0, 3)
                  .map((p) => PostCardMarkup(p))}
              </div>
            </section>

            {related.length > 0 && (
              <section class="post-related">
                <h2>Relacionados</h2>
                <div class="card-grid">{related.map((p) => PostCardMarkup(p))}</div>
              </section>
            )}
          </article>
        </div>
      );
    })()}
  </div>
));
