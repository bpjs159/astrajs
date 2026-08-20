/**
 * Layout — header/footer. `HeaderStatic` renders the chrome with a plain
 * cart count (used by the SSR prerender); the client `Header` wraps it in
 * dynamic bindings so labels re-translate and the badge updates live.
 */
import { dynamic } from 'astrajs.dev/core';
import { t, LOCALES, setLocale, currentLocale } from '../i18n.js';
import { clientState, navigate } from '../client-state.js';

function navLink(path: string, label: string, active: boolean): JSX.Element {
  return (
    <a
      href={path}
      class={active ? 'active' : ''}
      onclick={(e) => {
        e.preventDefault();
        navigate(path);
      }}
    >
      {label}
    </a>
  );
}

export function HeaderStatic(cartCount: number): JSX.Element {
  return (
    <header class="site-header">
      <div class="brand-logo" onclick={() => navigate('/')}>
        <span class="bl-first">A</span>
        <span>STRA</span><span class="bl-js">JS</span>
        <span class="brand-sub">Store</span>
      </div>
      <nav class="site-nav">
        <a href="/" onclick={(e) => { e.preventDefault(); navigate('/'); }}>{t('nav.home')}</a>
        <a href="/products" onclick={(e) => { e.preventDefault(); navigate('/products'); }}>{t('nav.products')}</a>
        <a href="/cart" onclick={(e) => { e.preventDefault(); navigate('/cart'); }}>
          {t('nav.cart')}
          {cartCount > 0 ? <span class="cart-badge">{cartCount}</span> : null}
        </a>
        <a href="/orders" onclick={(e) => { e.preventDefault(); navigate('/orders'); }}>{t('nav.orders')}</a>
        <a href="/about" onclick={(e) => { e.preventDefault(); navigate('/about'); }}>{t('nav.about')}</a>
      </nav>
      <div class="header-right">
        <a class="docs-link" href="https://astrajs.dev" target="_blank" rel="noopener">Volver a Docs ↗</a>
        <select
          class="lang-select"
          onchange={(e) => setLocale((e.currentTarget as HTMLSelectElement).value)}
        >
          {LOCALES.map((l) => (
            <option value={l.code} selected={l.code === currentLocale()}>{l.label}</option>
          ))}
        </select>
      </div>
    </header>
  );
}

export function FooterStatic(): JSX.Element {
  return (
    <footer class="site-footer">
      {t('footer')} · <a class="link" href="/products" onclick={(e) => { e.preventDefault(); navigate('/products'); }}>{t('nav.products')}</a>
    </footer>
  );
}

/** Client header — reactive translation + live cart badge. */
export function Header(): JSX.Element {
  return (
    <div class="header-wrap">
      {dynamic(() => HeaderStatic(clientState.cartCount))}
    </div>
  );
}

/** Client footer — reactive translation. */
export function Footer(): JSX.Element {
  return <div class="footer-wrap">{dynamic(() => FooterStatic())}</div>;
}

export { navLink };
