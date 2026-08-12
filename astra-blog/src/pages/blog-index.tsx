/**
 * astra-blog — Blog index
 *
 * Ruta fija /blog con filtros reactivos sobre datos pre-construidos:
 * búsqueda de texto + filtro por categoría. Cada tecla re-filtra el
 * índice ya inlinado — sin fetch, sin debounce contra una API.
 */
import { component, store } from '@astrajs/core';
import { db } from '../db.js';
import { PostCardMarkup } from '../components/post-card.js';

export const BlogIndexPage = component(() => {
  const state = store({ q: '' as string, cat: null as string | null });

  return (
    <div class="page wrap">
      <section class="static-hero static-hero-sm">
        <h1>Blog</h1>
        <p class="static-sub">
          {db.stats().posts} artículos pre-construidos. La búsqueda filtra constantes ya inlinadas:
          cero peticiones, cero latencia.
        </p>
        <div class="blog-tools">
          <input
            class="search-input"
            type="search"
            placeholder="Buscar por título, extracto o tag…"
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
              Todas
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
                {list.length} {list.length === 1 ? 'resultado' : 'resultados'}
                {state.q ? ` para "${state.q}"` : ''}
              </p>
              {list.length === 0 ? (
                <div class="empty-state">
                  <span class="empty-icon">🔍</span>
                  <h3>Sin resultados</h3>
                  <p>
                    Nada coincide con "{state.q}". Prueba con otro término o limpia el filtro de categoría.
                  </p>
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
