/**
 * astra-blog — App entry
 *
 * 100% pre-built requests: ningún fetch, ninguna API en runtime.
 * Todas las rutas (fijas y dinámicas anidadas) se resuelven contra
 * las constantes que el compilador inlinó en build time.
 */
import { component } from 'astrajs.dev/core';
import { route, fallbackRoute } from 'astrajs.dev/router';
import { SiteHeaderMarkup, SiteFooterMarkup } from './components/site-chrome.js';
import { HomePage } from './pages/home.js';
import { BlogIndexPage } from './pages/blog-index.js';
import { PostPage } from './pages/post.js';
import { AuthorPage } from './pages/author.js';
import { AuthorPostPage } from './pages/author-post.js';
import { CategoryPage } from './pages/category.js';
import { CategoryTagPage } from './pages/category-tag.js';
import { TagPage } from './pages/tag.js';
import { AboutPage } from './pages/about.js';
import { ContactPage } from './pages/contact.js';
import { NotFoundPage } from './pages/not-found.js';

export const App = component(() => (
  <div class="blog-shell">
    {SiteHeaderMarkup()}
    <main class="blog-main">
      {(() => {
        // ── Rutas fijas ──
        if (route('/', { exact: true })) return <HomePage />;
        if (route('/blog', { exact: true })) return <BlogIndexPage />;
        if (route('/about', { exact: true })) return <AboutPage />;
        if (route('/contact', { exact: true })) return <ContactPage />;

        // ── Dinámicas sobre dinámicas (van ANTES que sus prefijos) ──
        if (route('/authors/:authorSlug/posts/:postSlug')) return <AuthorPostPage />;
        if (route('/categories/:categorySlug/tags/:tagSlug')) return <CategoryTagPage />;

        // ── Dinámicas simples ──
        if (route('/authors/:authorSlug', { exact: true })) return <AuthorPage />;
        if (route('/categories/:categorySlug', { exact: true })) return <CategoryPage />;
        if (route('/tags/:tagSlug')) return <TagPage />;
        if (route('/blog/:slug')) return <PostPage />;

        // ── 404 ──
        if (fallbackRoute()) return <NotFoundPage />;
        return <HomePage />;
      })()}
    </main>
    {SiteFooterMarkup()}
  </div>
));
