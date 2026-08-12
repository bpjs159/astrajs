/**
 * astra-blog — db-core.ts
 *
 * Capa de consultas PURA (sin imports de prebuilt.ts) que emula una
 * base de datos sobre el snapshot pre-construido. Las páginas nunca
 * tocan los datos crudos: siempre pasan por estas funciones, igual
 * que pasarían por un ORM o un cliente de base de datos.
 *
 * Diseñada para testearse sin DOM ni compilador: los tests construyen
 * fixtures y verifican la resolución de rutas dinámicas anidadas.
 */

// ─── Tipos (el "esquema" de la base de datos) ────────────────────────────────

export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  nav: { label: string; href: string }[];
  footer: {
    about: string;
    columns: { title: string; links: { label: string; href: string }[] }[];
  };
  socials: { label: string; href: string }[];
}

export interface Author {
  slug: string;
  name: string;
  role: string;
  avatar: string;
  location: string;
  joined: string;
  bio: string;
  socials: { github: string; x: string; site: string };
  specialties: string[];
}

export interface Category {
  slug: string;
  name: string;
  icon: string;
  description: string;
}

export interface PostMeta {
  slug: string;
  authorSlug: string;
  categorySlug: string;
  title: string;
  excerpt: string;
  tags: string[];
  date: string;
  readingMinutes: number;
  featured: boolean;
  views: number;
}

export interface PostSection {
  heading: string;
  paragraphs: string[];
}

export interface PostBody {
  intro: string;
  sections: PostSection[];
  bullets: string[];
  quote: string;
  codeTitle: string;
  code: string;
}

export interface Comment {
  author: string;
  date: string;
  text: string;
}

export interface StaticPage {
  about: Record<string, unknown>;
  contact: Record<string, unknown>;
}

export interface BlogSnapshot {
  site: SiteConfig;
  authors: Author[];
  categories: Category[];
  tags: string[];
  posts: PostMeta[];
  bodies: Record<string, PostBody>;
  comments: Record<string, Comment[]>;
  pages: StaticPage;
}

// ─── Resultado de resolución (rutas dinámicas anidadas) ──────────────────────

export interface ResolveResult<T> {
  ok: boolean;
  reason?: 'missing' | 'orphan';
  value?: T;
}

// ─── El motor de consultas ───────────────────────────────────────────────────

export interface BlogDb {
  readonly snapshot: BlogSnapshot;
  site(): SiteConfig;
  listAuthors(): Author[];
  findAuthor(slug: string): Author | undefined;
  listCategories(): Category[];
  findCategory(slug: string): Category | undefined;
  listTags(): { slug: string; count: number }[];
  findTag(slug: string): string | undefined;
  listPosts(): PostMeta[];
  findPost(slug: string): PostMeta | undefined;
  findBody(slug: string): PostBody | undefined;
  featuredPosts(limit?: number): PostMeta[];
  recentPosts(limit?: number): PostMeta[];
  postsByAuthor(authorSlug: string): PostMeta[];
  postsByCategory(categorySlug: string): PostMeta[];
  postsByTag(tagSlug: string): PostMeta[];
  search(query: string): PostMeta[];
  relatedPosts(slug: string, limit?: number): PostMeta[];
  commentsFor(slug: string): Comment[];
  stats(): {
    posts: number;
    authors: number;
    categories: number;
    tags: number;
    words: number;
    totalViews: number;
  };
  pages(): StaticPage;
  /** Dinámica sobre dinámica: /authors/:authorSlug/posts/:postSlug */
  resolveAuthorPost(
    authorSlug: string,
    postSlug: string
  ): ResolveResult<{ author: Author; post: PostMeta }>;
  /** Intersección: /categories/:categorySlug/tags/:tagSlug */
  resolveCategoryTag(
    categorySlug: string,
    tagSlug: string
  ): ResolveResult<{ category: Category; tag: string; posts: PostMeta[] }>;
}

