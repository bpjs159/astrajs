import { component } from '@astrajs/core';
import { Link } from '@astrajs/router';
import { routes } from './routes.js';
import { HomePage } from './pages/home.js';
import { AboutPage } from './pages/about.js';

const style = document.createElement('style');
style.textContent = `
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
  .header .brand { font-weight: 800; letter-spacing: 0.02em; }
  .header nav { display: flex; gap: 16px; }
  .header nav a { font-size: 0.85rem; color: #94a3b8; }
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
      <span class="brand">ASTRAJS</span>
      <nav>
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
      </nav>
    </header>
    <main>
      {(() => {
        if (routes.home) return <HomePage />;
        if (routes.about) return <AboutPage />;
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
