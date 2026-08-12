/**
 * astra-site — Docs: i18n
 *
 * Página de documentación del módulo built-in @astrajs/i18n, con
 * demos EN VIVO: switcher de idiomas reactivo, pluralización,
 * interpolación y formato Intl.
 */
import { component, store, dynamic } from '@astrajs/core';
import { createI18n, WORLD_LOCALES } from '@astrajs/i18n';
import { DocSidebar } from '../../components/docs-sidebar.js';

const s = `
  .docs-layout{display:flex;min-height:100vh}
  .docs-main{flex:1;margin-left:260px;padding:48px 56px;max-width:860px}
  @media(max-width:960px){.docs-main{margin-left:0;padding:32px 24px}}
  .docs-content h1{font-size:2rem;font-weight:800;color:#f7f7ff;margin-bottom:12px;letter-spacing:-.02em}
  .docs-content h2{font-size:1.3rem;font-weight:700;color:#f7f7ff;margin:40px 0 14px;padding-top:20px;border-top:1px solid rgba(255,255,255,.06);letter-spacing:-.01em}
  .docs-content h2:first-of-type{border-top:none;margin-top:28px}
  .docs-content h3{font-size:1.05rem;font-weight:700;color:#f7f7ff;margin:28px 0 10px}
  .docs-content p{font-size:.88rem;color:#94a3b8;line-height:1.75;margin-bottom:16px}
  .docs-content strong{color:#e2e8f0}
  .docs-content code{background:rgba(139,77,255,.1);color:#c4a0ff;padding:2px 7px;border-radius:4px;font-size:.8rem;font-weight:500;font-family:'JetBrains Mono',monospace}
  .docs-content pre{background:#060b14;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:0;overflow-x:auto;margin-bottom:24px;position:relative}
  .docs-content pre::before{content:'TS';position:absolute;top:0;right:16px;font-size:.62rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.08em;padding:8px 0}
  .docs-content pre code{display:block;background:none;color:#cbd5e1;padding:20px 24px;font-size:.76rem;line-height:1.85;border-radius:0;overflow-x:auto;white-space:pre;tab-size:2}
  .docs-content ul,.docs-content ol{padding-left:24px;margin-bottom:16px}
  .docs-content li{font-size:.88rem;color:#94a3b8;line-height:1.75;margin-bottom:6px}
  .docs-content table{width:100%;border-collapse:collapse;margin-bottom:24px;font-size:.82rem}
  .docs-content th{text-align:left;padding:10px 14px;background:rgba(255,255,255,.03);color:#e2e8f0;font-weight:700;border-bottom:2px solid rgba(255,255,255,.06)}
  .docs-content td{padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.04);color:#94a3b8}
  .docs-content .note{padding:14px 18px;background:rgba(139,77,255,.06);border-left:3px solid rgba(139,77,255,.3);border-radius:0 8px 8px 0;margin-bottom:20px;font-size:.84rem;color:#c4a0ff}
  .docs-content .i18n-demo{background:#060b14;border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:26px;margin-bottom:24px}
  .docs-content .i18n-demo-title{font-size:.72rem;font-weight:800;color:#475569;text-transform:uppercase;letter-spacing:.08em;margin-bottom:16px}
  .docs-content .locale-picker{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:22px}
  .docs-content .locale-btn{padding:7px 14px;border-radius:20px;border:1px solid rgba(255,255,255,.1);background:transparent;color:#94a3b8;font-size:.78rem;font-weight:600;cursor:pointer;transition:all .15s}
  .docs-content .locale-btn:hover{color:#e2e8f0;border-color:rgba(255,255,255,.25)}
  .docs-content .locale-btn.active{background:rgba(184,76,255,.14);border-color:rgba(184,76,255,.5);color:#c4a0ff}
  .docs-content .demo-sentence{font-size:1.25rem;font-weight:700;color:#f7f7ff;margin-bottom:14px;letter-spacing:-.01em}
  .docs-content .demo-secondary{font-size:.88rem;color:#94a3b8;margin-bottom:18px}
  .docs-content .demo-controls{display:flex;align-items:center;gap:10px;margin-bottom:8px}
  .docs-content .demo-btn{width:34px;height:34px;border-radius:9px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);color:#e2e8f0;font-size:1rem;font-weight:700;cursor:pointer;transition:background .15s}
  .docs-content .demo-btn:hover{background:rgba(184,76,255,.15)}
  .docs-content .demo-count{font-size:1.1rem;font-weight:800;color:#c4a0ff;min-width:34px;text-align:center}
  .docs-content .demo-formatted{font-size:.82rem;color:#64748b;line-height:1.8}
`;

