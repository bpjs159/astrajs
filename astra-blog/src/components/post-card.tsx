/**
 * astra-blog — post card
 *
 * Tarjeta de post reutilizada por home, índices y páginas de autor.
 * Función pura: se invoca dentro de listas dinámicas y re-evalúa
 * con cada cambio de ruta o filtro.
 */
import { Link } from 'astrajs.dev/router';
import { db } from '../db.js';
import type { PostMeta } from '../db-core.js';

export function PostCardMarkup(post: PostMeta): JSX.Element {
  const author = db.findAuthor(post.authorSlug);
  const category = db.findCategory(post.categorySlug);
  return (
    <Link href={`/blog/${post.slug}`} class="post-card">
      <div class="post-card-top">
        <span class="post-card-category">
          {category?.icon} {category?.name ?? post.categorySlug}
        </span>
        <span class="post-card-reading">{post.readingMinutes} min</span>
      </div>
      <h3 class="post-card-title">{post.title}</h3>
      <p class="post-card-excerpt">{post.excerpt}</p>
      <div class="post-card-meta">
        <span class="post-card-author">
          {author?.avatar} {author?.name ?? post.authorSlug}
        </span>
        <span class="post-card-date">{post.date}</span>
      </div>
      <div class="post-card-tags">
        {post.tags.slice(0, 3).map((tag) => (
          <span class="tag-chip">{tag}</span>
        ))}
        {post.tags.length > 3 && <span class="tag-chip tag-more">+{post.tags.length - 3}</span>}
      </div>
    </Link>
  );
}

export function TagChipMarkup(tag: string): JSX.Element {
  return (
    <Link href={`/tags/${tag}`} class="tag-chip tag-link">
      #{tag}
    </Link>
  );
}
