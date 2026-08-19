/**
 * About — static page (also SSR-prerendered).
 */
import { t } from '../i18n.js';

export function AboutView(): JSX.Element {
  return (
    <div>
      <h2 class="section-title">{t('about.title')}</h2>
      <div class="card" style={{ maxWidth: '760px', cursor: 'default' }}>
        <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>{t('about.body')}</p>
        <p style={{ color: 'var(--muted)', marginTop: '12px', fontSize: '13px' }}>
          Stack: SSR + resumability · server() RPC · ISR (Cache-Tag + revalidate) ·
          configureRPC auth · schema compartido · AI + RAG · i18n (es/en/pt) ·
          pre-build constants.
        </p>
      </div>
    </div>
  );
}

export function AboutPage(): JSX.Element {
  return AboutView();
}