/* ── Mensajes de la demo (9 idiomas) ── */
const demoI18n = createI18n({
  locale: 'es',
  fallbackLocale: 'en',
  messages: {
    en: {
      'demo.title': 'Zero JavaScript shipped',
      'demo.subtitle': 'The framework that compiles your JSX to real DOM.',
      'demo.counter': 'You have {count} messages',
      'demo.counter.one': 'You have one message',
      'demo.updated': 'Last update: {date}',
      'demo.visits': 'Visits: {visits}',
    },
    es: {
      'demo.title': 'Cero JavaScript enviado',
      'demo.subtitle': 'El framework que compila tu JSX a DOM real.',
      'demo.counter': 'Tienes {count} mensajes',
      'demo.counter.one': 'Tienes un mensaje',
      'demo.updated': 'Última actualización: {date}',
      'demo.visits': 'Visitas: {visits}',
    },
    pt: {
      'demo.title': 'Zero JavaScript enviado',
      'demo.subtitle': 'O framework que compila seu JSX para DOM real.',
      'demo.counter': 'Você tem {count} mensagens',
      'demo.counter.one': 'Você tem uma mensagem',
      'demo.updated': 'Última atualização: {date}',
      'demo.visits': 'Visitas: {visits}',
    },
    fr: {
      'demo.title': 'Zéro JavaScript envoyé',
      'demo.subtitle': 'Le framework qui compile votre JSX en DOM réel.',
      'demo.counter': 'Vous avez {count} messages',
      'demo.counter.one': 'Vous avez un message',
      'demo.updated': 'Dernière mise à jour : {date}',
      'demo.visits': 'Visites : {visits}',
    },
    it: {
      'demo.title': 'Zero JavaScript inviato',
      'demo.subtitle': 'Il framework che compila il tuo JSX in DOM reale.',
      'demo.counter': 'Hai {count} messaggi',
      'demo.counter.one': 'Hai un messaggio',
      'demo.updated': 'Ultimo aggiornamento: {date}',
      'demo.visits': 'Visite: {visits}',
    },
    de: {
      'demo.title': 'Null JavaScript ausgeliefert',
      'demo.subtitle': 'Das Framework, das dein JSX zu echtem DOM kompiliert.',
      'demo.counter': 'Du hast {count} Nachrichten',
      'demo.counter.one': 'Du hast eine Nachricht',
      'demo.updated': 'Letzte Aktualisierung: {date}',
      'demo.visits': 'Besuche: {visits}',
    },
    ru: {
      'demo.title': 'Ноль отправленного JavaScript',
      'demo.subtitle': 'Фреймворк, компилирующий ваш JSX в реальный DOM.',
      'demo.counter': 'У вас {count} сообщений',
      'demo.counter.one': 'У вас одно сообщение',
      'demo.counter.few': 'У вас {count} сообщения',
      'demo.updated': 'Последнее обновление: {date}',
      'demo.visits': 'Посещения: {visits}',
    },
    ja: {
      'demo.title': 'ゼロJavaScriptを出荷',
      'demo.subtitle': 'JSXを本物のDOMにコンパイルするフレームワーク。',
      'demo.counter': '{count}件のメッセージがあります',
      'demo.updated': '最終更新: {date}',
      'demo.visits': '訪問数: {visits}',
    },
    'zh-CN': {
      'demo.title': '零 JavaScript 交付',
      'demo.subtitle': '将你的 JSX 编译为真实 DOM 的框架。',
      'demo.counter': '你有 {count} 条消息',
      'demo.updated': '最后更新：{date}',
      'demo.visits': '访问量：{visits}',
    },
  },
});

const demoState = store({ count: 3 });

const DATE_FIXED = new Date('2026-08-12T14:30:00');

/** Resuelve el plural (count=2) de UNA locale específica, sin tocar la activa. */
function rowPlural(code: string): string {
  const table = demoI18n.messages[code];
  if (!table) return '—';
  const category = new Intl.PluralRules(code).select(2);
  const message = table[`demo.counter.${category}`] ?? table['demo.counter'] ?? '—';
  return message.replace('{count}', '2');
}

