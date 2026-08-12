/**
 * astra-blog — site chrome
 *
 * Header, footer y breadcrumbs como funciones puras que retornan JSX.
 * (No son component(): se invocan dentro de expresiones reactivas de
 * las páginas, que ya re-evalúan cuando cambia la ruta.)
 */
import { Link } from '@astrajs/router';
import { db } from '../db.js';

export function BrandMarkup(): JSX.Element {
  return (
    <Link href="/" class="brand">
      <span class="brand-mark">◈</span>
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
            <Link href={item.href} class="nav-link">
              {item.label}
            </Link>
          ))}
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
            <span class="brand-mark">◈</span> {db.site().name}
          </div>
          <p>{footer.about}</p>
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
            <div class="footer-col-title">{col.title}</div>
            {col.links.map((link) => (
              <Link href={link.href} class="footer-link">
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div class="footer-bottom">
        © 2026 {db.site().name} · Construido con AstraJS · Todos los datos pre-construidos en build time
      </div>
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
