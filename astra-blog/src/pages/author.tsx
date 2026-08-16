/**
 * astra-blog — Author profile
 *
 * RUTA DINÁMICA: /authors/:authorSlug
 */
import { component } from 'astrajs.dev/core';
import { params, Link } from 'astrajs.dev/router';
import { db } from '../db.js';
import { BreadcrumbsMarkup } from '../components/site-chrome.js';
import { PostCardMarkup } from '../components/post-card.js';

export const AuthorPage = component(() => (
  <div class="page wrap">
    {(() => {
      const author = db.findAuthor(params.authorSlug as string);
      if (!author) {
        return (
          <div class="notfound-block">
            <span class="notfound-emoji">👤</span>
            <h1>Autor no encontrado</h1>
            <p>
              No hay ningún autor con el slug <code>"{params.authorSlug}"</code>.
            </p>
            <Link href="/" class="btn btn-primary">
              ← Volver al inicio
            </Link>
          </div>
        );
      }

      const posts = db.postsByAuthor(author.slug);
      const totalViews = posts.reduce((sum, p) => sum + p.views, 0);

      return (
        <div>
          <BreadcrumbsMarkup
            items={[{ label: 'Inicio', href: '/' }, { label: 'Autores' }, { label: author.name }]}
          />

          <section class="author-profile">
            <span class="author-avatar author-avatar-lg">{author.avatar}</span>
            <div class="author-profile-main">
              <h1 class="post-title">{author.name}</h1>
              <p class="author-role">{author.role}</p>
              <p class="author-bio">{author.bio}</p>
              <div class="author-meta">
                <span>📍 {author.location}</span>
                <span>🗓 Desde {author.joined}</span>
                <span>
                  👁 {totalViews.toLocaleString('es')} vistas acumuladas
                </span>
              </div>
              <div class="author-socials">
                <a href={`https://github.com/${author.socials.github}`} target="_blank" rel="noopener">
                  GitHub
                </a>
                <a href="https://x.com" target="_blank" rel="noopener">
                  {author.socials.x}
                </a>
                <a href={`https://${author.socials.site}`} target="_blank" rel="noopener">
                  {author.socials.site}
                </a>
              </div>
            </div>
            <div class="author-stats">
              <div class="author-stat">
                <span class="author-stat-num">{posts.length}</span>
                <span class="author-stat-lbl">artículos</span>
              </div>
              <div class="author-stat">
                <span class="author-stat-num">{author.specialties.length}</span>
                <span class="author-stat-lbl">especialidades</span>
              </div>
            </div>
          </section>

          <section class="section">
            <h2 class="section-title">Especialidades</h2>
            <div class="specialty-list">
              {author.specialties.map((s) => (
                <span class="specialty-chip">{s}</span>
              ))}
            </div>
          </section>

          <section class="section">
            <h2 class="section-title">Artículos de {author.name}</h2>
            {posts.length === 0 ? (
              <p class="empty-state">Todavía no publica artículos.</p>
            ) : (
              <div class="card-grid">{posts.map((post) => PostCardMarkup(post))}</div>
            )}
          </section>
        </div>
      );
    })()}
  </div>
));
