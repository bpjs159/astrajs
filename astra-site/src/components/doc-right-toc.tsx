import { component } from '@bpjs159/core';
import { i18n } from '../i18n.js';

/**
 * DocRightToc — right-hand "On this page" sidebar for docs pages.
 *
 * Usage:
 *   <DocRightToc items={[
 *     { href: '/docs/fundamentals#componentes', k: 'sb.components' },
 *     { href: '/docs/fundamentals#server', label: 'server()' },
 *   ]} />
 */

export interface TocItem {
  href: string;
  /** Literal label (technical term). */
  label?: string;
  /** i18n key that overrides the literal label when present. */
  k?: string;
}

const tocStyle = `
  .docs-right{position:fixed;top:64px;right:0;width:280px;padding:48px 36px;display:none;z-index:40;overscroll-behavior:contain}
  @media(min-width:1280px){.docs-right{display:block}}
  .toc-label{font-size:.64rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.1em;margin-bottom:12px}
  .toc-item{display:block;font-size:.76rem;color:#64748b;padding:5px 0 5px 12px;font-weight:500;transition:color .12s;border-left:2px solid transparent;text-decoration:none}
  .toc-item:hover{color:#e2e8f0}
  .toc-item.active{color:#b84cff;border-left-color:#b84cff}
`;

export const DocRightToc = component((props: { items: TocItem[] }) => {
  const currentHash = typeof window !== 'undefined' ? window.location.hash : '';
  const scrollToHash = (hash: string) => {
    const el = document.getElementById(hash);
    if (!el) return;
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    el.scrollIntoView({ block: 'start' });
    html.style.scrollBehavior = prev;
  };
  const onItemClick = (e: Event, href: string) => {
    e.preventDefault();
    const hash = href.split('#')[1];
    if (!hash) return;
    // Keep the URL in sync without triggering a full hash navigation
    // (the native hash scroll is unreliable under the SPA router).
    history.replaceState(null, '', '#' + hash);
    // The second pass covers slower renders. If the user starts scrolling
    // before a pending pass fires, cancel it so the page never yanks away.
    const timers = [
      window.setTimeout(() => scrollToHash(hash), 50),
      window.setTimeout(() => scrollToHash(hash), 300),
    ];
    const cancelPendingScroll = () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener('wheel', cancelPendingScroll);
    };
    window.addEventListener('wheel', cancelPendingScroll, { passive: true });
    document.querySelectorAll('.toc-item').forEach((a) => {
      a.classList.toggle('active', a.getAttribute('href')?.includes('#' + hash) ?? false);
    });
  };
  return (
    <aside class="docs-right">
      <style>{tocStyle}</style>
      <div class="toc-label">{i18n.t('d.toc')}</div>
      {props.items.map((it) => (
        <a
          href={it.href}
          class={`toc-item${currentHash === '#' + it.href.split('#')[1] ? ' active' : ''}`}
          onclick={(e: Event) => onItemClick(e, it.href)}
        >
          {it.k ? i18n.t(it.k) : (it.label ?? it.href)}
        </a>
      ))}
    </aside>
  );
});
