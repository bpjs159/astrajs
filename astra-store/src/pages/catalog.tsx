/**
 * Catalog — search + category filter, powered by the ISR-tagged catalog RPC.
 */
import { dynamic, store } from 'astrajs.dev/core';
import { t, currentLocale } from '../i18n.js';
import { ProductCard } from '../components/product-card.js';
import type { ProductCardData } from '../components/product-card.js';
import { getCatalog, getCategories, searchProducts } from '../server/store.server.js';

export function CatalogView(list: ProductCardData[]): JSX.Element {
  return (
    <div class="grid">
      {list.map((p) => <ProductCard {...p} />)}
    </div>
  );
}

export function CatalogPage(initial: string = 'all'): JSX.Element {
  const ui = store({
    list: [] as ProductCardData[],
    category: initial,
    query: '',
    cats: [] as Array<{ slug: string; name: string; emoji: string }>,
  });

  function load(): void {
    getCatalog(ui.category, currentLocale()).then((r) => { ui.list = r as ProductCardData[]; });
  }
  load();
  getCategories(currentLocale()).then((r) => { ui.cats = r; });

  return (
    <div>
      <h2 class="section-title">{t('section.catalog')}</h2>
      <input
        class="search"
        type="text"
        placeholder={t('search.placeholder')}
        oninput={(e) => {
          const q = (e.currentTarget as HTMLInputElement).value;
          ui.query = q;
          if (q.trim()) {
            searchProducts(q, currentLocale()).then((r) => { ui.list = r as ProductCardData[]; });
          } else {
            load();
          }
        }}
      />
      <div class="block">
        <span
          class={ui.category === 'all' ? 'pill active' : 'pill'}
          onclick={() => { ui.category = 'all'; load(); }}
        >
          {t('filter.all')}
        </span>
        {ui.cats.map((c) => (
          <span
            class={ui.category === c.slug ? 'pill active' : 'pill'}
            onclick={() => { ui.category = c.slug; load(); }}
          >
            {c.emoji} {c.name}
          </span>
        ))}
      </div>
      {dynamic(() => CatalogView(ui.list))}
    </div>
  );
}
