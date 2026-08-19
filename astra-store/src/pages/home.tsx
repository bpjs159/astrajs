/**
 * Home — hero, featured (pre-build constant), latest catalog (ISR) and
 * the AI shopping assistant (RAG over the catalog).
 */
import { dynamic, store } from 'astrajs.dev/core';
import { t, spanParts, currentLocale } from '../i18n.js';
import { navigate } from '../client-state.js';
import { ProductCard } from '../components/product-card.js';
import type { ProductCardData } from '../components/product-card.js';
import { getFeatured } from '../featured.js';
import type { FeaturedItem } from '../featured.js';
import { getCatalog, aiAsk } from '../server/store.server.js';
import { l10nProductName } from '../catalog-i18n.js';

// pre-build: the call is replaced by its INLINED data at compile time.
const featuredData = getFeatured as unknown as FeaturedItem[];

export function HomeView(featured: ProductCardData[], latest: ProductCardData[]): JSX.Element {
  const hero = spanParts('hero.title');
  return (
    <div>
      <section class="hero">
        <div>
          <h1>
            {hero.before}
            {hero.span ? <span>{hero.span}</span> : null}
            {hero.after}
          </h1>
          <p>{t('hero.sub')}</p>
          <p>
            <button class="btn" onclick={() => navigate('/products')}>{t('hero.cta')}</button>
          </p>
        </div>
      </section>

      <section class="block">
        <h2 class="section-title">{t('section.featured')}</h2>
        <div class="grid">
          {featured.map((p) => <ProductCard {...p} name={l10nProductName(p.id, currentLocale(), p.name)} />)}
        </div>
      </section>

      <section class="block">
        <h2 class="section-title">{t('section.catalog')}</h2>
        <div class="grid">
          {latest.map((p) => <ProductCard {...p} />)}
        </div>
      </section>
    </div>
  );
}

export function HomePage(): JSX.Element {
  const ui = store({
    latest: [] as ProductCardData[],
    answer: '',
    question: '',
    asking: false,
  });

  getCatalog('all', currentLocale()).then((list) => {
    ui.latest = list.slice(0, 8) as ProductCardData[];
  });

  return (
    <div>
      {dynamic(() => HomeView(featuredData, ui.latest))}

      <section class="block">
        <h2 class="section-title">{t('section.assistant')}</h2>
        <div class="assistant">
          <p class="err">{t('assistant.hint')}</p>
          <textarea
            value={ui.question}
            oninput={(e) => { ui.question = (e.currentTarget as HTMLTextAreaElement).value; }}
          />
          <p>
            <button
              class="btn"
              disabled={ui.asking}
              onclick={async () => {
                ui.asking = true;
                ui.answer = '';
                const text = await aiAsk(ui.question);
                ui.answer = text;
                ui.asking = false;
              }}
            >
              {t('assistant.btn')}
            </button>
          </p>
          {dynamic(() => (ui.answer ? <div class="answer">{ui.answer}</div> : <span></span>))}
        </div>
      </section>
    </div>
  );
}
