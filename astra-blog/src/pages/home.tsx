/**
 * astra-blog — Home
 *
 * Página fija con mucha información, 100% resuelta con datos
 * pre-construidos: featured, recientes, categorías, autores y stats.
 */
import { component } from '@astrajs/core';
import { Link } from '@astrajs/router';
import { db } from '../db.js';
import { PostCardMarkup } from '../components/post-card.js';

export const HomePage = component(() => {
  const site = db.site();
  const stats = db.stats();

  return (
    <div class="page page-home">
      {/* ── Hero ── */}
      <section class="hero">
        <div class="hero-badge">100% pre-built requests · 0 fetch en runtime</div>
        <h1 class="hero-title">
          {site.name} <span class="hero-accent">pre-construido</span>
        </h1>
        <p class="hero-sub">{site.description}</p>
        <div class="hero-actions">
          <Link href="/blog" class="btn btn-primary">
            Leer el blog →
          </Link>
          <Link href="/about" class="btn btn-ghost">
            Cómo funciona
          </Link>
        </div>
        <div class="hero-stats">
          <div class="hero-stat">
            <span class="hero-stat-num">{stats.posts}</span>
            <span class="hero-stat-lbl">artículos</span>
          </div>
          <div class="hero-stat">
            <span class="hero-stat-num">{stats.words.toLocaleString('es')}</span>
            <span class="hero-stat-lbl">palabras inlinadas</span>
          </div>
          <div class="hero-stat">
            <span class="hero-stat-num">{stats.authors}</span>
            <span class="hero-stat-lbl">autores</span>
          </div>
          <div class="hero-stat">
            <span class="hero-stat-num">{stats.categories}</span>
            <span class="hero-stat-lbl">categorías</span>
          </div>
        </div>
      </section>

      {/* ── Featured ── */}
      <section class="wrap section">
        <div class="section-head">
          <h2 class="section-title">Destacados</h2>
          <Link href="/blog" class="section-link">
            Ver todos →
          </Link>
        </div>
        <div class="card-grid">
          {db.featuredPosts(4).map((post) => PostCardMarkup(post))}
        </div>
      </section>

      {/* ── Recientes + categorías ── */}
      <section class="wrap section split">
        <div class="split-main">
          <h2 class="section-title">Recientes</h2>
          <div class="recent-list">
            {db.recentPosts(6).map((post) => {
              const author = db.findAuthor(post.authorSlug);
              return (
                <Link href={`/blog/${post.slug}`} class="recent-item">
                  <div class="recent-main">
                    <span class="recent-title">{post.title}</span>
                    <span class="recent-excerpt">{post.excerpt}</span>
                  </div>
                  <div class="recent-meta">
                    <span>{author?.avatar} {author?.name}</span>
                    <span>{post.date}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
        <aside class="split-side">
          <h2 class="section-title">Categorías</h2>
          <div class="category-list">
            {db.listCategories().map((cat) => (
              <Link href={`/categories/${cat.slug}`} class="category-item">
                <span class="category-icon">{cat.icon}</span>
                <span class="category-main">
                  <span class="category-name">{cat.name}</span>
                  <span class="category-desc">{cat.description}</span>
                </span>
                <span class="category-count">{db.postsByCategory(cat.slug).length}</span>
              </Link>
            ))}
          </div>
          <h2 class="section-title section-title-mt">Tags populares</h2>
          <div class="tag-cloud">
            {db.listTags().slice(0, 10).map((t) => (
              <Link href={`/tags/${t.slug}`} class="tag-chip tag-link">
                #{t.slug} <span class="tag-count">{t.count}</span>
              </Link>
            ))}
          </div>
        </aside>
      </section>

      {/* ── Autores ── */}
      <section class="wrap section">
        <h2 class="section-title">Quiénes escriben</h2>
        <div class="author-grid">
          {db.listAuthors().map((author) => (
            <Link href={`/authors/${author.slug}`} class="author-mini">
              <span class="author-avatar">{author.avatar}</span>
              <span class="author-mini-name">{author.name}</span>
              <span class="author-mini-role">{author.role}</span>
              <span class="author-mini-count">{db.postsByAuthor(author.slug).length} artículos</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section class="wrap section cta">
        <h2>¿Todo esto sin un solo fetch?</h2>
        <p>
          Este sitio resolvió sus {stats.posts} artículos y {stats.words.toLocaleString('es')} palabras durante el
          build. El navegador solo recibe las respuestas, impresas en el HTML.
        </p>
        <Link href="/blog/pre-build-requests" class="btn btn-primary">
          Leer "Pre-built requests" →
        </Link>
      </section>
    </div>
  );
});
