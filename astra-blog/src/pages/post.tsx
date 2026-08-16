/**
 * astra-blog — Post detail
 *
 * RUTA DINÁMICA: /blog/:slug
 *
 * La página lee params.slug (proxy reactivo del router) y resuelve el
 * post contra las constantes pre-construidas. Navegar de un post a otro
 * re-evalúa la expresión y re-renderiza solo lo necesario — sin fetch.
 */
import { component } from 'astrajs.dev/core';
import { params, Link } from 'astrajs.dev/router';
import { db } from '../db.js';
import { BreadcrumbsMarkup } from '../components/site-chrome.js';
import { PostCardMarkup } from '../components/post-card.js';

export const PostPage = component(() => (
  <div class="page wrap">
    {(() => {
      const slug = params.slug as string;
      const post = db.findPost(slug);
      const body = db.findBody(slug);

      if (!post || !body) {
        return (
          <div class="notfound-block">
            <span class="notfound-emoji">📄</span>
            <h1>Post no encontrado</h1>
            <p>
              No hay ningún artículo con el slug <code>"{slug}"</code> en los datos pre-construidos.
            </p>
            <Link href="/blog" class="btn btn-primary">
              ← Volver al blog
            </Link>
          </div>
        );
      }

      const author = db.findAuthor(post.authorSlug);
      const category = db.findCategory(post.categorySlug);
      const comments = db.commentsFor(post.slug);
      const related = db.relatedPosts(post.slug, 3);

      return (
        <article class="post-article">
          <BreadcrumbsMarkup
            items={[
              { label: 'Inicio', href: '/' },
              { label: 'Blog', href: '/blog' },
              { label: post.title },
            ]}
          />

          <header class="post-header">
            <div class="post-kicker">
              <Link href={`/categories/${post.categorySlug}`} class="post-category">
                {category?.icon} {category?.name ?? post.categorySlug}
              </Link>
              <span class="post-reading">☕ {post.readingMinutes} min de lectura</span>
              <span class="post-views">👁 {post.views.toLocaleString('es')} vistas</span>
            </div>
            <h1 class="post-title">{post.title}</h1>
            <p class="post-excerpt">{post.excerpt}</p>
            <div class="post-byline">
              <Link href={`/authors/${post.authorSlug}`} class="post-author-link">
                <span class="author-avatar">{author?.avatar}</span>
                <span>
                  <strong>{author?.name ?? post.authorSlug}</strong>
                  <span class="post-author-role">{author?.role}</span>
                </span>
              </Link>
              <span class="post-date">Publicado el {post.date}</span>
            </div>
            <div class="post-tags">
              {post.tags.map((tag) => (
                <Link href={`/tags/${tag}`} class="tag-chip tag-link">
                  #{tag}
                </Link>
              ))}
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

            <h2>En resumen</h2>
            <ul class="prose-bullets">
              {body.bullets.map((bullet) => (
                <li>{bullet}</li>
              ))}
            </ul>

            <blockquote class="prose-quote">“{body.quote}”</blockquote>

            <h2>Ficha técnica</h2>
            <div class="code-block">
              <div class="code-block-title">{body.codeTitle}</div>
              <pre>
                <code>{body.code}</code>
              </pre>
            </div>
          </div>

          {/* ── Comentarios (también pre-construidos) ── */}
          <section class="post-comments">
            <h2>Comentarios ({comments.length})</h2>
            {comments.length === 0 ? (
              <p class="comments-empty">Sé la primera persona en comentar (en el próximo build).</p>
            ) : (
              <div class="comment-list">
                {comments.map((comment) => (
                  <div class="comment">
                    <div class="comment-head">
                      <strong>{comment.author}</strong>
                      <span>{comment.date}</span>
                    </div>
                    <p>{comment.text}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Artículos relacionados ── */}
          {related.length > 0 && (
            <section class="post-related">
              <h2>Relacionados</h2>
              <div class="card-grid">{related.map((p) => PostCardMarkup(p))}</div>
            </section>
          )}
        </article>
      );
    })()}
  </div>
));
