import { Link, navigate } from 'astrajs.dev/router';
import { i18n } from '../i18n.js';
import { BrandLogo } from './brand-logo.js';

export function Footer(): JSX.Element {
  const style = `
    .site-footer{border-top:1px solid rgba(255,255,255,.06);background:transparent;padding:48px 0 32px}
    /* Docs pages: keep the footer clear of the fixed 260px sidebar. */
    main:has(.docs-sidebar) + .site-footer{padding-left:260px}
    .footer-inner{max-width:1400px;margin:0 auto;padding:0 32px;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:24px}
    .footer-brand{display:flex;align-items:center;gap:10px}
    .footer-brand .footer-wordmark{font-size:1.15rem;font-weight:700}
    .footer-links{display:flex;gap:24px}
    .footer-links a{font-size:.8rem;color:#64748b;font-weight:500;transition:color .15s}
    .footer-links a:hover{color:#e2e8f0}
    .footer-copy{font-size:.78rem;color:#475569}
    @media(max-width:960px){
      main:has(.docs-sidebar) + .site-footer{padding-left:0}
    }
    @media(max-width:640px){
      .footer-inner{flex-direction:column;text-align:center}
      .footer-links{flex-wrap:wrap;justify-content:center}
    }
  `;

  return (
    <footer class="site-footer">
      <style>{style}</style>
      <div class="footer-inner">
        <div class="footer-brand">
          <BrandLogo cls="footer-wordmark" />
        </div>
        <div class="footer-links">
          <a href="/docs/introduction" onclick={(e: Event) => { e.preventDefault(); navigate('/docs/introduction'); }}>{i18n.t('footer.docs')}</a>
          <a href="/docs/server-data" onclick={(e: Event) => { e.preventDefault(); navigate('/docs/server-data'); }}>API</a>
          <a href="https://github.com" target="_blank" rel="noopener">GitHub</a>
          <a href="https://discord.com" target="_blank" rel="noopener">Discord</a>
          <a href="https://x.com" target="_blank" rel="noopener">X (Twitter)</a>
        </div>
        <p class="footer-copy">© {new Date().getFullYear()} AstraJS. {i18n.t('footer.license')}.</p>
      </div>
    </footer>
  );
}
