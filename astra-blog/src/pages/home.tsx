/**
 * astra-blog — Home
 *
 * Página fija con mucha información, 100% resuelta con datos
 * pre-construidos: featured, recientes, categorías, autores y stats.
 */
import { component } from 'astrajs.dev/core';
import { Link, navigate } from 'astrajs.dev/router';
import { db } from '../db.js';
import { i18n } from '../i18n.js';
import { PostCardMarkup } from '../components/post-card.js';

export const HomePage = component(() => {
  const site = db.site();
  const stats = db.stats();

  return (
    <div class="page page-home">
      {/* ── Hero ── */}
      <section class="hero">
        <div class="hero-badge">{i18n.t('hero.badge')}</div>
        <h1 class="hero-title">
          {site.name} <span class="hero-accent">{i18n.t('hero.accent')}</span>
        </h1>
        <p class="hero-sub">{site.description}</p>
        <div class="hero-actions">
          <a
            href="/blog"
            class="btn btn-primary"
            onclick={(e: Event) => {
              e.preventDefault();
              navigate('/blog');
            }}
          >
            {i18n.t('hero.read')}
          </a>
          <a
            href="/about"
            class="btn btn-ghost"
            onclick={(e: Event) => {
              e.preventDefault();
              navigate('/about');
            }}
          >
            {i18n.t('hero.how')}
          </a>
        </div>
        <div class="hero-stats">
          <div class="hero-stat">
            <span class="hero-stat-num">{stats.posts}</span>
            <span class="hero-stat-lbl">{i18n.t('hero.posts')}</span>
          </div>
          <div class="hero-stat">
            <span class="hero-stat-num">{stats.words.toLocaleString('es')}</span>
            <span class="hero-stat-lbl">{i18n.t('hero.words')}</span>
          </div>
          <div class="hero-stat">
            <span class="hero-stat-num">{stats.authors}</span>
            <span class="hero-stat-lbl">{i18n.t('hero.authors')}</span>
          </div>
          <div class="hero-stat">
            <span class="hero-stat-num">{stats.categories}</span>
            <span class="hero-stat-lbl">{i18n.t('hero.categories')}</span>
          </div>
        </div>
      </section>

      {/* ── Featured ── */}
      <section class="wrap section">
        <div class="section-head">
          <h2 class="section-title">{i18n.t('sec.featured')}</h2>
          <a
            href="/blog"
            class="section-link"
            onclick={(e: Event) => {
              e.preventDefault();
              navigate('/blog');
            }}
          >
            {i18n.t('sec.all')}
          </a>
        </div>
        <div class="card-grid">
          {db.featuredPosts(4).map((post) => PostCardMarkup(post))}
        </div>
      </section>

      {/* ── Recientes + categorías ── */}
      <section class="wrap section split">
        <div class="split-main">
          <h2 class="section-title">{i18n.t('sec.recent')}</h2>
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
          <h2 class="section-title">{i18n.t('sec.categories')}</h2>
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
          <h2 class="section-title section-title-mt">{i18n.t('sec.popularTags')}</h2>
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
        <h2 class="section-title">{i18n.t('sec.authors')}</h2>
        <div class="author-grid">
          {db.listAuthors().map((author) => (
            <Link href={`/authors/${author.slug}`} class="author-mini">
              <span class="author-avatar">{author.avatar}</span>
              <span class="author-mini-name">{author.name}</span>
              <span class="author-mini-role">{author.role}</span>
              <span class="author-mini-count">{db.postsByAuthor(author.slug).length} {i18n.t('author.posts', { count: db.postsByAuthor(author.slug).length })}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section class="wrap section cta">
        <h2>{i18n.t('cta.title')}</h2>
        <p>{i18n.t('cta.text', { posts: stats.posts, words: stats.words.toLocaleString('es') })}</p>
        <a
          href="/blog/pre-build-requests"
          class="btn btn-primary"
          onclick={(e: Event) => {
            e.preventDefault();
            navigate('/blog/pre-build-requests');
          }}
        >
          {i18n.t('cta.button')}
        </a>
      </section>
    </div>
  );
});
