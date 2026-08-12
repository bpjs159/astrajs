/**
 * astra-blog — Blog index
 *
 * Ruta fija /blog con filtros reactivos sobre datos pre-construidos:
 * búsqueda de texto + filtro por categoría. Cada tecla re-filtra el
 * índice ya inlinado — sin fetch, sin debounce contra una API.
 */
import { component, store } from '@astrajs/core';
import { db } from '../db.js';
import { i18n } from '../i18n.js';
import { PostCardMarkup } from '../components/post-card.js';

export const BlogIndexPage = component(() => {
  const state = store({ q: '' as string, cat: null as string | null });

  return (
    <div class="page wrap">
      <section class="static-hero static-hero-sm">
        <h1>{i18n.t('nav.blog')}</h1>
        <p class="static-sub">{i18n.t('blog.subtitle', { posts: db.stats().posts })}</p>
        <div class="blog-tools">
          <input
            class="search-input"
            type="search"
            placeholder={i18n.t('blog.search')}
            onInput={(e: Event) => {
              state.q = (e.target as HTMLInputElement).value;
            }}
          />
          <div class="cat-filters">
            <button
              class={state.cat === null ? 'cat-filter active' : 'cat-filter'}
              onClick={() => {
                state.cat = null;
              }}
            >
              {i18n.t('blog.all')}
            </button>
            {db.listCategories().map((cat) => (
              <button
                class={state.cat === cat.slug ? 'cat-filter active' : 'cat-filter'}
                onClick={() => {
                  state.cat = cat.slug;
                }}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section class="section">
        {(() => {
          let list = db.search(state.q);
          if (state.cat !== null) list = list.filter((p) => p.categorySlug === state.cat);
          return (
            <div>
              <p class="result-count">
                {list.length} {i18n.t('blog.results', { count: list.length })}
                {state.q ? i18n.t('blog.resultsFor', { q: state.q }) : ''}
              </p>
              {list.length === 0 ? (
                <div class="empty-state">
                  <span class="empty-icon">🔍</span>
                  <h3>{i18n.t('blog.empty.title')}</h3>
                  <p>{i18n.t('blog.empty.text', { q: state.q })}</p>
                </div>
              ) : (
                <div class="card-grid">{list.map((post) => PostCardMarkup(post))}</div>
              )}
            </div>
          );
        })()}
      </section>
    </div>
  );
});
