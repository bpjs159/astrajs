/**
 * astra-blog — site chrome
 *
 * Header, footer y breadcrumbs como funciones puras que retornan JSX.
 * (No son component(): se invocan dentro de expresiones reactivas de
 * las páginas, que ya re-evalúan cuando cambia la ruta.)
 */
import { Link, navigate } from 'astrajs.dev/router';
import { WORLD_LOCALES } from 'astrajs.dev/i18n';
import { db } from '../db.js';
import { i18n, navKey } from '../i18n.js';

/** Título de columna del footer (config pre-built) → clave i18n. */
const FOOTER_COLUMN_KEYS: Record<string, string> = {
  'Categorías': 'footer.categories',
  'Autores': 'footer.authors',
  'Sitio': 'footer.site',
};

/** Etiquetas del nav principal (usa claves propias, no las de los links del footer). */
const NAV_KEYS: Record<string, string> = {
  '/': 'nav.home',
  '/blog': 'nav.blog',
  '/categories/asia': 'nav.regions',
  '/authors/luna-vega': 'nav.authors',
  '/about': 'nav.about',
  '/contact': 'nav.contact',
};

function LangSelectMarkup(extraStyle = ''): JSX.Element {
  return (
    <select
      class="lang-select"
      style={extraStyle}
      aria-label="Language"
      value={i18n.locale}
      onchange={(e: Event) => {
        i18n.setLocale((e.target as HTMLSelectElement).value);
      }}
    >
      {WORLD_LOCALES.map((loc) => (
        <option value={loc.code} selected={i18n.locale === loc.code}>
          {loc.label}
        </option>
      ))}
    </select>
  );
}

export function BrandMarkup(): JSX.Element {
  return (
    <Link href="/" class="brand">
      <span class="brand-logo">
        <span class="bl-first">A</span>
        <span>STRA</span><span class="bl-js">JS</span>
      </span>
      <span class="brand-name">{db.site().name}</span>
    </Link>
  );
}

export function SiteHeaderMarkup(): JSX.Element {
  return (
    <header class="site-header">
      <div class="site-header-inner">
        {BrandMarkup()}
        <nav class="site-nav">
          {db.site().nav.map((item) => (
            <a
              href={item.href}
              class="nav-link"
              onclick={(e: Event) => {
                e.preventDefault();
                navigate(item.href);
              }}
            >
              {i18n.t(NAV_KEYS[item.href] ?? navKey(item.href))}
            </a>
          ))}
          {LangSelectMarkup()}
          <a
            class="nav-link docs-link"
            href="https://astrajs.dev"
            target="_blank"
            rel="noopener"
          >
            Volver a Docs ↗
          </a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooterMarkup(): JSX.Element {
  const footer = db.site().footer;
  return (
    <footer class="site-footer">
      <div class="footer-inner">
        <div class="footer-about">
          <div class="footer-brand">
            <span class="brand-logo">
              <span class="bl-first">A</span>
              <span>STRA</span><span class="bl-js">JS</span>
            </span>
            {' ' + db.site().name}
          </div>
          <p>{i18n.t('footer.about')}</p>
          <div class="footer-socials">
            {db.site().socials.map((s) => (
              <a href={s.href} target="_blank" rel="noopener">
                {s.label}
              </a>
            ))}
          </div>
        </div>
        {footer.columns.map((col) => (
          <div class="footer-col">
            <div class="footer-col-title">{i18n.t(FOOTER_COLUMN_KEYS[col.title] ?? col.title)}</div>
            {col.links.map((link) => (
              <a
                href={link.href}
                class="footer-link"
                onclick={(e: Event) => {
                  e.preventDefault();
                  navigate(link.href);
                }}
              >
                {i18n.t(navKey(link.href))}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div class="footer-bottom">© 2026 {db.site().name} · {i18n.t('footer.bottom')}</div>
    </footer>
  );
}

export function BreadcrumbsMarkup(props: { items: { label: string; href?: string }[] }): JSX.Element {
  return (
    <nav class="crumbs" aria-label="breadcrumb">
      {props.items.map((item, i) => (
        <span class="crumb">
          {i > 0 && <span class="crumb-sep">/</span>}
          {item.href ? <Link href={item.href}>{item.label}</Link> : <span class="crumb-current">{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}