export function createDb(snapshot: BlogSnapshot): BlogDb {
  const posts = snapshot.posts ?? [];
  const bodies = snapshot.bodies ?? {};
  const authors = snapshot.authors ?? [];
  const categories = snapshot.categories ?? [];
  const tags = snapshot.tags ?? [];
  const comments = snapshot.comments ?? {};

  function findAuthor(slug: string): Author | undefined {
    return authors.find((a) => a.slug === slug);
  }

  function findCategory(slug: string): Category | undefined {
    return categories.find((c) => c.slug === slug);
  }

  function findTag(slug: string): string | undefined {
    return tags.find((t) => t === slug);
  }

  function findPost(slug: string): PostMeta | undefined {
    return posts.find((p) => p.slug === slug);
  }

  function byDateDesc(a: PostMeta, b: PostMeta): number {
    return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
  }

  function recentPosts(limit = 6): PostMeta[] {
    return [...posts].sort(byDateDesc).slice(0, limit);
  }

  function featuredPosts(limit = 4): PostMeta[] {
    return posts.filter((p) => p.featured).sort(byDateDesc).slice(0, limit);
  }

  function postsByAuthor(authorSlug: string): PostMeta[] {
    return posts.filter((p) => p.authorSlug === authorSlug).sort(byDateDesc);
  }

  function postsByCategory(categorySlug: string): PostMeta[] {
    return posts.filter((p) => p.categorySlug === categorySlug).sort(byDateDesc);
  }

  function postsByTag(tagSlug: string): PostMeta[] {
    return posts.filter((p) => p.tags.includes(tagSlug)).sort(byDateDesc);
  }

  function search(query: string): PostMeta[] {
    const q = query.trim().toLowerCase();
    if (!q) return recentPosts(12);
    return posts
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      )
      .sort(byDateDesc);
  }

  function relatedPosts(slug: string, limit = 3): PostMeta[] {
    const post = findPost(slug);
    if (!post) return [];
    const scored = posts
      .filter((p) => p.slug !== slug)
      .map((p) => {
        let score = 0;
        if (p.categorySlug === post.categorySlug) score += 3;
        for (const t of p.tags) if (post.tags.includes(t)) score += 2;
        if (p.authorSlug === post.authorSlug) score += 1;
        return { post: p, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score || byDateDesc(a.post, b.post));
    return scored.slice(0, limit).map((s) => s.post);
  }

  function commentsFor(slug: string): Comment[] {
    return comments[slug] ?? [];
  }

  function resolveAuthorPost(
    authorSlug: string,
    postSlug: string
  ): ResolveResult<{ author: Author; post: PostMeta }> {
    const author = findAuthor(authorSlug);
    if (!author) return { ok: false, reason: 'missing' };
    const post = findPost(postSlug);
    if (!post) return { ok: false, reason: 'missing' };
    if (post.authorSlug !== authorSlug) return { ok: false, reason: 'orphan' };
    return { ok: true, value: { author, post } };
  }

  function resolveCategoryTag(
    categorySlug: string,
    tagSlug: string
  ): ResolveResult<{ category: Category; tag: string; posts: PostMeta[] }> {
    const category = findCategory(categorySlug);
    if (!category) return { ok: false, reason: 'missing' };
    const tag = findTag(tagSlug);
    if (!tag) return { ok: false, reason: 'missing' };
    const list = postsByCategory(categorySlug).filter((p) => p.tags.includes(tagSlug));
    return { ok: true, value: { category, tag, posts: list } };
  }

  function stats() {
    let words = 0;
    for (const slug of Object.keys(bodies)) {
      const body = bodies[slug]!;
      words += (body.intro ?? '').split(/\s+/).filter(Boolean).length;
      for (const section of body.sections ?? []) {
        words += (section.heading ?? '').split(/\s+/).filter(Boolean).length;
        for (const para of section.paragraphs ?? []) {
          words += para.split(/\s+/).filter(Boolean).length;
        }
      }
    }
    return {
      posts: posts.length,
      authors: authors.length,
      categories: categories.length,
      tags: tags.length,
      words,
      totalViews: posts.reduce((sum, p) => sum + (p.views ?? 0), 0),
    };
  }

  return {
    snapshot,
    site: () => snapshot.site,
    pages: () => snapshot.pages,
    listAuthors: () => authors,
    findAuthor,
    listCategories: () => categories,
    findCategory,
    listTags: () =>
      tags
        .map((slug) => ({ slug, count: postsByTag(slug).length }))
        .sort((a, b) => b.count - a.count),
    findTag,
    listPosts: () => [...posts].sort(byDateDesc),
    findPost,
    findBody: (slug: string) => bodies[slug],
    featuredPosts,
    recentPosts,
    postsByAuthor,
    postsByCategory,
    postsByTag,
    search,
    relatedPosts,
    commentsFor,
    stats,
    resolveAuthorPost,
    resolveCategoryTag,
  };
}
