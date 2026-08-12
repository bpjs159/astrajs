import { component, store, dynamic } from '@astrajs/core';
import { navigate } from '@astrajs/router';
import { i18n } from '../i18n.js';
import { WORLD_LOCALES } from '@astrajs/i18n';

export const Header = component(() => {
  const state = store({ mobileOpen: false, scrolled: false });

  // Isotype swap on scroll: at the top we show the ASTRAJS wordmark;
  // once the user scrolls, the isotype (logo image) fades in and the
  // wordmark fades out.
  state.scrolled = typeof window !== 'undefined' && window.scrollY > 24;
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY > 24;
      if (scrolled !== state.scrolled) state.scrolled = scrolled;
    }, { passive: true });
  }

  const navStyle = `
    .site-header{position:sticky;top:0;z-index:1000;background:rgba(4,6,13,.55);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-bottom:1px solid rgba(255,255,255,.04)}
    .header-inner{display:flex;align-items:center;justify-content:space-between;height:64px;max-width:100%;margin:0 auto;padding:0 24px}
    .header-logo{display:flex;align-items:center;cursor:pointer;position:relative}
    .header-logo img{position:absolute;left:0;top:50%;height:28px;width:auto;object-fit:contain;opacity:0;transform:translateY(-50%) scale(.8);transition:opacity .3s ease,transform .3s ease;filter:drop-shadow(0 0 20px rgba(184,76,255,.5)) drop-shadow(0 0 50px rgba(77,124,255,.3)) drop-shadow(0 0 90px rgba(0,223,255,.15))}
    .header-logo.scrolled img{opacity:1;transform:translateY(-50%) scale(1)}
    .header-logo::after{content:'';position:absolute;left:-12px;top:50%;transform:translateY(-50%);width:48px;height:48px;background:radial-gradient(circle,rgba(139,77,255,.15) 0%,transparent 70%);border-radius:50%;pointer-events:none;z-index:-1;opacity:0;transition:opacity .3s ease}
    .header-logo.scrolled::after{opacity:1}
    .header-logo span{font-family:'Fauna Pro',serif;font-size:1.25rem;font-weight:500;color:#ffffff;letter-spacing:.06em;text-shadow:0 0 80px rgba(255,255,255,.15),0 0 160px rgba(255,255,255,.05);transition:opacity .3s ease,transform .3s ease}
    .header-logo.scrolled span{opacity:0;transform:translateX(-12px)}
    .header-nav{display:flex;align-items:center;gap:4px}
    .lang-select{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);color:#94a3b8;font-size:.78rem;font-weight:600;padding:7px 10px;border-radius:8px;cursor:pointer;outline:none;transition:border-color .15s,color .15s}
    .lang-select:hover{color:#e2e8f0;border-color:rgba(255,255,255,.25)}
    .lang-select option{background:#060b14;color:#e2e8f0}
    .header-nav a{font-size:.82rem;font-weight:500;color:#94a3b8;padding:6px 14px;border-radius:8px;transition:color .15s,background .15s;letter-spacing:.01em}
    .header-nav a:hover{color:#e2e8f0;background:rgba(255,255,255,.04)}
    .header-cta{font-size:.82rem;font-weight:600;color:#fff;background:linear-gradient(135deg,#8d4dff,#4d7cff);padding:8px 20px;border-radius:8px;transition:opacity .15s,transform .15s,box-shadow .15s;letter-spacing:.01em;cursor:pointer;border:none}
    .header-cta:hover{opacity:.9;transform:translateY(-1px);box-shadow:0 4px 20px rgba(139,77,255,.3)}
    .header-mobile-btn{display:none;background:none;border:none;color:#e2e8f0;font-size:1.5rem;cursor:pointer;padding:4px}
    .header-mobile-menu{display:none;flex-direction:column;padding:12px 24px 24px;background:rgba(4,6,13,.95);border-bottom:1px solid rgba(255,255,255,.06)}
    .header-mobile-menu a,.header-mobile-menu .header-cta{display:block;padding:10px 0;font-size:.9rem;text-align:center}
    .header-mobile-menu .header-cta{margin-top:8px}
    @media(max-width:768px){
      .header-nav{display:none}
      .header-mobile-btn{display:block}
      .header-mobile-menu.open{display:flex}
    }
  `;

  const toggleMenu = () => { state.mobileOpen = !state.mobileOpen; };
  const closeMenu = () => { state.mobileOpen = false; };

  return (
    <header class="site-header">
      <style>{navStyle}</style>
      <div class="header-inner">
        <a class={`header-logo${state.scrolled ? ' scrolled' : ''}`} onclick={() => { navigate('/'); closeMenu(); }}>
          <img src="/images/logo.png" alt="AstraJS" />
          <span>ASTRA<span style="background:linear-gradient(135deg,#8d4dff,#4d7cff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">JS</span></span>
        </a>
        <button class="header-mobile-btn" onclick={toggleMenu} aria-label="Menu">
          ☰
        </button>
        <nav class="header-nav">
          <a href="/docs/introduction" onclick={(e: Event) => { e.preventDefault(); navigate('/docs/introduction'); }}>{i18n.t('nav.docs')}</a>
          <a href="/docs/introduction" onclick={(e: Event) => { e.preventDefault(); navigate('/docs/introduction'); }}>{i18n.t('nav.guide')}</a>
          <a href="/docs/server-data" onclick={(e: Event) => { e.preventDefault(); navigate('/docs/server-data'); }}>API</a>
          <a href="/docs/examples" onclick={(e: Event) => { e.preventDefault(); navigate('/docs/examples'); }}>{i18n.t('nav.examples')}</a>
          <a href="https://github.com" target="_blank" rel="noopener">GitHub</a>
          <select
            class="lang-select"
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
          <a href="/docs/introduction" class="header-cta" onclick={(e: Event) => { e.preventDefault(); navigate('/docs/introduction'); }}>{i18n.t('nav.getStarted')}</a>
        </nav>
      </div>
      <div class={`header-mobile-menu${state.mobileOpen ? ' open' : ''}`}>
        <a href="/docs/introduction" onclick={(e: Event) => { e.preventDefault(); navigate('/docs/introduction'); closeMenu(); }}>{i18n.t('nav.docs')}</a>
        <a href="/docs/introduction" onclick={(e: Event) => { e.preventDefault(); navigate('/docs/introduction'); closeMenu(); }}>{i18n.t('nav.guide')}</a>
        <a href="/docs/server-data" onclick={(e: Event) => { e.preventDefault(); navigate('/docs/server-data'); closeMenu(); }}>API</a>
        <a href="/docs/examples" onclick={(e: Event) => { e.preventDefault(); navigate('/docs/examples'); closeMenu(); }}>{i18n.t('nav.examples')}</a>
        <a href="https://github.com" target="_blank" rel="noopener">GitHub</a>
        <select
          class="lang-select"
          style="margin:10px 0;text-align:center"
          aria-label="Language"
          value={i18n.locale}
          onchange={(e: Event) => {
            i18n.setLocale((e.target as HTMLSelectElement).value);
            closeMenu();
          }}
        >
          {WORLD_LOCALES.map((loc) => (
            <option value={loc.code} selected={i18n.locale === loc.code}>
              {loc.label}
            </option>
          ))}
        </select>
        <a href="/docs/introduction" class="header-cta" onclick={(e: Event) => { e.preventDefault(); navigate('/docs/introduction'); closeMenu(); }}>{i18n.t('nav.getStarted')}</a>
      </div>
    </header>
  );
});