export const DocsI18n = component(() => (
  <div class="docs-layout">
    <style>{s}</style>
    <DocSidebar />
    <main class="docs-main">
      <div class="docs-content">
        <h1>i18n</h1>
        <p><code>@astrajs/i18n</code> {siteI18n.t('id.p.a')}<code>store()</code>{siteI18n.t('id.p.b')}<code>t()</code>{siteI18n.t('id.p.c')}</p>

        <h2 id="demo">{siteI18n.t('sb.i18nDemo')}</h2>
        <div class="i18n-demo">
          <div class="i18n-demo-title">{siteI18n.t('id.demo.sub')}</div>
          <div class="locale-picker">
            {WORLD_LOCALES.map((loc) => (
              <button
                class={`locale-btn${demoI18n.locale === loc.code ? ' active' : ''}`}
                onclick={() => {
                  demoI18n.setLocale(loc.code);
                }}
              >
                {loc.label}
              </button>
            ))}
          </div>
          <div class="demo-sentence">{demoI18n.t('demo.title')}</div>
          <div class="demo-secondary">{demoI18n.t('demo.subtitle')}</div>
          <div class="demo-controls">
            <button class="demo-btn" onclick={() => { demoState.count = Math.max(0, demoState.count - 1); }}>−</button>
            <span class="demo-count">{demoState.count}</span>
            <button class="demo-btn" onclick={() => { demoState.count += 1; }}>+</button>
          </div>
          <div class="demo-sentence" style="font-size:1rem">{demoI18n.t('demo.counter', { count: demoState.count })}</div>
          <div class="demo-formatted">
            <div>{demoI18n.t('demo.updated', { date: demoI18n.d(DATE_FIXED, { dateStyle: 'full', timeStyle: 'short' }) })}</div>
            <div>{demoI18n.t('demo.visits', { visits: demoI18n.n(48201) })}</div>
          </div>
        </div>

        <h2 id="instalacion">{siteI18n.t('sb.install')}</h2>
        <pre><code>{`// package.json
"dependencies": { "@astrajs/i18n": "0.1.0" }

// vite.config.ts
resolve: { alias: { '@astrajs/i18n': '@astrajs/i18n/src' } } // solo monorepo`}</code></pre>

        <h2 id="setup">{siteI18n.t('sb.i18nSetup')}</h2>
        <pre><code>{`import { createI18n } from '@astrajs/i18n';

export const i18n = createI18n({
  locale: 'es',            // idioma inicial
  fallbackLocale: 'en',    // respaldo cuando falta una clave
  messages: {
    en: { 'hero.title': 'Ship zero JavaScript' },
    es: { 'hero.title': 'Cero JavaScript enviado' },
  },
});`}</code></pre>

        <h2 id="reactividad">{siteI18n.t('id.react.title')}</h2>
        <p>{siteI18n.t('id.react.a')}<code>t()</code>{siteI18n.t('id.react.b')}<code>dynamic()</code>{siteI18n.t('id.react.c')}</p>
        <pre><code>{`<h1>{i18n.t('hero.title')}</h1>           // ← solo este nodo cambia
<button onClick={() => i18n.setLocale('en')}>EN</button>`}</code></pre>

        <h2 id="interpolacion">{siteI18n.t('sb.i18nInterp')}</h2>
        <pre><code>{`messages: { es: { greeting: '¡Hola, {name}!' } }

i18n.t('greeting', { name: 'Ada' });  // → "¡Hola, Ada!"`}</code></pre>

        <h2 id="pluralizacion">{siteI18n.t('sb.i18nPlural')}</h2>
        <p>{siteI18n.t('id.plural.a')}<code>{'{count}'}</code>{siteI18n.t('id.plural.b')}<code>t()</code>{siteI18n.t('id.plural.c')}<code>Intl.PluralRules</code>{siteI18n.t('id.plural.d')}<code>key.one</code>{siteI18n.t('id.plural.e')}<code>key.other</code>{siteI18n.t('id.plural.f')}<code>key.few</code>{siteI18n.t('id.plural.g')}<code>key.many</code>{siteI18n.t('id.plural.h')}<code>other</code>{siteI18n.t('id.plural.i')}</p>
        <pre><code>{`messages: {
  es: { 'items.one': 'Un artículo', 'items.other': '{count} artículos' },
  ru: { 'items.one': 'одна статья', 'items.few': '{count} статьи', 'items.other': '{count} статей' },
  ja: { 'items.other': '{count}件' },
},

i18n.t('items', { count: 5 });`}</code></pre>

        <h2 id="formato">{siteI18n.t('sb.i18nFormat')}</h2>
        <p>{siteI18n.t('id.format.p')}</p>
        <pre><code>{`i18n.n(1234567.89);   // es → "1.234.567,89" · en → "1,234,567.89"
i18n.d(new Date());    // fecha con formato local
i18n.l(['TS', 'JSX']); // listas con conjunciones locales
i18n.dir();            // 'rtl' para ar/he/fa/ur, 'ltr' en el resto`}</code></pre>

        <h2 id="idiomas">{siteI18n.t('sb.i18nLangs')}</h2>
        <p>{siteI18n.t('id.langs.a')}<code>Intl</code>{siteI18n.t('id.langs.b')}<code>WORLD_LOCALES</code>{siteI18n.t('id.langs.c')}</p>
        <table>
          <tr><th>{siteI18n.t('id.th1')}</th><th>{siteI18n.t('id.th2')}</th><th>{siteI18n.t('id.th3')}</th></tr>
          {WORLD_LOCALES.map((loc) => (
            <tr>
              <td><code>{loc.code}</code></td>
              <td>{loc.label}</td>
              <td>{rowPlural(loc.code)}</td>
            </tr>
          ))}
        </table>

        <h2 id="sitio">{siteI18n.t('id.site.title')}</h2>
        <p>{siteI18n.t('id.site.a')}<code>astra-site/src/i18n.ts</code>{siteI18n.t('id.site.b')}<code>astra-blog/src/i18n.ts</code>{siteI18n.t('id.site.c')}</p>
      </div>
    </main>
  </div>
));
