import { Link, navigate } from '@astrajs/router';
import { i18n } from '../i18n.js';

export function Footer(): JSX.Element {
  const style = `
    .site-footer{border-top:1px solid rgba(255,255,255,.06);background:rgba(4,6,13,.6);padding:48px 0 32px;margin-top:80px}
    .footer-inner{max-width:1400px;margin:0 auto;padding:0 32px;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:24px}
    .footer-brand{display:flex;align-items:center;gap:10px}
    .footer-brand img{height:28px;width:auto;object-fit:contain}
    .footer-brand span{font-family:'Fauna Pro',serif;font-size:1.1rem;font-weight:700;color:#f7f7ff}
    .footer-links{display:flex;gap:24px}
    .footer-links a{font-size:.8rem;color:#64748b;font-weight:500;transition:color .15s}
    .footer-links a:hover{color:#e2e8f0}
    .footer-copy{font-size:.78rem;color:#475569}
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
          <img src="/images/logo.png" alt="AstraJS" />
          <span>ASTRAJS</span>
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
