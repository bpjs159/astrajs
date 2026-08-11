import { component, store, dynamic } from '@astrajs/core';
import { Link, navigate } from '@astrajs/router';

export const Header = component(() => {
  const state = store({ mobileOpen: false });

  const navStyle = `
    .site-header{position:sticky;top:0;z-index:1000;background:rgba(4,6,13,.55);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-bottom:1px solid rgba(255,255,255,.04)}
    .header-inner{display:flex;align-items:center;justify-content:space-between;height:64px;max-width:1400px;margin:0 auto;padding:0 32px}
    .header-logo{display:flex;align-items:center;gap:12px;cursor:pointer}
    .header-logo img{height:36px;width:auto;object-fit:contain}
    .header-logo span{font-family:'Fauna Pro',serif;font-size:1.25rem;font-weight:700;color:#f7f7ff;letter-spacing:-.02em}
    .header-nav{display:flex;align-items:center;gap:4px}
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
        <a class="header-logo" onclick={() => { navigate('/'); closeMenu(); }}>
          <img src="/images/logo.png" alt="AstraJS" />
          <span>ASTRAJS</span>
        </a>
        <button class="header-mobile-btn" onclick={toggleMenu} aria-label="Menu">
          ☰
        </button>
        <nav class="header-nav">
          <Link href="/docs">Docs</Link>
          <Link href="/docs">Guide</Link>
          <Link href="/docs">API</Link>
          <a href="https://github.com" target="_blank" rel="noopener">GitHub</a>
          <Link href="/docs" class="header-cta">Get Started</Link>
        </nav>
      </div>
      <div class={`header-mobile-menu${state.mobileOpen ? ' open' : ''}`}>
        <Link href="/docs" onclick={closeMenu}>Docs</Link>
        <Link href="/docs" onclick={closeMenu}>Guide</Link>
        <Link href="/docs" onclick={closeMenu}>API</Link>
        <a href="https://github.com" target="_blank" rel="noopener">GitHub</a>
        <Link href="/docs" class="header-cta" onclick={closeMenu}>Get Started</Link>
      </div>
    </header>
  );
});
