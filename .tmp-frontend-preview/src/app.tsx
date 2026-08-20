import { component } from 'astrajs.dev/core';
import { Link } from 'astrajs.dev/router';
import { routes } from './routes.js';
import { HomePage } from './pages/home.js';
import { AboutPage } from './pages/about.js';
import { ContactPage } from './pages/contact.js';

const style = document.createElement('style');
style.textContent = `
  /* === FONTS (loaded from astrajs.dev) === */
  @font-face {
    font-family: 'Fauna Pro';
    src: url('https://astrajs.dev/fonts/fauna/FaunaPro-Regular.ttf') format('truetype');
    font-weight: 400;
    font-style: normal;
  }
  @font-face {
    font-family: 'Fauna Pro';
    src: url('https://astrajs.dev/fonts/fauna/FaunaPro-Medium.ttf') format('truetype');
    font-weight: 500;
    font-style: normal;
  }
  @font-face {
    font-family: 'Fauna Pro';
    src: url('https://astrajs.dev/fonts/fauna/FaunaPro-Semibold.ttf') format('truetype');
    font-weight: 600;
    font-style: normal;
  }
  @font-face {
    font-family: 'Fauna Pro';
    src: url('https://astrajs.dev/fonts/fauna/FaunaPro-Bold.ttf') format('truetype');
    font-weight: 700;
    font-style: normal;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: system-ui, sans-serif; background: #04060d; color: #e2e8f0; }
  a { color: inherit; text-decoration: none; }

  .header {
    position: sticky; top: 0;
    background: rgba(4, 6, 13, 0.7);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    padding: 16px 32px;
    display: flex; align-items: center; gap: 24px;
  }
  .header .brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
  .brand-word {
    font-family: 'Fauna Pro', serif;
    font-weight: 500;
    letter-spacing: 0.06em;
    line-height: 1;
    color: #fff;
  }
  .brand-js {
    background: linear-gradient(135deg, #8d4dff, #4d7cff);
    -webkit-background-clip: text; background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .header nav { display: flex; align-items: center; gap: 16px; }
  .header nav a { font-size: 0.85rem; line-height: 1; color: #94a3b8; }
  .header nav a:hover { color: #e2e8f0; }

  .page { max-width: 720px; margin: 0 auto; padding: 64px 32px; }
  .page h1 {
    font-size: 2rem; font-weight: 800; margin-bottom: 12px;
    background: linear-gradient(135deg, #b84cff, #4d7cff);
    -webkit-background-clip: text; background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .page p { color: #94a3b8; line-height: 1.7; margin-bottom: 16px; }
`;
document.head.appendChild(style);

export const App = component(() => (
  <div>
    <header class="header">
      <a class="brand" href="/">
        <span class="brand-word">ASTRA<span class="brand-js">JS</span></span>
      </a>
      <nav>
        <Link href="/">Home</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/about">About</Link>
      </nav>
    </header>
    <main>
      {(() => {
        if (routes.home) return <HomePage />;
        if (routes.about) return <AboutPage />;
        if (routes.contact) return <ContactPage />;
        return (
          <div class="page">
            <h1>404</h1>
            <p>Page not found. <Link href="/">Go home</Link></p>
          </div>
        );
      })()}
    </main>
  </div>
));

const root = document.getElementById('app');
if (root) {
  root.appendChild(App({}) as unknown as Node);
}
